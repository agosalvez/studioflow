# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/orderly-api/package.json ./apps/orderly-api/

RUN pnpm install --filter orderly-api --frozen-lockfile

COPY apps/orderly-api ./apps/orderly-api

RUN pnpm --filter orderly-api exec prisma generate
RUN pnpm --filter orderly-api run build
# Compilar seed junto al resto
RUN cd apps/orderly-api && npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --module commonjs --target ES2020 || true

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/orderly-api/package.json ./apps/orderly-api/

RUN pnpm install --filter orderly-api --frozen-lockfile --prod

COPY --from=builder /app/apps/orderly-api/dist         ./apps/orderly-api/dist
COPY --from=builder /app/apps/orderly-api/node_modules/.prisma ./apps/orderly-api/node_modules/.prisma
COPY apps/orderly-api/prisma                            ./apps/orderly-api/prisma

WORKDIR /app/apps/orderly-api

RUN mkdir -p uploads

EXPOSE ${PORT:-3000}

# migrate → seed → servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/index.js"]
