import { ConsumeMessage } from 'amqplib';
import fs from 'fs';
import path from 'path';
import { getChannel } from '../lib/rabbitmq';
import { fetchPedido } from '../lib/api';
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
    if (obtenerReintentos(msg) >= MAX_REINTENTOS) {
      console.error('[pedido.nuevo] Descartado tras máx. reintentos');
      channel.ack(msg);
      return;
    }
    try {
      const { pedidoId, tenantId }: MensajePedidoNuevo = JSON.parse(msg.content.toString());
      console.log(`[pedido.nuevo] ${pedidoId}`);
      await generarYGuardarHojaTrabajo(pedidoId, tenantId);
      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.nuevo] Error:', err);
      channel.nack(msg, false, false);
    }
  });
}

export function escucharPedidoEstado(): void {
  const channel = getChannel();
  channel.consume('pedido.estado', async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    if (obtenerReintentos(msg) >= MAX_REINTENTOS) {
      console.error('[pedido.estado] Descartado tras máx. reintentos');
      channel.ack(msg);
      return;
    }
    try {
      const { pedidoId, estado, tenantId }: MensajePedidoEstado = JSON.parse(msg.content.toString());
      console.log(`[pedido.estado] ${pedidoId} → ${estado}`);
      if (estado === 'TERMINADO') {
        await generarYGuardarHojaTrabajo(pedidoId, tenantId);
      }
      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.estado] Error:', err);
      channel.nack(msg, false, false);
    }
  });
}

async function generarYGuardarHojaTrabajo(pedidoId: string, tenantId: string): Promise<void> {
  let pedido: any;
  try {
    pedido = await fetchPedido(pedidoId);
  } catch (err) {
    console.warn(`[worker] No se pudo obtener el pedido ${pedidoId}, usando datos mínimos`);
    pedido = { referencia: pedidoId, estado: 'RECIBIDO', creadoEn: new Date().toISOString(), archivos: [], observaciones: null };
  }

  const html = generarHojaTrabajo({
    referencia: pedido.referencia ?? pedidoId,
    observaciones: pedido.observaciones,
    estado: pedido.estado ?? 'RECIBIDO',
    creadoEn: pedido.creadoEn ?? new Date().toISOString(),
    archivos: pedido.archivos ?? [],
    tenant: pedido.tenant?.nombre ?? tenantId,
  });

  // Al correr como .exe, guardar hojas junto al ejecutable; en Node, en el directorio de trabajo
  const base = (process as any).pkg ? path.dirname(process.execPath) : process.cwd();
  const dir = path.join(base, 'hojas', tenantId);
  fs.mkdirSync(dir, { recursive: true });
  const ruta = path.join(dir, `${pedidoId}.html`);
  fs.writeFileSync(ruta, html, 'utf-8');
  console.log(`[worker] Hoja generada: ${ruta}`);
}
