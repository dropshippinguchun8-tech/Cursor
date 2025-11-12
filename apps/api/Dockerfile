# syntax=docker/dockerfile:1.4

# -------------------------
# BASE IMAGE
# -------------------------
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -------------------------
# DEPENDENCIES LAYER
# -------------------------
FROM base AS deps
WORKDIR /app

# 🔹 Copy monorepo root-level configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 🔹 Copy each package's package.json to avoid invalidating cache unnecessarily
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/utils/package.json ./packages/utils/package.json
COPY packages/config/package.json ./packages/config/package.json

# 🔹 Install dependencies (for all workspaces)
RUN pnpm install --frozen-lockfile

# -------------------------
# BUILD LAYER
# -------------------------
FROM deps AS build
WORKDIR /app
COPY . .

# Prisma client generate + build API
RUN pnpm --filter apps-api exec prisma generate
RUN pnpm --filter apps-api build

# -------------------------
# RUNTIME LAYER
# -------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# 🔹 Copy only what's needed for runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/prisma ./prisma

# Prisma migrations yoki schema ishlatish uchun:
COPY --from=build /app/packages ./packages

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
