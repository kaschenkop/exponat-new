# ПРОМПТ: РЕАЛИЗАЦИЯ AUTHENTICATION & AUTHORIZATION

Используй этот промпт в Cursor Composer (Agent mode) для полной реализации авторизации и аутентификации в проекте Экспонат.

---

## ПРОМПТ ДЛЯ CURSOR

```
@Codebase
@File exponat/AUTH_SOLUTION.md
@File exponat/ARCHITECTURE.md

Реализуй полную систему авторизации и аутентификации для платформы Экспонат используя Keycloak.

# КОНТЕКСТ

Проект Экспонат нуждается в production-ready решении для:
- Регистрация и логин пользователей
- OAuth 2.0 / OpenID Connect
- Single Sign-On (SSO)
- Multi-Factor Authentication (MFA)
- Role-Based Access Control (RBAC)
- Интеграция с корпоративными LDAP/AD (для enterprise клиентов)

Используем Keycloak как IAM решение.

# ЗАДАЧИ

## 1. Keycloak Setup

### Структура:

```
exponat/
├── infrastructure/
│   └── keycloak/
│       ├── docker-compose.keycloak.yml      # Локальная разработка
│       ├── keycloak-values.yaml             # Helm values для K8s
│       ├── realm-export.json                # Realm конфигурация
│       ├── themes/                          # Custom темы
│       │   └── exponat/
│       │       ├── login/
│       │       ├── account/
│       │       └── email/
│       └── README.md                        # Инструкции
└── docs/
    └── keycloak-setup.md                    # Детальная документация
```

### infrastructure/keycloak/docker-compose.keycloak.yml

Создай для локальной разработки:

```yaml
version: '3.8'

services:
  postgres-keycloak:
    image: postgres:16
    container_name: keycloak-postgres
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak_password
    ports:
      - "5433:5432"  # не конфликтует с основной БД
    volumes:
      - keycloak_postgres_data:/var/lib/postgresql/data
    networks:
      - exponat-network
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: keycloak
    command: start-dev  # development mode
    environment:
      # Database
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres-keycloak:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak_password
      
      # Admin credentials
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin_password_change_me
      
      # Hostname
      KC_HOSTNAME: localhost
      KC_HOSTNAME_PORT: 8080
      KC_HOSTNAME_STRICT: false
      KC_HOSTNAME_STRICT_HTTPS: false
      
      # HTTP
      KC_HTTP_ENABLED: true
      KC_HTTP_PORT: 8080
      
      # Logging
      KC_LOG_LEVEL: INFO
      
      # Health
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
    ports:
      - "8080:8080"  # Keycloak UI
    depends_on:
      - postgres-keycloak
    networks:
      - exponat-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  keycloak_postgres_data:

networks:
  exponat-network:
    external: true
```

### infrastructure/keycloak/realm-export.json

Создай полную конфигурацию Realm:

```json
{
  "id": "exponat-development",
  "realm": "exponat-development",
  "displayName": "Экспонат Development",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": true,
  "registrationEmailAsUsername": true,
  "rememberMe": true,
  "verifyEmail": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  
  "accessTokenLifespan": 900,
  "accessTokenLifespanForImplicitFlow": 900,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 86400,
  "offlineSessionIdleTimeout": 2592000,
  "offlineSessionMaxLifespan": 5184000,
  "accessCodeLifespan": 60,
  "accessCodeLifespanUserAction": 300,
  "refreshTokenMaxReuse": 0,
  "revokeRefreshToken": true,
  
  "defaultRoles": ["viewer"],
  
  "roles": {
    "realm": [
      {
        "name": "admin",
        "description": "Administrator - полный доступ к организации",
        "composite": false
      },
      {
        "name": "manager",
        "description": "Manager - управление проектами",
        "composite": false
      },
      {
        "name": "coordinator",
        "description": "Coordinator - координация работ",
        "composite": false
      },
      {
        "name": "designer",
        "description": "Designer - дизайн и планирование",
        "composite": false
      },
      {
        "name": "logistics",
        "description": "Logistics - логистика экспонатов",
        "composite": false
      },
      {
        "name": "viewer",
        "description": "Viewer - только просмотр",
        "composite": false
      }
    ]
  },
  
  "clients": [
    {
      "clientId": "exponat-web",
      "name": "Exponat Web Application",
      "description": "Next.js frontend application",
      "enabled": true,
      "publicClient": true,
      "protocol": "openid-connect",
      "redirectUris": [
        "http://localhost:3000/*",
        "https://exponat.site/*",
        "https://*.exponat.site/*"
      ],
      "webOrigins": [
        "http://localhost:3000",
        "https://exponat.site",
        "https://*.exponat.site"
      ],
      "standardFlowEnabled": true,
      "implicitFlowEnabled": false,
      "directAccessGrantsEnabled": false,
      "serviceAccountsEnabled": false,
      "attributes": {
        "pkce.code.challenge.method": "S256"
      },
      "protocolMappers": [
        {
          "name": "organization-id",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-attribute-mapper",
          "config": {
            "user.attribute": "organization_id",
            "claim.name": "organization_id",
            "jsonType.label": "String",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        },
        {
          "name": "roles",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "realm_access.roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    },
    {
      "clientId": "exponat-api",
      "name": "Exponat Backend API",
      "description": "Backend microservices",
      "enabled": true,
      "publicClient": false,
      "protocol": "openid-connect",
      "bearerOnly": true,
      "standardFlowEnabled": false,
      "directAccessGrantsEnabled": false,
      "serviceAccountsEnabled": true
    }
  ],
  
  "clientScopes": [
    {
      "name": "exponat-permissions",
      "description": "Fine-grained permissions for Exponat API",
      "protocol": "openid-connect",
      "attributes": {
        "include.in.token.scope": "true"
      },
      "protocolMappers": [
        {
          "name": "client-roles",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-client-role-mapper",
          "config": {
            "claim.name": "resource_access.${client_id}.roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "usermodel.clientRoleMapping.clientId": "exponat-api",
            "access.token.claim": "true"
          }
        }
      ]
    }
  ],
  
  "users": [
    {
      "username": "admin@exponat.site",
      "email": "admin@exponat.site",
      "emailVerified": true,
      "firstName": "Admin",
      "lastName": "User",
      "enabled": true,
      "credentials": [
        {
          "type": "password",
          "value": "admin123",
          "temporary": false
        }
      ],
      "realmRoles": ["admin"],
      "attributes": {
        "organization_id": ["org-demo"]
      }
    }
  ],
  
  "identityProviders": [
    {
      "alias": "google",
      "providerId": "google",
      "enabled": true,
      "config": {
        "clientId": "${GOOGLE_CLIENT_ID}",
        "clientSecret": "${GOOGLE_CLIENT_SECRET}",
        "defaultScope": "openid profile email"
      }
    },
    {
      "alias": "yandex",
      "providerId": "yandex",
      "enabled": true,
      "config": {
        "clientId": "${YANDEX_CLIENT_ID}",
        "clientSecret": "${YANDEX_CLIENT_SECRET}"
      }
    }
  ],
  
  "authenticationFlows": [
    {
      "alias": "browser",
      "description": "Browser based authentication with MFA support",
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
      "description": "Username, password, OTP form",
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
          "authenticator": "auth-otp-form",
          "requirement": "CONDITIONAL",
          "priority": 20
        }
      ]
    }
  ],
  
  "passwordPolicy": "length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(5)"
}
```

### infrastructure/keycloak/keycloak-values.yaml

Helm values для production K8s:

```yaml
# Keycloak Helm Chart values (Codecentric)
image:
  repository: quay.io/keycloak/keycloak
  tag: "23.0"
  pullPolicy: IfNotPresent

# Replicas для HA
replicas: 3

# Command
command:
  - "/opt/keycloak/bin/kc.sh"

# Args
args:
  - start
  - --auto-build
  - --db=postgres
  - --hostname=auth.exponat.site
  - --proxy=edge
  - --cache=ispn
  - --cache-stack=kubernetes
  - --health-enabled=true
  - --metrics-enabled=true

# Environment variables
extraEnv: |
  - name: KEYCLOAK_ADMIN
    valueFrom:
      secretKeyRef:
        name: keycloak-admin
        key: username
  - name: KEYCLOAK_ADMIN_PASSWORD
    valueFrom:
      secretKeyRef:
        name: keycloak-admin
        key: password
  - name: KC_DB_URL
    value: jdbc:postgresql://postgres-keycloak:5432/keycloak
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
    value: "-Djgroups.dns.query=keycloak-headless.auth.svc.cluster.local"
  - name: KC_LOG_LEVEL
    value: INFO
  - name: GOOGLE_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: keycloak-oauth
        key: google-client-id
  - name: GOOGLE_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: keycloak-oauth
        key: google-client-secret

# PostgreSQL
postgresql:
  enabled: true
  auth:
    username: keycloak
    password: keycloak_db_password
    database: keycloak
  primary:
    persistence:
      enabled: true
      size: 10Gi
    resources:
      requests:
        cpu: 500m
        memory: 512Mi

# Resources
resources:
  requests:
    cpu: 1000m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi

# Anti-affinity (разные ноды)
affinity: |
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: keycloak
          topologyKey: kubernetes.io/hostname

# Service
service:
  type: LoadBalancer
  ports:
    http:
      port: 80
      targetPort: 8080
    https:
      port: 443
      targetPort: 8443
  sessionAffinity: ClientIP

# Ingress
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-buffer-size: "128k"
  rules:
    - host: auth.exponat.site
      paths:
        - path: /
          pathType: Prefix
  tls:
    - hosts:
        - auth.exponat.site
      secretName: keycloak-tls

# Health checks
livenessProbe:
  httpGet:
    path: /health/live
    port: http
  initialDelaySeconds: 60
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 5

readinessProbe:
  httpGet:
    path: /health/ready
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 5

# ServiceMonitor для Prometheus
serviceMonitor:
  enabled: true
  interval: 30s
  path: /metrics
  labels:
    prometheus: kube-prometheus
```

## 2. Frontend Integration (Next.js + NextAuth.js)

### web/src/app/api/auth/[...nextauth]/route.ts

```typescript
import NextAuth, { AuthOptions } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      // https://auth.exponat.site/realms/exponat-production
      
      authorization: {
        params: {
          scope: 'openid email profile',
          // PKCE для безопасности (Public clients)
          code_challenge_method: 'S256',
        },
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at!
        token.idToken = account.id_token
        
        // Add Keycloak custom claims
        token.organizationId = (profile as any).organization_id
        token.roles = (profile as any).realm_access?.roles || []
        token.permissions = (profile as any).resource_access?.['exponat-api']?.roles || []
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token
      }
      
      // Access token has expired, try to refresh it
      return await refreshAccessToken(token)
    },
    
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined
      
      // User info
      session.user.id = token.sub!
      session.user.organizationId = token.organizationId as string
      session.user.roles = token.roles as string[]
      session.user.permissions = token.permissions as string[]
      
      return session
    },
  },
  
  events: {
    async signOut({ token }) {
      // Keycloak logout
      if (token.idToken) {
        const params = new URLSearchParams({
          id_token_hint: token.idToken as string,
          post_logout_redirect_uri: process.env.NEXTAUTH_URL!,
        })
        
        try {
          await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params}`,
            { method: 'GET' }
          )
        } catch (error) {
          console.error('Keycloak logout error:', error)
        }
      }
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  debug: process.env.NODE_ENV === 'development',
}

// Refresh access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
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
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${tokens.error}`)
    }
    
    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      error: undefined,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### web/src/types/next-auth.d.ts

Extend NextAuth types:

```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      organizationId: string
      roles: string[]
      permissions: string[]
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    idToken?: string
    organizationId?: string
    roles?: string[]
    permissions?: string[]
    error?: string
  }
}
```

### web/src/app/[locale]/(auth)/login/page.tsx

Login page:

```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function LoginPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  
  const handleLogin = () => {
    signIn('keycloak', { callbackUrl })
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="Экспонат"
            width={120}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-display font-bold">
            {t('welcome')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('signInToContinue')}
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error === 'SessionExpired' && t('errors.sessionExpired')}
            {error === 'OAuthSignin' && t('errors.oauthError')}
            {error === 'OAuthCallback' && t('errors.callbackError')}
            {error === 'RefreshAccessTokenError' && t('errors.refreshTokenError')}
          </div>
        )}
        
        {/* Sign in button */}
        <Button
          onClick={handleLogin}
          className="w-full"
          size="lg"
        >
          {t('signIn')}
        </Button>
        
        {/* Or divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('orContinueWith')}
            </span>
          </div>
        </div>
        
        {/* Social login (handled by Keycloak) */}
        <div className="text-center text-sm text-muted-foreground">
          {t('socialLoginAvailable')}
        </div>
      </Card>
    </div>
  )
}
```

### web/src/shared/components/auth/ProtectedRoute.tsx

Protected route wrapper:

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
    
    if (session?.error === 'RefreshAccessTokenError') {
      redirect('/login?error=SessionExpired')
    }
  }, [status, session])
  
  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  // Check roles
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => 
      session.user.roles.includes(role)
    )
    
    if (!hasRole) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground">
            У вас нет необходимых прав для просмотра этой страницы.
          </p>
        </div>
      )
    }
  }
  
  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission =>
      session.user.permissions.includes(permission)
    )
    
    if (!hasPermission) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground">
            У вас нет необходимых разрешений для этого действия.
          </p>
        </div>
      )
    }
  }
  
  return <>{children}</>
}
```

### web/src/shared/components/auth/RoleGuard.tsx

Role-based component guard:

```typescript
'use client'

import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  roles: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession()
  
  if (!session) {
    return fallback
  }
  
  const roleArray = Array.isArray(roles) ? roles : [roles]
  const hasRole = roleArray.some(role => session.user.roles.includes(role))
  
  if (!hasRole) {
    return fallback
  }
  
  return <>{children}</>
}

// Usage:
// <RoleGuard roles={['admin', 'manager']}>
//   <AdminPanel />
// </RoleGuard>
```

### web/src/shared/components/auth/PermissionGuard.tsx

Permission-based component guard:

```typescript
'use client'

import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'

interface PermissionGuardProps {
  permissions: string | string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean  // true = AND, false = OR
}

export function PermissionGuard({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { data: session } = useSession()
  
  if (!session) {
    return fallback
  }
  
  const permArray = Array.isArray(permissions) ? permissions : [permissions]
  
  const hasPermission = requireAll
    ? permArray.every(perm => session.user.permissions.includes(perm))
    : permArray.some(perm => session.user.permissions.includes(perm))
  
  if (!hasPermission) {
    return fallback
  }
  
  return <>{children}</>
}

// Usage:
// <PermissionGuard permissions="projects:delete">
//   <DeleteButton />
// </PermissionGuard>
```

### web/src/shared/hooks/usePermissions.ts

Hook для проверки permissions:

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session } = useSession()
  
  const hasPermission = (permission: string): boolean => {
    return session?.user.permissions.includes(permission) ?? false
  }
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(perm => hasPermission(perm))
  }
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(perm => hasPermission(perm))
  }
  
  const hasRole = (role: string): boolean => {
    return session?.user.roles.includes(role) ?? false
  }
  
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: session?.user.permissions ?? [],
    roles: session?.user.roles ?? [],
  }
}

// Usage:
// const { hasPermission } = usePermissions()
// if (hasPermission('projects:delete')) {
//   // show delete button
// }
```

### web/.env.example

Add Keycloak env vars:

```bash
# Keycloak
KEYCLOAK_CLIENT_ID=exponat-web
KEYCLOAK_CLIENT_SECRET=  # Generate in Keycloak
KEYCLOAK_ISSUER=http://localhost:8080/realms/exponat-development  # dev
# KEYCLOAK_ISSUER=https://auth.exponat.site/realms/exponat-production  # prod

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # dev
# NEXTAUTH_URL=https://exponat.site  # prod
NEXTAUTH_SECRET=  # Generate: openssl rand -base64 32
```

## 3. Backend Integration

### Go Service (example: projects service)

#### backend/services/projects/internal/middleware/auth.go

```go
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type Claims struct {
	OrganizationID string   `json:"organization_id"`
	RealmAccess    struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
	ResourceAccess map[string]struct {
		Roles []string `json:"roles"`
	} `json:"resource_access"`
	jwt.RegisteredClaims
}

var (
	jwksSet     jwk.Set
	jwksSetMux  sync.RWMutex
	lastFetched time.Time
)

const (
	jwksURL      = "https://auth.exponat.site/realms/exponat-production/protocol/openid-connect/certs"
	cacheDuration = 1 * time.Hour
)

func fetchJWKS() error {
	jwksSetMux.Lock()
	defer jwksSetMux.Unlock()
	
	// Check if cache is still valid
	if time.Since(lastFetched) < cacheDuration && jwksSet != nil {
		return nil
	}
	
	set, err := jwk.Fetch(context.Background(), jwksURL)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	
	jwksSet = set
	lastFetched = time.Now()
	
	return nil
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
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}
		
		// Fetch JWKS (with caching)
		if err := fetchJWKS(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public keys"})
			c.Abort()
			return
		}
		
		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing algorithm
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			
			// Get kid from header
			keyID, ok := token.Header["kid"].(string)
			if !ok {
				return nil, fmt.Errorf("missing kid in token header")
			}
			
			// Get key from JWKS
			jwksSetMux.RLock()
			defer jwksSetMux.RUnlock()
			
			key, found := jwksSet.LookupKeyID(keyID)
			if !found {
				return nil, fmt.Errorf("key %s not found in JWKS", keyID)
			}
			
			var rawKey interface{}
			if err := key.Raw(&rawKey); err != nil {
				return nil, fmt.Errorf("failed to get raw key: %w", err)
			}
			
			return rawKey, nil
		})
		
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid token: %v", err)})
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
		c.Set("roles", claims.RealmAccess.Roles)
		
		// Extract client permissions
		if clientAccess, ok := claims.ResourceAccess["exponat-api"]; ok {
			c.Set("permissions", clientAccess.Roles)
		} else {
			c.Set("permissions", []string{})
		}
		
		c.Next()
	}
}

// RequirePermission checks if user has specific permission
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		permissions, exists := c.Get("permissions")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No permissions found"})
			c.Abort()
			return
		}
		
		perms, ok := permissions.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid permissions format"})
			c.Abort()
			return
		}
		
		// Check if user has required permission
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

// RequireRole checks if user has specific role
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roles, exists := c.Get("roles")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No roles found"})
			c.Abort()
			return
		}
		
		userRoles, ok := roles.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid roles format"})
			c.Abort()
			return
		}
		
		// Check if user has required role
		hasRole := false
		for _, r := range userRoles {
			if r == role {
				hasRole = true
				break
			}
		}
		
		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("Missing required role: %s", role),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}
```

#### backend/services/projects/cmd/main.go

Usage example:

```go
package main

import (
	"github.com/gin-gonic/gin"
	"exponat/projects/internal/handlers"
	"exponat/projects/internal/middleware"
)

func main() {
	r := gin.Default()
	
	// Public routes (no auth)
	r.GET("/health", handlers.HealthCheck)
	
	// Protected routes
	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware())
	{
		// Projects
		projects := api.Group("/projects")
		{
			projects.GET("", handlers.ListProjects)  // Any authenticated user
			projects.GET("/:id", handlers.GetProject)
			
			projects.POST("", 
				middleware.RequirePermission("projects:write"),
				handlers.CreateProject,
			)
			
			projects.PUT("/:id",
				middleware.RequirePermission("projects:write"),
				handlers.UpdateProject,
			)
			
			projects.DELETE("/:id",
				middleware.RequirePermission("projects:delete"),
				handlers.DeleteProject,
			)
		}
		
		// Admin only routes
		admin := api.Group("/admin")
		admin.Use(middleware.RequireRole("admin"))
		{
			admin.GET("/stats", handlers.GetStats)
		}
	}
	
	r.Run(":8080")
}
```

### Python Service (FastAPI)

#### backend/services/ai-assistant/app/middleware/auth.py

```python
from fastapi import Security, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from functools import lru_cache
import requests
from typing import List, Optional

security = HTTPBearer()

KEYCLOAK_URL = "https://auth.exponat.site/realms/exponat-production"
JWKS_URL = f"{KEYCLOAK_URL}/protocol/openid-connect/certs"

@lru_cache(maxsize=1)
def get_jwks():
    """Fetch and cache JWKS from Keycloak"""
    response = requests.get(JWKS_URL, timeout=5)
    response.raise_for_status()
    return response.json()

class UserContext:
    def __init__(self, payload: dict):
        self.user_id = payload['sub']
        self.email = payload.get('email')
        self.organization_id = payload.get('organization_id')
        self.roles = payload.get('realm_access', {}).get('roles', [])
        self.permissions = payload.get('resource_access', {}).get('exponat-api', {}).get('roles', [])

def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> UserContext:
    """Verify JWT token and return user context"""
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
                detail="Public key not found in JWKS"
            )
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience='exponat-api',
            issuer=KEYCLOAK_URL
        )
        
        return UserContext(payload)
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_permission(permission: str):
    """Dependency to require specific permission"""
    def permission_checker(user: UserContext = Depends(verify_token)):
        if permission not in user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}"
            )
        return user
    return permission_checker

def require_role(role: str):
    """Dependency to require specific role"""
    def role_checker(user: UserContext = Depends(verify_token)):
        if role not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required role: {role}"
            )
        return user
    return role_checker
```

#### backend/services/ai-assistant/app/main.py

Usage example:

```python
from fastapi import FastAPI, Depends
from app.middleware.auth import verify_token, require_permission, UserContext

app = FastAPI()

# Public endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Protected endpoint (любой authenticated user)
@app.get("/api/v1/chat")
async def chat(user: UserContext = Depends(verify_token)):
    return {
        "user_id": user.user_id,
        "message": "Hello from AI assistant"
    }

# Permission-protected endpoint
@app.post("/api/v1/documents/generate")
async def generate_document(
    user: UserContext = Depends(require_permission("ai:generate"))
):
    return {
        "user_id": user.user_id,
        "organization_id": user.organization_id,
        "status": "generating"
    }
```

## 4. Kong Integration

Update Kong configuration to work with Keycloak JWT:

### infrastructure/kong/kong.yml

Add JWT plugin configuration:

```yaml
plugins:
  - name: jwt
    config:
      uri_param_names:
        - jwt
      cookie_names:
        - jwt
      claims_to_verify:
        - exp  # Verify expiration
      key_claim_name: iss
      secret_is_base64: false
      # Public key will be fetched from JWKS
      run_on_preflight: true
```

## 5. Documentation & Testing

### docs/keycloak-setup.md

```markdown
# Keycloak Setup Guide

## Local Development

### 1. Start Keycloak

\`\`\`bash
cd infrastructure/keycloak
docker-compose -f docker-compose.keycloak.yml up -d
\`\`\`

### 2. Access Admin Console

URL: http://localhost:8080
Username: admin
Password: admin_password_change_me

### 3. Import Realm

1. Login to Admin Console
2. Hover over realm dropdown (top left)
3. Click "Create Realm"
4. Click "Browse" and select `realm-export.json`
5. Click "Create"

### 4. Get Client Secret

1. Go to Clients → exponat-web
2. Go to Credentials tab
3. Copy Client Secret
4. Add to `web/.env.local`:

\`\`\`
KEYCLOAK_CLIENT_SECRET=<copied-secret>
\`\`\`

### 5. Test Login

1. Start frontend: `cd web && npm run dev`
2. Go to http://localhost:3000/login
3. Click "Sign In"
4. You'll be redirected to Keycloak
5. Login with: admin@exponat.site / admin123
6. You'll be redirected back to the app

## Production Deployment

### 1. Deploy to Kubernetes

\`\`\`bash
# Create namespace
kubectl create namespace auth

# Create secrets
kubectl create secret generic keycloak-admin \
  --from-literal=username=admin \
  --from-literal=password=<strong-password> \
  -n auth

kubectl create secret generic keycloak-db \
  --from-literal=username=keycloak \
  --from-literal=password=<db-password> \
  -n auth

# Install with Helm
helm repo add codecentric https://codecentric.github.io/helm-charts
helm install keycloak codecentric/keycloak \
  -f infrastructure/keycloak/keycloak-values.yaml \
  -n auth
\`\`\`

### 2. Import Realm

1. Access https://auth.exponat.site
2. Login with admin credentials
3. Import `realm-export.json` for exponat-production realm
4. Configure Identity Providers (Google, Yandex) with real credentials

### 3. Update Frontend

Update `web/.env.production`:
\`\`\`
KEYCLOAK_ISSUER=https://auth.exponat.site/realms/exponat-production
NEXTAUTH_URL=https://exponat.site
\`\`\`
\`\`\`

## ТРЕБОВАНИЯ

### Keycloak
- ✅ Docker Compose для локальной разработки
- ✅ Helm chart для K8s production
- ✅ Realm конфигурация (exponat-development, exponat-production)
- ✅ Clients (exponat-web, exponat-api)
- ✅ Roles (admin, manager, coordinator, designer, logistics, viewer)
- ✅ Client roles/permissions (projects:read, projects:write, etc.)
- ✅ Identity Providers (Google, Yandex)
- ✅ MFA support (TOTP)
- ✅ Password policy
- ✅ Brute force protection

### Frontend (Next.js)
- ✅ NextAuth.js integration
- ✅ Login page
- ✅ Protected routes (ProtectedRoute component)
- ✅ Role guards (RoleGuard component)
- ✅ Permission guards (PermissionGuard component)
- ✅ usePermissions hook
- ✅ Token refresh logic
- ✅ Logout flow
- ✅ Error handling
- ✅ TypeScript types

### Backend
- ✅ Go: JWT validation middleware
- ✅ Go: Permission middleware
- ✅ Go: Role middleware
- ✅ Python: JWT validation dependency
- ✅ Python: Permission dependency
- ✅ Python: Role dependency
- ✅ JWKS caching
- ✅ Error handling

### Kong
- ✅ JWT plugin configuration
- ✅ Integration с Keycloak

### Documentation
- ✅ keycloak-setup.md
- ✅ README обновлён
- ✅ .env.example обновлён

Создай всю инфраструктуру авторизации полностью. Agent mode.
```

---

## ПОСЛЕ ВЫПОЛНЕНИЯ

### Checklist:

```bash
cd exponat

# ✅ Keycloak setup
cd infrastructure/keycloak
docker-compose -f docker-compose.keycloak.yml up -d
curl http://localhost:8080/health  # Should return OK

# ✅ Login to Admin Console
open http://localhost:8080
# admin / admin_password_change_me

# ✅ Import realm
# Browse → realm-export.json → Create

# ✅ Frontend works
cd ../../web
npm install
npm run dev
open http://localhost:3000/login

# ✅ Test login
# Click Sign In → Redirects to Keycloak
# Login: admin@exponat.site / admin123
# Redirects back → Should be logged in

# ✅ Test protected route
# Go to /dashboard
# Should show dashboard (authenticated)

# ✅ Test permissions
# Try to delete project (need projects:delete permission)
```

### Environment Variables:

```bash
# web/.env.local
KEYCLOAK_CLIENT_ID=exponat-web
KEYCLOAK_CLIENT_SECRET=<get-from-keycloak>
KEYCLOAK_ISSUER=http://localhost:8080/realms/exponat-development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

---

## КРАТКАЯ ВЕРСИЯ (MINIMAL)

Если нужна более короткая версия:

```
@Codebase
Реализуй авторизацию через Keycloak для Экспонат.

1. Keycloak setup:
   - docker-compose.keycloak.yml
   - realm-export.json (роли, clients, permissions)
   - Helm values для K8s

2. Frontend (Next.js + NextAuth.js):
   - /api/auth/[...nextauth]/route.ts
   - Login page
   - ProtectedRoute, RoleGuard, PermissionGuard
   - usePermissions hook

3. Backend:
   - Go: AuthMiddleware, RequirePermission, RequireRole
   - Python: verify_token, require_permission, require_role

4. Docs:
   - keycloak-setup.md

Keycloak:
- Роли: admin, manager, coordinator, designer, logistics, viewer
- Permissions: projects:read, projects:write, projects:delete, budget:*, team:manage
- OAuth: Google, Yandex
- MFA: TOTP

Agent mode, создай всё.
```
