package main

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"time"

	"exponat/projects"
	"exponat/projects/internal/middleware"
	"exponat/projects/pkg/db"

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

	hub := projects.NewHub()
	go hub.Run()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(ginLogger())
	r.Use(cors.New(buildCORSConfig()))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "projects"})
	})

	api := r.Group("/api")
	api.Use(middleware.GatewayContextMiddleware())
	projects.Mount(api, database, hub)

	addr := ":8081"
	if v := os.Getenv("PORT"); v != "" {
		addr = ":" + v
	}
	slog.Info("projects service listening", "addr", addr)
	if err := r.Run(addr); err != nil {
		slog.Error("server", "err", err)
		os.Exit(1)
	}
}

// buildCORSConfig: localhost по умолчанию; для staging/prod задайте CORS_ALLOWED_ORIGINS (через запятую).
// Поддерживается один '*' на паттерн (gin-contrib/cors), напр. https://*.staging.exponat.site
func buildCORSConfig() cors.Config {
	origins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	wildcard := false
	if v := os.Getenv("CORS_ALLOWED_ORIGINS"); v != "" {
		for _, part := range strings.Split(v, ",") {
			o := strings.TrimSpace(part)
			if o == "" {
				continue
			}
			origins = append(origins, o)
			if strings.Contains(o, "*") {
				wildcard = true
			}
		}
	}
	return cors.Config{
		AllowOrigins:     origins,
		AllowWildcard:    wildcard,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Organization-Id", "X-User-Id"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
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
