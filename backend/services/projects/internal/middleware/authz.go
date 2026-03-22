package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, exists := c.Get("permissions")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "no permissions in context"})
			return
		}
		perms, ok := raw.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid permissions format"})
			return
		}
		for _, p := range perms {
			if p == permission {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("missing permission: %s", permission)})
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, exists := c.Get("roles")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "no roles in context"})
			return
		}
		roles, ok := raw.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid roles format"})
			return
		}
		for _, r := range roles {
			if r == role {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("missing role: %s", role)})
	}
}
