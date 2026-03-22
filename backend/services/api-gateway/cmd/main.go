package main

import (
	"log"
	"net/http"
	"os"

	"github.com/exponat/api-gateway/internal/config"
	"github.com/exponat/api-gateway/internal/handlers"
	"github.com/exponat/api-gateway/internal/middleware"
)

func main() {
	cfg := config.Load()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handlers.HealthCheck)
	mux.HandleFunc("GET /api/v1/", handlers.ProxyHandler(cfg))

	handler := middleware.CORS(middleware.Logger(middleware.RateLimit(mux)))

	addr := ":" + cfg.Port
	log.Printf("API Gateway starting on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
