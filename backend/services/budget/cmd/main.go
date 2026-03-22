package main

import (
	"log"
	"os"

	"github.com/exponat/budget/internal/config"
	"github.com/exponat/budget/internal/handlers"
	"github.com/exponat/budget/pkg/db"
)

func main() {
	cfg := config.Load()

	pool, err := db.NewPostgresPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	handler := handlers.New(pool)

	addr := ":" + cfg.Port
	log.Printf("Budget service starting on %s", addr)
	if err := handler.ListenAndServe(addr); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
