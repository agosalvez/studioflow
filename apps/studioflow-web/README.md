<div align="center">

# 🌐 studioflow-web

**Frontend del ecosistema StudioFlow. Panel de gestión de pedidos para estudios y talleres.**

[![Vue](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Pinia](https://img.shields.io/badge/Pinia-2.1-FFD859?logo=pinia&logoColor=white)](https://pinia.vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## Estructura

```
studioflow-web/
├── src/
│   ├── main.ts               # Entrada: Vue + Pinia + Router
│   ├── App.vue               # Raíz de la aplicación
│   ├── router/
│   │   └── index.ts          # Rutas + navigation guards
│   ├── layouts/
│   │   └── AppLayout.vue     # Layout con sidebar autenticado
│   ├── views/
│   │   ├── LoginView.vue     # Pantalla de login
│   │   ├── PedidosView.vue   # Panel principal de pedidos
│   │   └── PedidoDetalleView.vue  # Detalle + archivos + estado
│   ├── components/
│   │   └── EstadoBadge.vue   # Badge de estado con color
│   ├── stores/
│   │   ├── auth.store.ts     # Autenticación y perfil
│   │   └── pedidos.store.ts  # CRUD de pedidos y archivos
│   └── composables/
│       └── useApi.ts         # Cliente axios con interceptores JWT
└── index.html
```

---

## Vistas

### Login
- Formulario de acceso con email y contraseña
- Redirige automáticamente si ya hay sesión activa

### Panel de pedidos (`/pedidos`)
- Listado con filtros por estado (Todos / Recibido / En producción / Terminado / Entregado)
- Contador de archivos por pedido
- Modal para crear nuevo pedido
- Eliminación con confirmación

### Detalle de pedido (`/pedidos/:id`)
- Visualización completa del pedido
- Cambio de estado con selector
- Subida de archivos (múltiple, hasta 100MB)
- Descarga directa de archivos

---

## Stores (Pinia)

### `useAuthStore`
```ts
login(email, password)  // Login → guarda JWT en localStorage
cargarPerfil()          // Carga datos del usuario autenticado
logout()                // Limpia sesión
```

### `usePedidosStore`
```ts
cargar()                        // Listar todos los pedidos
obtener(id)                     // Detalle de un pedido
crear({ referencia, observaciones })
cambiarEstado(id, estado)
eliminar(id)
subirArchivo(pedidoId, file)
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000` |

---

## Scripts

```bash
pnpm dev        # Desarrollo en http://localhost:4200
pnpm build      # Build de producción
pnpm preview    # Preview del build
```

---

## Navegación y guards

- Las rutas privadas redirigen a `/login` si no hay JWT
- Si ya hay sesión y se accede a `/login`, redirige a `/pedidos`
- El token se envía automáticamente en cada petición via interceptor axios
- Si la API devuelve `401`, se limpia la sesión y se redirige al login
