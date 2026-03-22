package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	secret := []byte(os.Getenv("JWT_SECRET"))
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
			c.Next()
			return
		}

		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		raw := strings.TrimPrefix(h, "Bearer ")
		if len(secret) == 0 {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "JWT_SECRET not configured"})
			return
		}

		tok, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return secret, nil
		})
		if err != nil || !tok.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		uid, _ := claims["userId"].(string)
		if uid == "" {
			uid, _ = claims["sub"].(string)
		}
		org, _ := claims["organizationId"].(string)
		if org == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "organizationId claim required"})
			return
		}
		if uid == "" {
			uid = "00000000-0000-0000-0000-000000000001"
		}

		c.Set("userId", uid)
		c.Set("organizationId", org)
		c.Next()
	}
}
