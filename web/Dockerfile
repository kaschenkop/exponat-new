# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ARG NEXT_PUBLIC_PROJECTS_API_URL=http://localhost:8081
ARG NEXT_PUBLIC_DEV_ORGANIZATION_ID=11111111-1111-1111-1111-111111111111
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PROJECTS_API_URL=$NEXT_PUBLIC_PROJECTS_API_URL
ENV NEXT_PUBLIC_DEV_ORGANIZATION_ID=$NEXT_PUBLIC_DEV_ORGANIZATION_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
# K8s задаёт HOSTNAME=имя пода и перекрывает ENV из образа — без 0.0.0.0 Next standalone не слушает сеть контейнера.
CMD ["sh", "-c", "exec env HOSTNAME=0.0.0.0 node server.js"]
