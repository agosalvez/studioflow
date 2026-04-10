# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/studioflow-worker/package.json ./apps/studioflow-worker/

RUN pnpm install --filter studioflow-worker --frozen-lockfile

COPY apps/studioflow-worker ./apps/studioflow-worker

RUN pnpm --filter studioflow-worker run build

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/studioflow-worker/package.json ./apps/studioflow-worker/

RUN pnpm install --filter studioflow-worker --frozen-lockfile --prod

COPY --from=builder /app/apps/studioflow-worker/dist ./apps/studioflow-worker/dist

WORKDIR /app/apps/studioflow-worker

CMD ["node", "dist/index.js"]
