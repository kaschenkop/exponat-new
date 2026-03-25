package middleware

import (
	"context"
	"errors"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type keycloakClaims struct {
	OrganizationID any `json:"organization_id"`
	RealmAccess    struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
	ResourceAccess map[string]struct {
		Roles []string `json:"roles"`
	} `json:"resource_access"`
	jwt.RegisteredClaims
}

var (
	jwksMu      sync.Mutex
	cachedKeyfn keyfunc.Keyfunc
)

func resolveJWKSURL() string {
	if u := strings.TrimSpace(os.Getenv("JWT_JWKS_URL")); u != "" {
		return u
	}
	iss := strings.TrimSpace(os.Getenv("OIDC_ISSUER"))
	if iss == "" {
		return ""
	}
	return strings.TrimRight(iss, "/") + "/protocol/openid-connect/certs"
}

func apiClientID() string {
	if v := strings.TrimSpace(os.Getenv("KEYCLOAK_API_CLIENT_ID")); v != "" {
		return v
	}
	return "exponat-api"
}

func orgFromClaims(c *keycloakClaims) string {
	switch v := c.OrganizationID.(type) {
	case string:
		return v
	case []any:
		if len(v) > 0 {
			if s, ok := v[0].(string); ok {
				return s
			}
		}
	}
	return ""
}

func ensureJWKS() (jwt.Keyfunc, error) {
	jwksMu.Lock()
	defer jwksMu.Unlock()
	if cachedKeyfn != nil {
		return cachedKeyfn.Keyfunc, nil
	}
	u := resolveJWKSURL()
	if u == "" {
		return nil, errors.New("OIDC_ISSUER or JWT_JWKS_URL not set")
	}
	k, err := keyfunc.NewDefaultOverrideCtx(
		context.Background(),
		[]string{u},
		keyfunc.Override{
			HTTPTimeout: 15 * time.Second,
			Client:      &http.Client{Timeout: 15 * time.Second},
		},
	)
	if err != nil {
		return nil, err
	}
	cachedKeyfn = k
	return k.Keyfunc, nil
}

func setAuthContext(c *gin.Context, userID, orgID string, roles, permissions []string) {
	c.Set("userId", userID)
	c.Set("organizationId", orgID)
	c.Set("roles", roles)
	c.Set("permissions", permissions)
}

func AuthMiddleware() gin.HandlerFunc {
	secret := []byte(os.Getenv("JWT_SECRET"))
	skip := os.Getenv("SKIP_AUTH") == "true" || os.Getenv("SKIP_AUTH") == "1"
	jwksConfigured := resolveJWKSURL() != ""

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
			setAuthContext(c, uid, org, []string{}, []string{})
			c.Next()
			return
		}

		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		raw := strings.TrimPrefix(h, "Bearer ")

		if jwksConfigured {
			keyFn, err := ensureJWKS()
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "jwks unavailable"})
				return
			}
			claims := &keycloakClaims{}
			opts := []jwt.ParserOption{}
			if iss := strings.TrimSpace(os.Getenv("OIDC_ISSUER")); iss != "" {
				opts = append(opts, jwt.WithIssuer(iss))
			}
			tok, err := jwt.ParseWithClaims(raw, claims, keyFn, opts...)
			if err != nil || !tok.Valid {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
				return
			}
			uid := claims.Subject
			if uid == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing sub"})
				return
			}
			org := orgFromClaims(claims)
			if org == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "organization_id claim required"})
				return
			}
			perms := []string{}
			if ra, ok := claims.ResourceAccess[apiClientID()]; ok {
				perms = ra.Roles
			}
			setAuthContext(c, uid, org, claims.RealmAccess.Roles, perms)
			c.Next()
			return
		}

		if len(secret) == 0 {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "configure OIDC_ISSUER or JWT_JWKS_URL, or JWT_SECRET, or SKIP_AUTH"})
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

		mapClaims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		uid, _ := mapClaims["userId"].(string)
		if uid == "" {
			uid, _ = mapClaims["sub"].(string)
		}
		org, _ := mapClaims["organizationId"].(string)
		if org == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "organizationId claim required"})
			return
		}
		if uid == "" {
			uid = "00000000-0000-0000-0000-000000000001"
		}

		setAuthContext(c, uid, org, []string{}, []string{})
		c.Next()
	}
}
