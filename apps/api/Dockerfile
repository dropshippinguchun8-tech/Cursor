# syntax=docker/dockerfile:1.4

### 1️⃣ Base environment
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

### 2️⃣ Install dependencies (with caching)
FROM base AS deps
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json

# Install all monorepo dependencies
RUN pnpm install --frozen-lockfile

### 3️⃣ Build API
FROM deps AS build
WORKDIR /app
COPY . .
# Generate Prisma client & build API
RUN pnpm --filter apps-api exec prisma generate
RUN pnpm --filter apps-api run build

### 4️⃣ Production image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy only necessary runtime files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/prisma ./prisma

# Expose backend port
EXPOSE 4000

# Healthcheck (optional, for Render)
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Run Prisma migrations and start API
CMD ["sh", "-c", "npx prisma migrate deploy && node apps/api/dist/main.js"]
