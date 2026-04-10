import amqplib, { Channel, Connection } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

const COLAS = [
  { nombre: 'pedido.nuevo',   dlx: 'pedido.nuevo.dlx',   dlq: 'pedido.nuevo.dlq' },
  { nombre: 'pedido.estado',  dlx: 'pedido.estado.dlx',  dlq: 'pedido.estado.dlq' },
];

export async function conectar(): Promise<Channel> {
  const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  channel.prefetch(1);

  for (const cola of COLAS) {
    // Dead-letter exchange
    await channel.assertExchange(cola.dlx, 'direct', { durable: true });
    // Dead-letter queue
    await channel.assertQueue(cola.dlq, { durable: true });
    await channel.bindQueue(cola.dlq, cola.dlx, cola.nombre);
    // Cola principal con DLX configurado
    await channel.assertQueue(cola.nombre, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': cola.dlx,
        'x-dead-letter-routing-key': cola.nombre,
        'x-message-ttl': 60000, // 1 min antes de ir a DLQ si no se ack
      },
    });
  }

  console.log('Worker conectado a RabbitMQ con DLQ configurado');
  return channel;
}

export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ no está conectado');
  return channel;
}
