# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/orderly-web/package.json ./apps/orderly-web/

RUN pnpm install --filter orderly-web --frozen-lockfile

COPY apps/orderly-web ./apps/orderly-web

RUN pnpm --filter orderly-web run build

# ---- Production (nginx) ----
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/orderly-web/dist /usr/share/nginx/html

# Configuración nginx para Vue Router (history mode)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
