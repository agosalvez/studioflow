# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/studioflow-api/package.json ./apps/studioflow-api/

RUN pnpm install --filter studioflow-api --frozen-lockfile

COPY apps/studioflow-api ./apps/studioflow-api

RUN pnpm --filter studioflow-api exec prisma generate
RUN pnpm --filter studioflow-api run build
# Compilar seed junto al resto
RUN cd apps/studioflow-api && npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --module commonjs --target ES2020 || true

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/studioflow-api/package.json ./apps/studioflow-api/

RUN pnpm install --filter studioflow-api --frozen-lockfile --prod

COPY --from=builder /app/apps/studioflow-api/dist         ./apps/studioflow-api/dist
COPY --from=builder /app/apps/studioflow-api/node_modules/.prisma ./apps/studioflow-api/node_modules/.prisma
COPY apps/studioflow-api/prisma                            ./apps/studioflow-api/prisma

WORKDIR /app/apps/studioflow-api

RUN mkdir -p uploads

EXPOSE ${PORT:-3000}

# migrate → seed → servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/index.js"]
