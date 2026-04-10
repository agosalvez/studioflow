# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/studioflow-web/package.json ./apps/studioflow-web/

RUN pnpm install --filter studioflow-web --frozen-lockfile

COPY apps/studioflow-web ./apps/studioflow-web

RUN pnpm --filter studioflow-web run build

# ---- Production (nginx) ----
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/studioflow-web/dist /usr/share/nginx/html

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
