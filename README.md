<div align="center">

# ⚡ Orderly

**La plataforma SaaS que convierte el caos de tu estudio en un flujo de trabajo organizado, automatizado y escalable.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/pnpm-9-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0-EF4444?logo=turborepo&logoColor=white)](https://turbo.build)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

<br/>

> Recepción de pedidos · Gestión de archivos · Flujo de producción · Multi-tenant · Worker automatizado

<br/>

</div>

---

## ¿Qué es Orderly?

Antes de Orderly, los estudios fotográficos y talleres de impresión gestionaban sus pedidos por email, archivos dispersos en WeTransfer, hojas de cálculo y llamadas de teléfono. El resultado: pérdidas de información, errores humanos y horas de trabajo manual cada día.

**Orderly lo centraliza todo en un único sistema digital:**

- 📥 Los clientes suben sus archivos y añaden instrucciones directamente en la plataforma
- 📋 El equipo ve todos los pedidos en un panel, organizados y con su estado actualizado
- ⚙️ Un worker automatiza tareas repetitivas en segundo plano
- 🏢 Cada negocio tiene su propio espacio aislado (multi-tenant)
- 🚀 Desplegable en cualquier servidor con Docker en minutos

---

## ✨ Características principales

| Característica | Descripción |
|---|---|
| **Recepción de pedidos** | Panel centralizado con subida de archivos (ZIP, PDF, JPG, RAW...) |
| **Estados de producción** | Recibido → En producción → Terminado → Entregado |
| **Multi-tenant** | Cada estudio tiene su propio espacio, usuarios y datos |
| **Worker automatizado** | Procesado en background con RabbitMQ |
| **Auth con JWT** | Roles: Admin, Operario y Cliente |
| **API REST** | Documentada, con validación y manejo de errores |
| **Docker ready** | Stack completo listo para importar en Portainer |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        MONOREPO                         │
│                  (Turborepo + pnpm)                     │
├──────────────────┬──────────────────┬───────────────────┤
│  orderly-web  │  orderly-api  │ orderly-worker │
│   Vue 3 + Vite   │ Express + Prisma │  Node + RabbitMQ  │
│    puerto 4200   │    puerto 3000   │    background     │
└────────┬─────────┴────────┬─────────┴────────┬──────────┘
         │                  │                   │
         │            ┌─────┴──────┐     ┌──────┴──────┐
         └───────────▶│  MySQL 8   │     │  RabbitMQ   │
                      └────────────┘     └─────────────┘
```

---

## 📦 Estructura del monorepo

```
orderly/
├── apps/
│   ├── orderly-api/       # API REST · Express · Prisma · MySQL
│   ├── orderly-web/       # Frontend · Vue 3 · Vite · Pinia
│   └── orderly-worker/    # Worker · Node.js · RabbitMQ
├── packages/                 # Paquetes compartidos (según necesidad)
├── docker-compose.yml        # Stack completo para Portainer
├── .env.example              # Variables de entorno de referencia
├── turbo.json                # Pipeline de Turborepo
└── pnpm-workspace.yaml       # Workspaces de pnpm
```

📖 Documentación detallada de cada app:

- [orderly-api](./apps/orderly-api/README.md) — API REST, endpoints, autenticación
- [orderly-web](./apps/orderly-web/README.md) — Frontend, vistas, stores
- [orderly-worker](./apps/orderly-worker/README.md) — Worker, colas, handlers

---

## 🚀 Inicio rápido

### Prerrequisitos

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- [Docker](https://www.docker.com/) (para MySQL y RabbitMQ)

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd orderly
cp .env.example .env
pnpm install
```

### 2. Levantar servicios de infraestructura

```bash
docker compose up -d db rabbitmq
```

### 3. Migrar base de datos y cargar datos de ejemplo

```bash
cd apps/orderly-api
pnpm exec prisma migrate dev --name init
pnpm run seed
```

### 4. Arrancar en modo desarrollo

```bash
# desde la raíz
pnpm dev
```

| Servicio | URL |
|---|---|
| 🌐 Frontend | http://localhost:4200 |
| 🔌 API | http://localhost:3000 |
| 🐰 RabbitMQ Admin | http://localhost:15672 |

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@demo.com | admin123 | Admin |
| operario@demo.com | operario123 | Operario |
| cliente@demo.com | cliente123 | Cliente |

---

## 🐳 Despliegue con Docker / Portainer

Importa el fichero `docker-compose.yml` directamente en Portainer como nuevo stack. Configura las variables de entorno desde `.env.example`.

```bash
# o desde línea de comandos
docker compose up -d
```

El contenedor de la API ejecuta automáticamente las migraciones y el seed al arrancar.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Vue 3 + Vite + Pinia | 3.4 / 5.0 / 2.1 |
| Backend | Node.js + Express | 20 / 4.18 |
| ORM | Prisma | 5.x |
| Base de datos | MySQL | 8.0 |
| Cola de mensajes | RabbitMQ | 3.13 |
| Auth | JWT + bcryptjs | — |
| Monorepo | Turborepo + pnpm | 2.0 / 9.0 |
| Despliegue | Docker + Portainer | — |

---

## 📜 Licencia

MIT © Orderly
