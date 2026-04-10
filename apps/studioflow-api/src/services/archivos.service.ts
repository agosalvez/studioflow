import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';

export async function registrarArchivo(datos: {
  pedidoId: string;
  tenantId: string;
  nombre: string;
  ruta: string;
  tamaño: number;
  mimeType: string;
}) {
  const pedido = await prisma.pedido.findFirst({ where: { id: datos.pedidoId, tenantId: datos.tenantId } });
  if (!pedido) throw new Error('Pedido no encontrado');

  return prisma.archivo.create({
    data: {
      nombre: datos.nombre,
      ruta: datos.ruta,
      tamaño: datos.tamaño,
      mimeType: datos.mimeType,
      pedidoId: datos.pedidoId,
    },
  });
}

export async function obtenerArchivo(id: string, tenantId: string) {
  const archivo = await prisma.archivo.findFirst({
    where: { id, pedido: { tenantId } },
    include: { pedido: true },
  });
  if (!archivo) throw new Error('Archivo no encontrado');
  return archivo;
}

export async function eliminarArchivo(id: string, tenantId: string) {
  const archivo = await prisma.archivo.findFirst({
    where: { id, pedido: { tenantId } },
  });
  if (!archivo) throw new Error('Archivo no encontrado');

  const rutaAbsoluta = path.join(process.cwd(), archivo.ruta);
  if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);

  await prisma.archivo.delete({ where: { id } });
}
