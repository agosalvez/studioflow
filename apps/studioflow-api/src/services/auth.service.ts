import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { firmarToken } from '../lib/jwt';

export async function registrar(datos: {
  email: string;
  nombre: string;
  password: string;
  tenantSlug: string;
}) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: datos.tenantSlug } });
  if (!tenant) throw new Error('Tenant no encontrado');

  const existe = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existe) throw new Error('El email ya está registrado');

  const passwordHash = await bcrypt.hash(datos.password, 10);
  const usuario = await prisma.usuario.create({
    data: { email: datos.email, nombre: datos.nombre, passwordHash, tenantId: tenant.id },
  });

  const token = firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol, tenantId: tenant.id });
  return { token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol } };
}

export async function login(datos: { email: string; password: string }) {
  const usuario = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (!usuario) throw new Error('Credenciales incorrectas');

  const valido = await bcrypt.compare(datos.password, usuario.passwordHash);
  if (!valido) throw new Error('Credenciales incorrectas');

  const token = firmarToken({ sub: usuario.id, email: usuario.email, rol: usuario.rol, tenantId: usuario.tenantId });
  return { token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol } };
}

export async function crearTenant(datos: { nombre: string; slug: string }) {
  const existe = await prisma.tenant.findUnique({ where: { slug: datos.slug } });
  if (existe) throw new Error('El slug ya está en uso');
  return prisma.tenant.create({ data: datos });
}
