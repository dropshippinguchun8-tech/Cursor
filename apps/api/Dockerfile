# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -------------------------
# INSTALL DEPENDENCIES
# -------------------------
FROM base AS deps
WORKDIR /app

# Copy all root configs first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/config/package.json packages/config/package.json

# Install dependencies for the entire monorepo
RUN pnpm install --recursive --frozen-lockfile

# -------------------------
# BUILD
# -------------------------
FROM deps AS build
COPY . .
RUN pnpm --filter apps-api exec prisma generate
RUN pnpm --filter apps-api build

# -------------------------
# RUNTIME
# -------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
