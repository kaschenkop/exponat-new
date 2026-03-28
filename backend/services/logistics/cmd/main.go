package main

import (
	"log"
	"os"

	"github.com/exponat/logistics/internal/config"
	"github.com/exponat/logistics/internal/handlers"
)

func main() {
	cfg := config.Load()
	h := handlers.New()
	addr := ":" + cfg.Port
	log.Printf("Logistics service starting on %s", addr)
	if err := h.ListenAndServe(addr); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
