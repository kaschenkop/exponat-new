# AUTHENTICATION & AUTHORIZATION - PRODUCTION SOLUTION

## TL;DR

**Решение:** **Keycloak** (Open Source Identity and Access Management)

**Почему:** Production-ready IAM система, используется Red Hat, Cisco, Lufthansa. Покрывает все потребности: OAuth 2.0, SSO, MFA, RBAC, интеграция с LDAP/AD, готовая Admin UI.

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор решения](#обзор-решения)
2. [Сравнение опций](#сравнение-опций)
3. [Архитектура Keycloak](#архитектура-keycloak)
4. [User Flow](#user-flow)
5. [RBAC Model](#rbac-model)
6. [Интеграция с Frontend](#интеграция-с-frontend)
7. [Интеграция с Backend](#интеграция-с-backend)
8. [SSO для корпораций](#sso-для-корпораций)
9. [MFA (Multi-Factor Authentication)](#mfa-multi-factor-authentication)
10. [Session Management](#session-management)
11. [Deployment](#deployment)
12. [Monitoring & Security](#monitoring--security)

---

## 🎯 ОБЗОР РЕШЕНИЯ

### Выбранный стек

```
┌─────────────────────────────────────────────────────────┐
│                    Keycloak                              │
│         (Identity and Access Management)                │
│                                                          │
│  • OAuth 2.0 / OpenID Connect                           │
│  • Single Sign-On (SSO)                                 │
│  • Multi-Factor Authentication (MFA)                    │
│  • User Federation (LDAP/AD)                            │
│  • Social Login (Google, Yandex, VK)                    │
│  • Role-Based Access Control (RBAC)                     │
│  • Admin Console                                         │
└─────────────────────────────────────────────────────────┘
              │
              ├──> Frontend (Next.js + NextAuth.js)
              ├──> Backend Services (JWT validation)
              └──> Kong Gateway (JWT plugin)
```

### Почему Keycloak?

**Преимущества:**
- ✅ **Production-ready** (используется тысячами компаний)
- ✅ **Open Source** (бесплатно, no vendor lock-in)
- ✅ **Полнофункциональный** (OAuth 2.0, SSO, MFA, RBAC из коробки)
- ✅ **Масштабируемый** (кластеризация, HA)
- ✅ **Расширяемый** (SPI для кастомизации)
- ✅ **Admin UI** (готовая консоль управления)
- ✅ **Social Login** (Google, Facebook, GitHub, etc.)
- ✅ **User Federation** (LDAP, Active Directory)
- ✅ **Стандарты** (OAuth 2.0, OIDC, SAML)
- ✅ **Large community** (активная разработка)

**Используют:**
- Red Hat (владелец)
- Cisco
- Lufthansa
- BMW
- Сотни enterprise компаний

---

## 🔄 СРАВНЕНИЕ ОПЦИЙ

### 1. Keycloak ✅ РЕКОМЕНДУЕТСЯ

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| **Production-ready** | ✅ Отлично | Проверено в enterprise |
| **Функциональность** | ✅ Отлично | OAuth 2.0, SSO, MFA, RBAC, LDAP |
| **Стоимость** | ✅ Бесплатно | Open Source |
| **Поддержка** | ✅ Отлично | Large community + Red Hat |
| **Масштабируемость** | ✅ Отлично | Кластеризация, HA |
| **UI** | ✅ Отлично | Admin Console + User Account |
| **Интеграции** | ✅ Отлично | Social login, LDAP, SAML |
| **Кастомизация** | ✅ Хорошо | SPI, темы |
| **Документация** | ✅ Отлично | Подробная |

**Verdict:** ✅ **Лучший выбор**

---

### 2. Auth0 (Okta)

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| **Production-ready** | ✅ Отлично | SaaS решение |
| **Функциональность** | ✅ Отлично | Всё есть |
| **Стоимость** | ❌ Дорого | $240-1680/мес + per user |
| **Поддержка** | ✅ Отлично | Enterprise support |
| **Vendor lock-in** | ❌ Да | Привязка к Auth0 |
| **Данные в РФ** | ❌ Нет | Проблемы с 152-ФЗ |

**Verdict:** ❌ Дорого + vendor lock-in + проблемы с 152-ФЗ

---

### 3. AWS Cognito / Yandex ID

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| **Production-ready** | ✅ Хорошо | Managed service |
| **Функциональность** | ⚠️ Средне | Базовый функционал |
| **Стоимость** | ⚠️ Средне | Pay-per-user |
| **Vendor lock-in** | ❌ Да | AWS/Yandex |
| **Кастомизация** | ⚠️ Ограничена | Меньше гибкости |

**Verdict:** ⚠️ Подходит для простых случаев, но меньше контроля

---

### 4. Custom Auth Service

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| **Production-ready** | ❌ Нет | Нужно разрабатывать |
| **Функциональность** | ❌ Нет | Всё с нуля |
| **Стоимость** | ❌ Дорого | 6+ месяцев разработки |
| **Безопасность** | ❌ Риск | Легко сделать ошибки |
| **Поддержка** | ❌ Сами | Нужна команда |

**Verdict:** ❌ **Никогда не делай**

---

## 🏗️ АРХИТЕКТУРА KEYCLOAK

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         USERS                                 │
│  Web Browser │ Mobile App │ Desktop App │ 3rd Party Service  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    KEYCLOAK CLUSTER                          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Keycloak 1 │  │ Keycloak 2 │  │ Keycloak 3 │  (HA)    │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  Realms:                                                     │
│  ├─ exponat-production   (Production)                       │
│  ├─ exponat-staging      (Staging)                          │
│  └─ exponat-development  (Development)                      │
│                                                              │
│  Features:                                                   │
│  • OAuth 2.0 / OpenID Connect                               │
│  • SSO (Single Sign-On)                                     │
│  • MFA (TOTP, SMS, Email)                                   │
│  • Social Login (Google, Yandex, VK)                        │
│  • User Federation (LDAP, Active Directory)                 │
│  • RBAC (Roles & Permissions)                               │
│  • Session Management                                        │
│  • Admin Console                                             │
└──────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │PostgreSQL│  │  Redis   │  │  SMTP    │
         │  (Users, │  │ (Sessions│  │  (Email) │
         │   Roles) │  │   Cache) │  │          │
         └──────────┘  └──────────┘  └──────────┘
```

### Keycloak Components

**Realms:**
- Изолированные пространства для разных окружений
- `exponat-production` - production users
- `exponat-staging` - staging/testing
- `exponat-development` - local development

**Clients:**
- `exponat-web` - Next.js frontend (Public client, PKCE)
- `exponat-mobile` - Mobile app (Public client)
- `exponat-api` - Backend services (Confidential client)
- `exponat-admin` - Admin panel (Confidential client)

**User Federation:**
- LDAP (для корпоративных клиентов)
- Active Directory (для Windows окружений)
- Custom providers (через SPI)

**Identity Providers:**
- Google OAuth
- Yandex ID
- VK Connect
- Custom SAML/OIDC providers

---

## 👤 USER FLOW

### 1. Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Click "Регистрация"
     ▼
┌──────────────┐
│   Frontend   │
│   (Next.js)  │
└────┬─────────┘
     │ 2. Redirect to Keycloak
     │    /realms/exponat/protocol/openid-connect/registrations
     ▼
┌──────────────┐
│   Keycloak   │
│ Registration │
│     Form     │
└────┬─────────┘
     │ 3. User fills form:
     │    • Email
     │    • Password
     │    • Name
     │    • Organization (optional)
     │ 4. Keycloak validates
     │ 5. Create user
     │ 6. Send verification email
     ▼
┌──────────────┐
│  User Email  │
│  Verification│
└────┬─────────┘
     │ 7. Click verification link
     ▼
┌──────────────┐
│   Keycloak   │
│   Verifies   │
└────┬─────────┘
     │ 8. Redirect to login
     ▼
┌──────────────┐
│    Login     │
└──────────────┘
```

### 2. Login Flow (Authorization Code Flow with PKCE)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Click "Войти"
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 2. Generate PKCE challenge
     │    code_verifier = random(43-128 chars)
     │    code_challenge = SHA256(code_verifier)
     │
     │ 3. Redirect to Keycloak:
     │    /authorize?
     │      client_id=exponat-web
     │      redirect_uri=https://exponat.site/callback
     │      response_type=code
     │      scope=openid profile email
     │      code_challenge=<challenge>
     │      code_challenge_method=S256
     ▼
┌──────────────┐
│   Keycloak   │
│  Login Page  │
└────┬─────────┘
     │ 4. User enters credentials
     │    OR clicks "Google" / "Yandex"
     │ 5. Keycloak validates
     │ 6. Check if MFA enabled
     │    YES → Show TOTP/SMS form
     │    NO  → Continue
     │ 7. Generate authorization code
     │ 8. Redirect to callback:
     │    https://exponat.site/callback?code=ABC123
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 9. Exchange code for tokens:
     │    POST /token
     │      grant_type=authorization_code
     │      code=ABC123
     │      code_verifier=<verifier>
     │      client_id=exponat-web
     │      redirect_uri=https://exponat.site/callback
     ▼
┌──────────────┐
│   Keycloak   │
└────┬─────────┘
     │ 10. Validate code_verifier
     │ 11. Issue tokens:
     │     • access_token (JWT, 15 min)
     │     • refresh_token (7 days)
     │     • id_token (user info)
     ▼
┌──────────────┐
│   Frontend   │
│ Store tokens │
│ (httpOnly    │
│  cookies)    │
└──────────────┘
```

### 3. Token Refresh Flow

```
┌──────────────┐
│   Frontend   │ Access token expires (15 min)
└────┬─────────┘
     │ 1. POST /token
     │    grant_type=refresh_token
     │    refresh_token=XYZ789
     │    client_id=exponat-web
     ▼
┌──────────────┐
│   Keycloak   │
└────┬─────────┘
     │ 2. Validate refresh_token
     │ 3. Check if session still valid
     │ 4. Issue new tokens:
     │    • access_token (new, 15 min)
     │    • refresh_token (new, 7 days)
     ▼
┌──────────────┐
│   Frontend   │
│ Update tokens│
└──────────────┘
```

### 4. SSO Flow (для корпоративных клиентов)

```
Employee → Corporate Login Page
             ↓
         SAML Request to Corporate IDP
             ↓
         Employee authenticates (AD/LDAP)
             ↓
         SAML Response to Keycloak
             ↓
         Keycloak validates SAML
             ↓
         Create/Update user in Keycloak
             ↓
         Issue OAuth tokens
             ↓
         Redirect to Exponat with tokens
```

---

## 🔐 RBAC MODEL

### Roles Hierarchy

```
Organization
├── Admin                    # Полный доступ к организации
│   ├── Create/Edit/Delete projects
│   ├── Manage team (add/remove users)
│   ├── Manage billing
│   ├── View all data
│   └── Manage integrations
│
├── Manager                  # Управление проектами
│   ├── Create/Edit projects
│   ├── Assign tasks
│   ├── View budgets
│   ├── Manage team (in assigned projects)
│   └── View reports
│
├── Coordinator              # Координация работ
│   ├── Edit assigned projects
│   ├── Update tasks
│   ├── View budgets (readonly)
│   ├── Upload files
│   └── Add participants
│
├── Designer                 # Дизайн и планирование
│   ├── Edit space planning
│   ├── Upload designs
│   ├── View projects (readonly)
│   └── Comment on tasks
│
├── Logistics                # Логистика экспонатов
│   ├── Manage exhibits
│   ├── Track shipments
│   ├── Update locations
│   └── View projects (readonly)
│
└── Viewer                   # Только просмотр
    ├── View projects (readonly)
    ├── View budgets (readonly)
    ├── View reports (readonly)
    └── Download files
```

### Permissions Matrix

| Resource | Admin | Manager | Coordinator | Designer | Logistics | Viewer |
|----------|-------|---------|-------------|----------|-----------|--------|
| **Projects** |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ |
| Delete | ✅ | ⚠️** | ❌ | ❌ | ❌ | ❌ |
| **Budget** |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve | ✅ | ⚠️** | ❌ | ❌ | ❌ | ❌ |
| **Exhibits** |
| Create | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Team** |
| Add members | ✅ | ⚠️** | ❌ | ❌ | ❌ | ❌ |
| Remove | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

*✅ = Full access  
⚠️ = Conditional (только свои проекты)  
❌ = No access*

### Keycloak Roles Configuration

**Realm Roles:**
```json
{
  "roles": {
    "realm": [
      {
        "name": "admin",
        "description": "Organization administrator",
        "composite": false
      },
      {
        "name": "manager",
        "description": "Project manager",
        "composite": false
      },
      {
        "name": "coordinator",
        "description": "Project coordinator",
        "composite": false
      },
      {
        "name": "designer",
        "description": "Designer / Space planner",
        "composite": false
      },
      {
        "name": "logistics",
        "description": "Logistics specialist",
        "composite": false
      },
      {
        "name": "viewer",
        "description": "Read-only viewer",
        "composite": false
      }
    ]
  }
}
```

**Client Roles (для exponat-api):**
```json
{
  "clientRoles": {
    "exponat-api": [
      {
        "name": "projects:read",
        "description": "Read projects"
      },
      {
        "name": "projects:write",
        "description": "Create/Update projects"
      },
      {
        "name": "projects:delete",
        "description": "Delete projects"
      },
      {
        "name": "budget:read",
        "description": "Read budgets"
      },
      {
        "name": "budget:write",
        "description": "Create/Update budgets"
      },
      {
        "name": "budget:approve",
        "description": "Approve budget expenses"
      },
      {
        "name": "team:manage",
        "description": "Manage team members"
      }
    ]
  }
}
```

**Role Mappings:**
```javascript
// Admin gets all permissions
admin → [
  'projects:read', 'projects:write', 'projects:delete',
  'budget:read', 'budget:write', 'budget:approve',
  'team:manage'
]

// Manager gets most permissions
manager → [
  'projects:read', 'projects:write',
  'budget:read', 'budget:write',
  'team:manage'  // только в своих проектах
]

// Coordinator gets limited permissions
coordinator → [
  'projects:read', 'projects:write',  // только assigned
  'budget:read'
]

// Viewer gets read-only
viewer → [
  'projects:read',
  'budget:read'
]
```

---

## ⚛️ ИНТЕГРАЦИЯ С FRONTEND

### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import type { JWT } from 'next-auth/jwt'

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      // https://auth.exponat.site/realms/exponat-production
      
      authorization: {
        params: {
          scope: 'openid email profile',
          // PKCE для безопасности
          code_challenge_method: 'S256',
        },
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.idToken = account.id_token
      }
      
      // Add custom claims from Keycloak
      if (profile) {
        token.organizationId = profile.organization_id
        token.roles = profile.realm_access?.roles || []
        token.permissions = profile.resource_access?.['exponat-api']?.roles || []
      }
      
      // Return token if not expired
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token
      }
      
      // Token expired, refresh it
      return refreshAccessToken(token)
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.id = token.sub
      session.user.organizationId = token.organizationId
      session.user.roles = token.roles
      session.user.permissions = token.permissions
      session.error = token.error
      
      return session
    },
  },
  
  events: {
    async signOut({ token }) {
      // Logout from Keycloak
      if (token.idToken) {
        const params = new URLSearchParams({
          id_token_hint: token.idToken as string,
          post_logout_redirect_uri: process.env.NEXTAUTH_URL!,
        })
        
        await fetch(
          `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params}`
        )
      }
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
})

// Refresh access token
async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken as string,
        }),
      }
    )
    
    const tokens = await response.json()
    
    if (!response.ok) throw tokens
    
    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export { handler as GET, handler as POST }
```

### Protected Pages/Routes

```typescript
// app/[locale]/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Check if token refresh failed
  if (session.error === 'RefreshAccessTokenError') {
    redirect('/login?error=SessionExpired')
  }
  
  return <>{children}</>
}
```

### Permission-based UI

```typescript
// components/ProtectedButton.tsx
'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/shared/ui/button'

interface ProtectedButtonProps {
  permission: string
  children: React.ReactNode
  onClick: () => void
}

export function ProtectedButton({ 
  permission, 
  children, 
  onClick 
}: ProtectedButtonProps) {
  const { data: session } = useSession()
  
  const hasPermission = session?.user.permissions?.includes(permission)
  
  if (!hasPermission) {
    return null  // или disabled button
  }
  
  return (
    <Button onClick={onClick}>
      {children}
    </Button>
  )
}

// Usage
<ProtectedButton 
  permission="projects:delete"
  onClick={() => deleteProject(id)}
>
  Удалить проект
</ProtectedButton>
```

### Role-based Components

```typescript
// components/RoleGuard.tsx
'use client'

import { useSession } from 'next-auth/react'

interface RoleGuardProps {
  roles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { data: session } = useSession()
  
  const hasRole = roles.some(role => session?.user.roles?.includes(role))
  
  if (!hasRole) {
    return fallback || null
  }
  
  return <>{children}</>
}

// Usage
<RoleGuard roles={['admin', 'manager']}>
  <AdminPanel />
</RoleGuard>
```

---

## 🔧 ИНТЕГРАЦИЯ С BACKEND

### JWT Validation (Go)

```go
// middleware/auth.go
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type Claims struct {
	OrganizationID string   `json:"organization_id"`
	Roles          []string `json:"realm_access.roles"`
	Permissions    []string `json:"resource_access.exponat-api.roles"`
	jwt.RegisteredClaims
}

var jwksSet jwk.Set

func init() {
	// Fetch JWKS from Keycloak
	jwksURL := "https://auth.exponat.site/realms/exponat-production/protocol/openid-connect/certs"
	
	set, err := jwk.Fetch(context.Background(), jwksURL)
	if err != nil {
		panic(fmt.Sprintf("Failed to fetch JWKS: %v", err))
	}
	
	jwksSet = set
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}
		
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing algorithm
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			
			// Get key from JWKS
			keyID, ok := token.Header["kid"].(string)
			if !ok {
				return nil, fmt.Errorf("missing kid header")
			}
			
			key, found := jwksSet.LookupKeyID(keyID)
			if !found {
				return nil, fmt.Errorf("key %s not found", keyID)
			}
			
			var rawKey interface{}
			if err := key.Raw(&rawKey); err != nil {
				return nil, err
			}
			
			return rawKey, nil
		})
		
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		
		claims, ok := token.Claims.(*Claims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}
		
		// Set user context
		c.Set("userId", claims.Subject)
		c.Set("organizationId", claims.OrganizationID)
		c.Set("roles", claims.Roles)
		c.Set("permissions", claims.Permissions)
		
		c.Next()
	}
}

// Permission checking middleware
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		permissions, exists := c.Get("permissions")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No permissions found"})
			c.Abort()
			return
		}
		
		perms := permissions.([]string)
		hasPermission := false
		for _, p := range perms {
			if p == permission {
				hasPermission = true
				break
			}
		}
		
		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("Missing required permission: %s", permission),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// Usage
router.Use(AuthMiddleware())
router.DELETE("/projects/:id", RequirePermission("projects:delete"), deleteProject)
```

### JWT Validation (Python/FastAPI)

```python
# middleware/auth.py
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from jose.utils import base64url_decode
import requests
from functools import lru_cache

security = HTTPBearer()

KEYCLOAK_URL = "https://auth.exponat.site/realms/exponat-production"
JWKS_URL = f"{KEYCLOAK_URL}/protocol/openid-connect/certs"

@lru_cache()
def get_jwks():
    """Fetch and cache JWKS from Keycloak"""
    response = requests.get(JWKS_URL)
    return response.json()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify JWT token"""
    token = credentials.credentials
    
    try:
        # Decode header to get kid
        header = jwt.get_unverified_header(token)
        kid = header['kid']
        
        # Get public key from JWKS
        jwks = get_jwks()
        key = next((k for k in jwks['keys'] if k['kid'] == kid), None)
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Public key not found"
            )
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience='exponat-api',
            issuer=KEYCLOAK_URL
        )
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def decorator(func):
        async def wrapper(*args, token_payload: dict = Security(verify_token), **kwargs):
            permissions = token_payload.get('resource_access', {}).get('exponat-api', {}).get('roles', [])
            
            if permission not in permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {permission}"
                )
            
            # Add user context to kwargs
            kwargs['user_id'] = token_payload['sub']
            kwargs['organization_id'] = token_payload.get('organization_id')
            kwargs['permissions'] = permissions
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

# Usage
from fastapi import APIRouter

router = APIRouter()

@router.delete("/projects/{project_id}")
@require_permission("projects:delete")
async def delete_project(
    project_id: str,
    user_id: str,
    organization_id: str,
    permissions: list
):
    # user_id, organization_id, permissions injected by decorator
    ...
```

---

## 🏢 SSO ДЛЯ КОРПОРАЦИЙ

### SAML Integration (для корпоративных клиентов)

Keycloak поддерживает SAML 2.0 для интеграции с корпоративными Identity Providers.

**Пример: интеграция с Azure AD (Microsoft)**

```xml
<!-- SAML Configuration в Keycloak -->
<IdentityProvider>
  <Alias>azure-ad</Alias>
  <ProviderId>saml</ProviderId>
  <Config>
    <SingleSignOnServiceUrl>
      https://login.microsoftonline.com/{tenant-id}/saml2
    </SingleSignOnServiceUrl>
    <SingleLogoutServiceUrl>
      https://login.microsoftonline.com/{tenant-id}/saml2
    </SingleLogoutServiceUrl>
    <NameIDPolicyFormat>
      urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
    </NameIDPolicyFormat>
    <ValidateSignature>true</ValidateSignature>
    <SigningCertificate>
      <!-- Azure AD certificate -->
    </SigningCertificate>
  </Config>
  <Mappers>
    <Mapper name="email" type="saml-user-attribute-mapper">
      <Config>
        <attribute.name>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress</attribute.name>
        <user.attribute>email</user.attribute>
      </Config>
    </Mapper>
    <Mapper name="firstName" type="saml-user-attribute-mapper">
      <Config>
        <attribute.name>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname</attribute.name>
        <user.attribute>firstName</user.attribute>
      </Config>
    </Mapper>
    <Mapper name="lastName" type="saml-user-attribute-mapper">
      <Config>
        <attribute.name>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname</attribute.name>
        <user.attribute>lastName</user.attribute>
      </Config>
    </Mapper>
  </Mappers>
</IdentityProvider>
```

### LDAP/Active Directory Integration

```json
{
  "componentId": "ldap-federation",
  "providerType": "org.keycloak.storage.UserStorageProvider",
  "providerId": "ldap",
  "config": {
    "vendor": ["ad"],  // Active Directory
    "connectionUrl": ["ldap://company-dc.example.com:389"],
    "bindDn": ["CN=service-account,OU=Service Accounts,DC=example,DC=com"],
    "bindCredential": ["password"],
    "usersDn": ["OU=Users,DC=example,DC=com"],
    "userObjectClasses": ["person", "organizationalPerson", "user"],
    "usernameAttribute": ["sAMAccountName"],
    "rdnLDAPAttribute": ["cn"],
    "uuidLDAPAttribute": ["objectGUID"],
    "usernameLDAPAttribute": ["sAMAccountName"],
    "editMode": ["READ_ONLY"],  // или WRITABLE
    "syncRegistrations": ["false"],  // не создавать в LDAP при регистрации
    "importEnabled": ["true"],
    "batchSizeForSync": ["1000"],
    "fullSyncPeriod": ["604800"],  // раз в неделю
    "changedSyncPeriod": ["86400"]  // раз в день
  }
}
```

**User flow с LDAP:**
1. User enters corporate email
2. Keycloak queries LDAP
3. If user exists in LDAP → authenticate against LDAP
4. If authenticated → create/update user in Keycloak
5. Issue OAuth tokens

---

## 📱 MFA (MULTI-FACTOR AUTHENTICATION)

### Supported MFA Methods

**1. TOTP (Time-based One-Time Password)**
- Google Authenticator
- Microsoft Authenticator
- Authy
- Работает offline

**2. SMS**
- Отправка кода через SMS
- Требует интеграцию с SMS provider

**3. Email**
- Отправка кода на email
- Бесплатно, но менее безопасно

**4. WebAuthn / FIDO2**
- YubiKey
- Fingerprint
- Face ID
- Наиболее безопасно

### TOTP Configuration (рекомендуется)

```javascript
// Keycloak Realm Authentication Flow
{
  "authenticationFlows": [
    {
      "alias": "browser",
      "description": "Browser based authentication",
      "providerId": "basic-flow",
      "topLevel": true,
      "builtIn": true,
      "authenticationExecutions": [
        {
          "authenticator": "auth-cookie",
          "requirement": "ALTERNATIVE",
          "priority": 10
        },
        {
          "authenticator": "identity-provider-redirector",
          "requirement": "ALTERNATIVE",
          "priority": 25
        },
        {
          "flowAlias": "forms",
          "requirement": "ALTERNATIVE",
          "priority": 30
        }
      ]
    },
    {
      "alias": "forms",
      "description": "Username, password, otp and other auth forms.",
      "providerId": "basic-flow",
      "topLevel": false,
      "builtIn": true,
      "authenticationExecutions": [
        {
          "authenticator": "auth-username-password-form",
          "requirement": "REQUIRED",
          "priority": 10
        },
        {
          "authenticator": "auth-otp-form",  // TOTP
          "requirement": "CONDITIONAL",  // Только если настроен
          "priority": 20,
          "authenticatorConfig": "otp-config"
        }
      ]
    }
  ],
  "authenticatorConfig": [
    {
      "alias": "otp-config",
      "config": {
        "otpPolicyType": "totp",
        "otpPolicyAlgorithm": "HmacSHA1",
        "otpPolicyDigits": "6",
        "otpPolicyPeriod": "30",
        "otpPolicyLookAheadWindow": "1"
      }
    }
  ]
}
```

### User MFA Setup Flow

```
User → Account Console → Security → Two-Factor Authentication → Setup
  ↓
Keycloak generates TOTP secret
  ↓
Display QR code + manual entry code
  ↓
User scans with authenticator app
  ↓
User enters verification code
  ↓
Keycloak validates
  ↓
MFA enabled for user
```

### Enforce MFA for Specific Roles

```javascript
// Required Actions для admin role
{
  "requiredActions": [
    {
      "alias": "CONFIGURE_TOTP",
      "name": "Configure OTP",
      "providerId": "CONFIGURE_TOTP",
      "enabled": true,
      "defaultAction": false
    }
  ],
  "roleRequiredActions": {
    "admin": ["CONFIGURE_TOTP"]  // admins MUST setup MFA
  }
}
```

---

## 🔄 SESSION MANAGEMENT

### Session Configuration

```json
{
  "ssoSessionIdleTimeout": 1800,     // 30 minutes idle
  "ssoSessionMaxLifespan": 86400,    // 24 hours max
  "offlineSessionIdleTimeout": 2592000,  // 30 days
  "offlineSessionMaxLifespan": 5184000,  // 60 days
  "accessTokenLifespan": 900,        // 15 minutes
  "accessTokenLifespanForImplicitFlow": 900,
  "accessCodeLifespan": 60,          // 1 minute
  "accessCodeLifespanUserAction": 300,  // 5 minutes
  "refreshTokenMaxReuse": 0,         // одноразовые refresh tokens
  "revokeRefreshToken": true
}
```

### Session Storage

**Infinispan (Embedded Cache):**
- По умолчанию в Keycloak
- In-memory для sessions
- Репликация между нодами

**Redis (External Cache):**
- Для production с многими нодами
- Централизованное хранилище sessions
- Faster failover

```xml
<!-- standalone-ha.xml -->
<cache-container name="keycloak">
  <distributed-cache name="sessions">
    <remote-store cache="sessions" socket-timeout="60000">
      <remote-server host="redis.example.com" port="6379"/>
    </remote-store>
  </distributed-cache>
</cache-container>
```

### Logout

**Single Logout:**
```
User → Frontend → Logout button
  ↓
Frontend calls /api/auth/signout (NextAuth)
  ↓
NextAuth calls Keycloak logout endpoint:
  POST /realms/exponat/protocol/openid-connect/logout
  id_token_hint=<id_token>
  post_logout_redirect_uri=https://exponat.site
  ↓
Keycloak invalidates session
  ↓
Redirect to homepage
```

**Admin-initiated logout (force logout user):**
```javascript
// Admin API call
DELETE /admin/realms/exponat/users/{user-id}/sessions
Authorization: Bearer <admin-token>
```

---

## 🚀 DEPLOYMENT

### Architecture (Production)

```
┌──────────────────────────────────────────────────────────┐
│                  Yandex Cloud / K8s                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │          Keycloak Cluster (3 nodes)                │ │
│  │                                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │ KC Node1 │  │ KC Node2 │  │ KC Node3 │        │ │
│  │  │  (Pod)   │  │  (Pod)   │  │  (Pod)   │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  │       │             │             │               │ │
│  │       └─────────────┴─────────────┘               │ │
│  │                     │                             │ │
│  │              Load Balancer                        │ │
│  └────────────────────────────────────────────────────┘ │
│                      │                                  │
│      ┌───────────────┼───────────────┐                 │
│      │               │               │                 │
│      ▼               ▼               ▼                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐             │
│  │PostgreSQL  │Redis      │  │  SMTP    │             │
│  │(Primary+  │(Sessions) │  │(Mailgun) │             │
│  │ Replica) │           │  │          │             │
│  └─────────┘  └──────────┘  └──────────┘             │
└──────────────────────────────────────────────────────────┘
```

### Kubernetes Deployment

```yaml
# keycloak-deployment.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: keycloak
  namespace: auth
spec:
  serviceName: keycloak
  replicas: 3
  selector:
    matchLabels:
      app: keycloak
  template:
    metadata:
      labels:
        app: keycloak
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - keycloak
                topologyKey: kubernetes.io/hostname
      
      containers:
      - name: keycloak
        image: quay.io/keycloak/keycloak:23.0
        args:
          - start
          - --auto-build
          - --db=postgres
          - --hostname=auth.exponat.site
          - --proxy=edge
          - --cache=ispn
          - --cache-stack=kubernetes
        
        env:
        - name: KEYCLOAK_ADMIN
          value: admin
        - name: KEYCLOAK_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: keycloak-admin
              key: password
        
        - name: KC_DB_URL
          value: jdbc:postgresql://postgres:5432/keycloak
        - name: KC_DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: keycloak-db
              key: username
        - name: KC_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: keycloak-db
              key: password
        
        - name: KC_CACHE_STACK
          value: kubernetes
        - name: JAVA_OPTS_APPEND
          value: "-Djgroups.dns.query=keycloak.auth.svc.cluster.local"
        
        - name: KC_LOG_LEVEL
          value: INFO
        
        ports:
        - name: http
          containerPort: 8080
        - name: https
          containerPort: 8443
        - name: jgroups
          containerPort: 7600
        
        resources:
          requests:
            cpu: 1000m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 2Gi
        
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: keycloak
  namespace: auth
spec:
  type: LoadBalancer
  selector:
    app: keycloak
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
  sessionAffinity: ClientIP

---
apiVersion: v1
kind: Service
metadata:
  name: keycloak-headless
  namespace: auth
spec:
  clusterIP: None
  selector:
    app: keycloak
  ports:
    - name: jgroups
      port: 7600
```

### Helm Installation

```bash
# Add Codecentric Helm repo (Keycloak)
helm repo add codecentric https://codecentric.github.io/helm-charts
helm repo update

# Install Keycloak
helm install keycloak codecentric/keycloak \
  --namespace auth \
  --create-namespace \
  --set replicas=3 \
  --set postgresql.enabled=true \
  --set postgresql.postgresqlPassword=<db-password> \
  --set service.type=LoadBalancer \
  --set ingress.enabled=true \
  --set ingress.hostname=auth.exponat.site \
  --set ingress.tls=true
```

### Database Setup (PostgreSQL)

```sql
-- Create database
CREATE DATABASE keycloak;

-- Create user
CREATE USER keycloak WITH ENCRYPTED PASSWORD 'secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- Extensions (если нужны)
\c keycloak
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 MONITORING & SECURITY

### Prometheus Metrics

Keycloak экспортирует метрики для Prometheus:

```yaml
# ServiceMonitor для Prometheus Operator
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: keycloak
  namespace: auth
spec:
  selector:
    matchLabels:
      app: keycloak
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

**Key Metrics:**
```
# Login attempts
keycloak_login_attempts_total{realm="exponat",result="success"} 1523
keycloak_login_attempts_total{realm="exponat",result="failed"} 23

# Active sessions
keycloak_sessions_active{realm="exponat"} 456

# Token requests
keycloak_token_requests_total{realm="exponat",grant_type="authorization_code"} 3421

# Database connections
keycloak_database_connections{pool="default",state="active"} 15
```

### Logging

```yaml
# Fluent Bit config для сбора логов
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [INPUT]
        Name              tail
        Path              /var/log/containers/keycloak-*.log
        Parser            docker
        Tag               keycloak.*
        Refresh_Interval  5
    
    [FILTER]
        Name                parser
        Match               keycloak.*
        Key_Name            log
        Parser              json
    
    [OUTPUT]
        Name  es
        Match keycloak.*
        Host  elasticsearch.logging.svc.cluster.local
        Port  9200
        Index keycloak-logs
```

### Security Best Practices

**1. HTTPS Only:**
```yaml
env:
  - name: KC_PROXY
    value: edge  # trust X-Forwarded-* headers
  - name: KC_HOSTNAME_STRICT_HTTPS
    value: "true"
```

**2. Rate Limiting:**
```javascript
// В Realm settings
{
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,  // 15 минут
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,  // 12 часов
  "failureFactor": 30
}
```

**3. Password Policy:**
```javascript
{
  "passwordPolicy": "length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(5) and hashIterations(27500)"
}
```

**4. Security Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

**5. Audit Logging:**
```javascript
{
  "eventsEnabled": true,
  "eventsListeners": ["jboss-logging"],
  "enabledEventTypes": [
    "LOGIN",
    "LOGIN_ERROR",
    "REGISTER",
    "LOGOUT",
    "UPDATE_PASSWORD",
    "UPDATE_PROFILE"
  ],
  "adminEventsEnabled": true,
  "adminEventsDetailsEnabled": true
}
```

---

## 📝 ИТОГОВОЕ РЕШЕНИЕ

### Production Stack

```
Frontend (Next.js)
    ↓ NextAuth.js
Keycloak (IAM)
    ↓ OAuth 2.0 / OIDC
Backend Services (Go/Python)
    ↓ JWT validation
PostgreSQL (users, roles, sessions)
Redis (session cache)
```

### Features

- ✅ OAuth 2.0 / OpenID Connect
- ✅ Single Sign-On (SSO)
- ✅ Multi-Factor Authentication (TOTP, SMS, WebAuthn)
- ✅ Social Login (Google, Yandex, VK)
- ✅ LDAP/Active Directory integration
- ✅ SAML 2.0 (для корпораций)
- ✅ Role-Based Access Control (RBAC)
- ✅ Session Management
- ✅ Admin Console
- ✅ High Availability (3+ nodes)
- ✅ Observability (Prometheus, Logging)
- ✅ Security (rate limiting, password policy, audit logs)

### Стоимость

**Open Source (Keycloak):**
- Лицензия: $0 (бесплатно)
- Infrastructure: ~$200-500/мес (K8s, DB, Redis)
- **Итого: ~$200-500/мес**

**vs Auth0:**
- B2C Essentials: $240/мес + $23 за 1000 users
- B2B Essentials: $1680/мес + $70 за 1000 users
- **Итого: $2000-5000+/мес**

**Экономия: $20k-50k/год**

---

**Вывод:** Keycloak — production-ready, полнофункциональное, бесплатное решение для авторизации. Не нужно изобретать велосипед или платить за SaaS.
