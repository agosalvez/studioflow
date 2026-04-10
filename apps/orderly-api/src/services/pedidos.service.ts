import prisma from '../lib/prisma';
import { EstadoPedido } from '@prisma/client';
import { publicar } from '../lib/rabbitmq';
import { enviarEmail, emailCambioEstado } from '../lib/mailer';

export async function listarPedidos(tenantId: string, opciones: {
  pagina: number;
  limite: number;
  estado?: EstadoPedido;
}) {
  const { pagina, limite, estado } = opciones;
  const where = { tenantId, ...(estado ? { estado } : {}) };

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({
      where,
      include: { archivos: true },
      orderBy: { creadoEn: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ]);

  return {
    datos: pedidos,
    paginacion: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
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

  // Notificar por email a los clientes del tenant cuando cambia el estado
  const clientes = await prisma.usuario.findMany({
    where: { tenantId, rol: 'CLIENTE' },
    select: { email: true, nombre: true },
  });
  for (const cliente of clientes) {
    await enviarEmail({
      to: cliente.email,
      subject: `Pedido ${pedido.referencia} — estado actualizado`,
      html: emailCambioEstado({ nombreCliente: cliente.nombre, referencia: pedido.referencia, estado }),
    });
  }

  return actualizado;
}

export async function eliminarPedido(id: string, tenantId: string) {
  const pedido = await prisma.pedido.findFirst({ where: { id, tenantId } });
  if (!pedido) throw new Error('Pedido no encontrado');
  await prisma.pedido.delete({ where: { id } });
}
