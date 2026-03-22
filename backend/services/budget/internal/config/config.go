package config

import "os"

type Config struct {
	Port        string
	DatabaseURL string
	RedisAddr   string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8082"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/exponat_dev?sslmode=disable"),
		RedisAddr:   getEnv("REDIS_ADDR", "localhost:6379"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
