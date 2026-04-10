import prisma from '../lib/prisma';
import { EstadoPedido } from '@prisma/client';
import { publicar } from '../lib/rabbitmq';

export async function listarPedidos(tenantId: string) {
  return prisma.pedido.findMany({
    where: { tenantId },
    include: { archivos: true },
    orderBy: { creadoEn: 'desc' },
  });
}

export async function obtenerPedido(id: string, tenantId: string) {
  const pedido = await prisma.pedido.findFirst({
    where: { id, tenantId },
    include: { archivos: true },
  });
  if (!pedido) throw new Error('Pedido no encontrado');
  return pedido;
}

export async function crearPedido(datos: { referencia: string; observaciones?: string }, tenantId: string) {
  const pedido = await prisma.pedido.create({
    data: { ...datos, tenantId },
    include: { archivos: true },
  });
  await publicar('pedido.nuevo', { pedidoId: pedido.id, tenantId });
  return pedido;
}

export async function cambiarEstado(id: string, estado: EstadoPedido, tenantId: string) {
  const pedido = await prisma.pedido.findFirst({ where: { id, tenantId } });
  if (!pedido) throw new Error('Pedido no encontrado');

  const actualizado = await prisma.pedido.update({
    where: { id },
    data: { estado },
    include: { archivos: true },
  });
  await publicar('pedido.estado', { pedidoId: id, estado, tenantId });
  return actualizado;
}

export async function eliminarPedido(id: string, tenantId: string) {
  const pedido = await prisma.pedido.findFirst({ where: { id, tenantId } });
  if (!pedido) throw new Error('Pedido no encontrado');
  await prisma.pedido.delete({ where: { id } });
}
