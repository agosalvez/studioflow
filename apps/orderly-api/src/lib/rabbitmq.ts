import amqplib, { Channel, Connection } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function conectarRabbitMQ(): Promise<Channel> {
  if (channel) return channel;
  const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();
  await channel.assertQueue('pedido.nuevo', { durable: true });
  await channel.assertQueue('pedido.estado', { durable: true });
  console.log('RabbitMQ conectado');
  return channel;
}

export async function publicar(cola: string, datos: object): Promise<void> {
  const ch = await conectarRabbitMQ();
  ch.sendToQueue(cola, Buffer.from(JSON.stringify(datos)), { persistent: true });
}
