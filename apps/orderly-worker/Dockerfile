# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/orderly-worker/package.json ./apps/orderly-worker/

RUN pnpm install --filter orderly-worker --frozen-lockfile

COPY apps/orderly-worker ./apps/orderly-worker

RUN pnpm --filter orderly-worker run build

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/orderly-worker/package.json ./apps/orderly-worker/

RUN pnpm install --filter orderly-worker --frozen-lockfile --prod

COPY --from=builder /app/apps/orderly-worker/dist ./apps/orderly-worker/dist

WORKDIR /app/apps/orderly-worker

CMD ["node", "dist/index.js"]
