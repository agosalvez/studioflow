import amqplib, { Channel, Connection } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function conectar(): Promise<Channel> {
  const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();

  await channel.assertQueue('pedido.nuevo', { durable: true });
  await channel.assertQueue('pedido.estado', { durable: true });

  channel.prefetch(1);
  console.log('Worker conectado a RabbitMQ');
  return channel;
}

export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ no está conectado');
  return channel;
}
