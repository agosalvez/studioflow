<div align="center">

# ⚙️ orderly-worker

**Worker del ecosistema Orderly. Procesado asíncrono de pedidos en background mediante RabbitMQ.**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## ¿Para qué sirve?

Cuando la API recibe un pedido nuevo o cambia su estado, publica un mensaje en RabbitMQ. El worker consume esos mensajes de forma asíncrona y ejecuta tareas que no deben bloquear la respuesta HTTP:

- Generación automática de hojas de trabajo
- Notificaciones al cliente
- Descarga automática de archivos
- Integración con sistemas externos

---

## Estructura

```
orderly-worker/
└── src/
    ├── index.ts                  # Entrada: conecta y arranca listeners
    ├── lib/
    │   └── rabbitmq.ts           # Conexión y gestión del canal
    └── handlers/
        └── pedido.handler.ts     # Handlers de las colas
```

---

## Colas

| Cola | Publicada por | Descripción |
|---|---|---|
| `pedido.nuevo` | API al crear pedido | Nuevo pedido recibido en el sistema |
| `pedido.estado` | API al cambiar estado | Estado de un pedido actualizado |

---

## Formato de mensajes

### `pedido.nuevo`
```json
{
  "pedidoId": "cuid...",
  "tenantId": "cuid..."
}
```

### `pedido.estado`
```json
{
  "pedidoId": "cuid...",
  "estado": "EN_PRODUCCION",
  "tenantId": "cuid..."
}
```

---

## Resiliencia

El worker implementa reintentos automáticos de conexión a RabbitMQ (hasta 10 intentos con 3s de espera entre cada uno). Esto evita fallos al arrancar si RabbitMQ todavía no está listo.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `RABBITMQ_URL` | Conexión a RabbitMQ | `amqp://user:pass@rabbitmq:5672` |

---

## Scripts

```bash
pnpm dev      # Desarrollo con hot-reload
pnpm build    # Compilar TypeScript
pnpm start    # Producción
```

---

## Extender el worker

Para añadir una nueva tarea automatizada:

1. Crea un nuevo handler en `src/handlers/`
2. Define la cola en `src/lib/rabbitmq.ts` (assertQueue)
3. Registra el listener en `src/index.ts`
4. Publica mensajes desde la API con `publicar('nombre.cola', datos)`
