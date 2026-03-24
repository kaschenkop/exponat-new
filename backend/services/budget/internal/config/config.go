package config

import (
	"log"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	RedisAddr   string
}

func Load() *Config {
	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		if os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
			log.Fatal("DATABASE_URL is required in Kubernetes (envFrom secret exponat-backend-env)")
		}
		dbURL = "postgres://postgres:postgres@localhost:5432/exponat_dev?sslmode=disable"
	}
	return &Config{
		Port:        getEnv("PORT", "8082"),
		DatabaseURL: dbURL,
		RedisAddr:   getEnv("REDIS_ADDR", "localhost:6379"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
