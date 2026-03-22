package handlers

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/exponat/api-gateway/internal/config"
)

func ProxyHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		var targetURL string
		switch {
		case strings.HasPrefix(path, "/api/v1/projects"):
			targetURL = cfg.ProjectsURL
		case strings.HasPrefix(path, "/api/v1/budget"):
			targetURL = cfg.BudgetURL
		case strings.HasPrefix(path, "/api/v1/dashboard"):
			targetURL = cfg.DashboardURL
		case strings.HasPrefix(path, "/api/v1/ai"):
			targetURL = cfg.AIDocumentGenURL
		default:
			http.NotFound(w, r)
			return
		}

		target, err := url.Parse(targetURL)
		if err != nil {
			http.Error(w, "Bad gateway", http.StatusBadGateway)
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(target)
		proxy.ServeHTTP(w, r)
	}
}
