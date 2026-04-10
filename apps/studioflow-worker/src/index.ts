import path from 'path';
import { config } from 'dotenv';

// Cuando corre como .exe (pkg), process.pkg existe y process.execPath apunta al .exe.
// En ese caso el .env debe estar en la misma carpeta que el ejecutable.
// En desarrollo carga el .env raíz del monorepo.
const envPath = (process as any).pkg
  ? path.join(path.dirname(process.execPath), '.env')
  : path.resolve(__dirname, '../../../.env');

config({ path: envPath });

import { conectar } from './lib/rabbitmq';
import { escucharPedidoNuevo, escucharPedidoEstado } from './handlers/pedido.handler';

console.log('╔════════════════════════════════╗');
console.log('║     StudioFlow Worker  v1.0    ║');
console.log('╚════════════════════════════════╝');
console.log(`Cargando configuración desde: ${envPath}`);
console.log(`RabbitMQ: ${process.env.RABBITMQ_URL ?? '(no configurado)'}`);
console.log('');

async function iniciar(intento = 1): Promise<void> {
  try {
    await conectar();
    escucharPedidoNuevo();
    escucharPedidoEstado();
    console.log('✓ Worker activo. Escuchando colas...');
    console.log('  Presiona Ctrl+C para detener.\n');
  } catch (err) {
    if (intento >= 10) {
      console.error('✗ No se pudo conectar a RabbitMQ tras 10 intentos. Cerrando.');
      process.exit(1);
    }
    const espera = Math.min(intento * 2000, 15000);
    console.warn(`  RabbitMQ no disponible, reintentando en ${espera / 1000}s (${intento}/10)...`);
    await new Promise((r) => setTimeout(r, espera));
    return iniciar(intento + 1);
  }
}

iniciar();
