package middleware

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// GatewayContextMiddleware: JWT проверяет только Kong. Здесь только читаем payload
// (после Kong токен уже валиден). Для dev — SKIP_AUTH как раньше.
func GatewayContextMiddleware() gin.HandlerFunc {
	skip := os.Getenv("SKIP_AUTH") == "true" || os.Getenv("SKIP_AUTH") == "1"

	return func(c *gin.Context) {
		if skip {
			org := c.GetHeader("X-Organization-Id")
			if org == "" {
				org = c.Query("organizationId")
			}
			if org == "" {
				org = os.Getenv("DEFAULT_ORGANIZATION_ID")
			}
			if org == "" {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "X-Organization-Id header or DEFAULT_ORGANIZATION_ID required when SKIP_AUTH is enabled"})
				return
			}
			uid := c.GetHeader("X-User-Id")
			if uid == "" {
				uid = c.Query("userId")
			}
			if uid == "" {
				uid = "00000000-0000-0000-0000-000000000001"
			}
			c.Set("userId", uid)
			c.Set("organizationId", org)
			c.Set("roles", []string{})
			c.Set("permissions", []string{})
			c.Next()
			return
		}

		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		raw := strings.TrimPrefix(h, "Bearer ")
		payload, err := decodeJWTPayload(raw)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
			return
		}
		uid, _ := payload["sub"].(string)
		if uid == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing sub"})
			return
		}
		org := organizationFromPayload(payload)
		if org == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "organization_id claim required"})
			return
		}
		c.Set("userId", uid)
		c.Set("organizationId", org)
		c.Set("roles", []string{})
		c.Set("permissions", []string{})
		c.Next()
	}
}

func decodeJWTPayload(raw string) (map[string]any, error) {
	parts := strings.Split(raw, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid jwt")
	}
	b, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}
	var m map[string]any
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return m, nil
}

func organizationFromPayload(payload map[string]any) string {
	switch v := payload["organization_id"].(type) {
	case string:
		return strings.TrimSpace(v)
	case []any:
		if len(v) > 0 {
			if s, ok := v[0].(string); ok {
				return strings.TrimSpace(s)
			}
		}
	}
	return ""
}
