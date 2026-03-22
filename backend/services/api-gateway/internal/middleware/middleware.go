package middleware

import (
	"log"
	"net/http"
	"sync"
	"time"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
}

type visitor struct {
	count    int
	lastSeen time.Time
}

var limiter = &rateLimiter{visitors: make(map[string]*visitor)}

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		limiter.mu.Lock()
		v, exists := limiter.visitors[ip]
		if !exists || time.Since(v.lastSeen) > time.Minute {
			limiter.visitors[ip] = &visitor{count: 1, lastSeen: time.Now()}
			limiter.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		v.count++
		v.lastSeen = time.Now()
		if v.count > 100 {
			limiter.mu.Unlock()
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		limiter.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}
