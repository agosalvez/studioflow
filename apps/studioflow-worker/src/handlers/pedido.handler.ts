import { ConsumeMessage } from 'amqplib';
import { getChannel } from '../lib/rabbitmq';

interface MensajePedidoNuevo {
  pedidoId: string;
  tenantId: string;
}

interface MensajePedidoEstado {
  pedidoId: string;
  estado: string;
  tenantId: string;
}

export function escucharPedidoNuevo(): void {
  const channel = getChannel();
  channel.consume('pedido.nuevo', (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const datos: MensajePedidoNuevo = JSON.parse(msg.content.toString());
      console.log(`[pedido.nuevo] Pedido recibido: ${datos.pedidoId} (tenant: ${datos.tenantId})`);
      // TODO: notificaciones, generación automática de hoja de trabajo, etc.
      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.nuevo] Error procesando mensaje:', err);
      channel.nack(msg, false, false);
    }
  });
}

export function escucharPedidoEstado(): void {
  const channel = getChannel();
  channel.consume('pedido.estado', (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const datos: MensajePedidoEstado = JSON.parse(msg.content.toString());
      console.log(`[pedido.estado] Pedido ${datos.pedidoId} → ${datos.estado}`);
      // TODO: notificar cliente, actualizar sistemas externos, etc.
      channel.ack(msg);
    } catch (err) {
      console.error('[pedido.estado] Error procesando mensaje:', err);
      channel.nack(msg, false, false);
    }
  });
}
