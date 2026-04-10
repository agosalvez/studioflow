import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { firmarToken, firmarRefreshToken, verificarRefreshToken } from '../lib/jwt';

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

  const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, tenantId: tenant.id };
  return {
    token: firmarToken(payload),
    refreshToken: firmarRefreshToken(payload),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
  };
}

export async function login(datos: { email: string; password: string }) {
  const usuario = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (!usuario) throw new Error('Credenciales incorrectas');

  const valido = await bcrypt.compare(datos.password, usuario.passwordHash);
  if (!valido) throw new Error('Credenciales incorrectas');

  const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, tenantId: usuario.tenantId };
  return {
    token: firmarToken(payload),
    refreshToken: firmarRefreshToken(payload),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
  };
}

export async function refresh(refreshToken: string) {
  const payload = verificarRefreshToken(refreshToken);
  const usuario = await prisma.usuario.findUnique({ where: { id: payload.sub } });
  if (!usuario) throw new Error('Usuario no encontrado');

  const nuevoPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, tenantId: usuario.tenantId };
  return {
    token: firmarToken(nuevoPayload),
    refreshToken: firmarRefreshToken(nuevoPayload),
  };
}

export async function crearTenant(datos: { nombre: string; slug: string }) {
  const existe = await prisma.tenant.findUnique({ where: { slug: datos.slug } });
  if (existe) throw new Error('El slug ya está en uso');
  return prisma.tenant.create({ data: datos });
}
