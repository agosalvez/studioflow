<div align="center">

# 🔌 orderly-api

**API REST del ecosistema Orderly. Gestión de tenants, usuarios, pedidos y archivos.**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## Estructura

```
orderly-api/
├── src/
│   ├── index.ts              # Entrada: Express + rutas + middlewares
│   ├── lib/
│   │   ├── prisma.ts         # Cliente Prisma singleton
│   │   ├── jwt.ts            # Firma y verificación de tokens
│   │   └── rabbitmq.ts       # Publicación de mensajes
│   ├── middleware/
│   │   ├── auth.middleware.ts # Verificación JWT + roles
│   │   └── error.middleware.ts
│   ├── services/             # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── pedidos.service.ts
│   │   └── archivos.service.ts
│   ├── controllers/          # Entrada/salida HTTP
│   └── routes/               # Definición de rutas
├── prisma/
│   ├── schema.prisma         # Modelos de base de datos
│   └── seed.ts               # Datos de ejemplo
└── uploads/                  # Archivos subidos (montado como volumen)
```

---

## Endpoints

### Auth
```
POST   /api/auth/tenants     Crear tenant
POST   /api/auth/register    Registrar usuario
POST   /api/auth/login       Login → JWT
GET    /api/auth/me          Perfil del usuario autenticado
```

### Pedidos *(requiere JWT)*
```
GET    /api/pedidos                  Listar pedidos del tenant
POST   /api/pedidos                  Crear pedido
GET    /api/pedidos/:id              Detalle del pedido
PATCH  /api/pedidos/:id/estado       Cambiar estado
DELETE /api/pedidos/:id              Eliminar pedido
POST   /api/pedidos/:id/archivos     Subir archivo (multipart)
```

### Archivos *(requiere JWT)*
```
GET    /api/archivos/:id/download    Descargar archivo
DELETE /api/archivos/:id             Eliminar archivo
```

### Salud
```
GET    /health    Estado del servicio
```

---

## Modelos de base de datos

```prisma
Tenant    → slug único, contiene usuarios y pedidos
Usuario   → email, rol (ADMIN | OPERARIO | CLIENTE), pertenece a un tenant
Pedido    → referencia, observaciones, estado, archivos
Archivo   → nombre, ruta, tamaño, mimeType, pertenece a un pedido
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Conexión MySQL | `mysql://user:pass@db:3306/orderly` |
| `JWT_SECRET` | Clave de firma JWT | `secreto_seguro` |
| `RABBITMQ_URL` | Conexión RabbitMQ | `amqp://user:pass@rabbitmq:5672` |

---

## Scripts

```bash
pnpm dev              # Desarrollo con hot-reload
pnpm build            # Compilar TypeScript
pnpm start            # Producción (sin migraciones)
pnpm start:migrate    # Producción (con migraciones automáticas)
pnpm run seed         # Cargar datos de ejemplo
```

---

## Multi-tenancy

Cada request autenticado lleva en el JWT el `tenantId`. Todos los servicios filtran automáticamente por tenant, garantizando el aislamiento total de datos entre negocios.
