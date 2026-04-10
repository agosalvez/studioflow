import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { conectar } from './lib/rabbitmq';
import { escucharPedidoNuevo, escucharPedidoEstado } from './handlers/pedido.handler';

async function iniciar(intento = 1): Promise<void> {
  try {
    await conectar();
    escucharPedidoNuevo();
    escucharPedidoEstado();
    console.log('studioflow-worker escuchando colas…');
  } catch (err) {
    if (intento >= 10) {
      console.error('No se pudo conectar a RabbitMQ tras 10 intentos. Saliendo.');
      process.exit(1);
    }
    const espera = Math.min(intento * 2000, 15000); // backoff exponencial hasta 15s
    console.warn(`RabbitMQ no disponible, reintentando en ${espera / 1000}s (${intento}/10)…`);
    await new Promise((r) => setTimeout(r, espera));
    return iniciar(intento + 1);
  }
}

iniciar();
