import { ConsumeMessage } from 'amqplib';
import fs from 'fs';
import path from 'path';
import { getChannel } from '../lib/rabbitmq';
import { generarHojaTrabajo } from '../templates/hojaTrabajoTemplate';

const MAX_REINTENTOS = 3;

interface MensajePedidoNuevo {
  pedidoId: string;
  tenantId: string;
}

interface MensajePedidoEstado {
  pedidoId: string;
  estado: string;
  tenantId: string;
}

function obtenerReintentos(msg: ConsumeMessage): number {
  const headers = msg.properties.headers ?? {};
  const muerte = headers['x-death'];
  if (!Array.isArray(muerte) || muerte.length === 0) return 0;
  return Number(muerte[0].count ?? 0);
}

export function escucharPedidoNuevo(): void {
  const channel = getChannel();
  channel.consume('pedido.nuevo', async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    const reintentos = obtenerReintentos(msg);
    if (reintentos >= MAX_REINTENTOS) {
      console.error(`[pedido.nuevo] Mensaje descartado tras ${MAX_REINTENTOS} reintentos`);
      channel.ack(msg);
      return;
    }

    try {
      const datos: MensajePedidoNuevo = JSON.parse(msg.content.toString());
      console.log(`[pedido.nuevo] Procesando pedido: ${datos.pedidoId}`);

      await generarYGuardarHojaTrabajo(datos.pedidoId, datos.tenantId);

      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.nuevo] Error:', err);
      channel.nack(msg, false, false); // va a DLQ
    }
  });
}

export function escucharPedidoEstado(): void {
  const channel = getChannel();
  channel.consume('pedido.estado', async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    const reintentos = obtenerReintentos(msg);
    if (reintentos >= MAX_REINTENTOS) {
      console.error(`[pedido.estado] Mensaje descartado tras ${MAX_REINTENTOS} reintentos`);
      channel.ack(msg);
      return;
    }

    try {
      const datos: MensajePedidoEstado = JSON.parse(msg.content.toString());
      console.log(`[pedido.estado] Pedido ${datos.pedidoId} → ${datos.estado}`);

      if (datos.estado === 'TERMINADO') {
        await generarYGuardarHojaTrabajo(datos.pedidoId, datos.tenantId);
      }

      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.estado] Error:', err);
      channel.nack(msg, false, false);
    }
  });
}

async function generarYGuardarHojaTrabajo(pedidoId: string, tenantId: string): Promise<void> {
  // En producción aquí se haría una llamada a la API interna.
  // Por ahora generamos la hoja con datos mínimos disponibles del mensaje.
  const html = generarHojaTrabajo({
    referencia: pedidoId,
    estado: 'RECIBIDO',
    creadoEn: new Date().toISOString(),
    archivos: [],
    tenant: tenantId,
  });

  const dir = path.join('hojas', tenantId);
  fs.mkdirSync(dir, { recursive: true });
  const ruta = path.join(dir, `${pedidoId}.html`);
  fs.writeFileSync(ruta, html, 'utf-8');
  console.log(`[worker] Hoja de trabajo generada: ${ruta}`);
}
