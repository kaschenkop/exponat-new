package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"exponat/dashboard/internal/handlers"
	"exponat/dashboard/internal/middleware"
	"exponat/dashboard/internal/repository"
	"exponat/dashboard/internal/services"
	"exponat/dashboard/pkg/cache"
	"exponat/dashboard/pkg/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	ctx := context.Background()
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	database, err := db.Connect(ctx)
	if err != nil {
		slog.Error("postgres", "err", err)
		os.Exit(1)
	}
	defer database.Close()

	repo := repository.NewDashboardRepository(database)

	redisCache, err := cache.NewRedisCache(ctx)
	if err != nil {
		slog.Warn("redis unavailable, stats cache disabled", "err", err)
		redisCache = cache.NewNoopCache()
	} else {
		defer redisCache.Close()
	}

	dashboardSvc := services.NewDashboardService(repo, redisCache)
	dashboardHandlers := handlers.NewDashboardHandlers(dashboardSvc)

	projectRepo := repository.NewProjectRepository(database)
	projectSvc := services.NewProjectService(projectRepo, redisCache)
	projectHandlers := handlers.NewProjectHandlers(projectSvc)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(ginLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Organization-Id", "X-User-Id"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/api/projects/ws", projectHandlers.CollaborationWS(redisCache))

	projects := r.Group("/api/projects")
	projects.Use(middleware.AuthMiddleware())
	{
		projects.GET("", projectHandlers.List)
		projects.POST("", projectHandlers.Create)
		projects.PATCH("/:id/status", projectHandlers.PatchStatus)
		projects.PATCH("/:id/phases/:phaseId", projectHandlers.PatchPhase)
		projects.GET("/:id", projectHandlers.Get)
		projects.PATCH("/:id", projectHandlers.Update)
		projects.DELETE("/:id", projectHandlers.Delete)
	}

	api := r.Group("/api/dashboard")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/stats", dashboardHandlers.GetStats)
		api.GET("/recent-projects", dashboardHandlers.GetRecentProjects)
		api.GET("/budget-trend", dashboardHandlers.GetBudgetTrend)
		api.GET("/upcoming-events", dashboardHandlers.GetUpcomingEvents)
		api.GET("/activity", dashboardHandlers.GetActivity)
	}

	addr := ":8080"
	if v := os.Getenv("PORT"); v != "" {
		addr = ":" + v
	}
	slog.Info("dashboard service listening", "addr", addr)
	if err := r.Run(addr); err != nil {
		slog.Error("server", "err", err)
		os.Exit(1)
	}
}

func ginLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		slog.Info("http",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"latency_ms", time.Since(start).Milliseconds(),
		)
	}
}
