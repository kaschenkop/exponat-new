package config

import "os"

type Config struct {
	Port             string
	ProjectsURL      string
	BudgetURL        string
	DashboardURL     string
	AIDocumentGenURL string
	JWTSecret        string
}

func Load() *Config {
	return &Config{
		Port:             getEnv("PORT", "8080"),
		ProjectsURL:      getEnv("PROJECTS_SERVICE_URL", "http://localhost:8081"),
		BudgetURL:        getEnv("BUDGET_SERVICE_URL", "http://localhost:8082"),
		DashboardURL:     getEnv("DASHBOARD_SERVICE_URL", "http://localhost:8083"),
		AIDocumentGenURL: getEnv("AI_DOCUMENT_GEN_URL", "http://localhost:8090"),
		JWTSecret:        getEnv("JWT_SECRET", "dev-secret"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
