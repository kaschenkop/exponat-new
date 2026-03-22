package projects

import (
	"exponat/projects/internal/handlers"
	"exponat/projects/internal/repository"
	"exponat/projects/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Mount регистрирует маршруты /api/projects/* на переданной группе (родитель уже с префиксом /api).
func Mount(r *gin.RouterGroup, pool *pgxpool.Pool, hub *Hub) {
	repo := repository.NewProjectRepository(pool)
	svc := services.NewProjectService(repo, hub)
	h := handlers.New(svc, hub)
	h.Register(r)

	taskRepo := repository.NewTaskRepository(pool)
	taskSvc := services.NewTaskService(taskRepo, svc, hub)
	th := handlers.NewTaskHandlers(taskSvc)
	th.Register(r.Group("/projects"))
}
