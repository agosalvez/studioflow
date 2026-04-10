import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { conectar } from './lib/rabbitmq';
import { escucharPedidoNuevo, escucharPedidoEstado } from './handlers/pedido.handler';

async function iniciar() {
  let intentos = 0;
  while (intentos < 10) {
    try {
      await conectar();
      escucharPedidoNuevo();
      escucharPedidoEstado();
      console.log('studioflow-worker escuchando colas…');
      return;
    } catch (err) {
      intentos++;
      console.warn(`RabbitMQ no disponible, reintentando (${intentos}/10)…`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error('No se pudo conectar a RabbitMQ. Saliendo.');
  process.exit(1);
}

iniciar();
