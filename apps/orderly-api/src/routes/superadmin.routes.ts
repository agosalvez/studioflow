import { Router, Response } from 'express';
import { autenticar, requireRol, RequestAutenticada } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

const router = Router();

router.use(autenticar, requireRol('SUPERADMIN'));

// Listar todos los tenants con stats básicas
router.get('/tenants', async (_req: RequestAutenticada, res: Response): Promise<void> => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { creadoEn: 'asc' },
    include: {
      _count: { select: { usuarios: true, pedidos: true } },
    },
  });

  // Añadir count de archivos por tenant
  const conArchivos = await Promise.all(
    tenants.map(async (t) => ({
      id: t.id,
      nombre: t.nombre,
      slug: t.slug,
      creadoEn: t.creadoEn,
      totalUsuarios: t._count.usuarios,
      totalPedidos: t._count.pedidos,
      totalArchivos: await prisma.archivo.count({ where: { pedido: { tenantId: t.id } } }),
    }))
  );

  res.json(conArchivos);
});

// Detalle completo de un tenant
router.get('/tenants/:id', async (req: RequestAutenticada, res: Response): Promise<void> => {
  const { id } = req.params;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    res.status(404).json({ error: 'Tenant no encontrado' });
    return;
  }

  const [
    totalPedidos,
    porEstadoRaw,
    totalArchivos,
    usuarios,
    pedidosRecientes,
  ] = await Promise.all([
    prisma.pedido.count({ where: { tenantId: id } }),
    prisma.pedido.groupBy({ by: ['estado'], where: { tenantId: id }, _count: true }),
    prisma.archivo.count({ where: { pedido: { tenantId: id } } }),
    prisma.usuario.findMany({
      where: { tenantId: id },
      select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
      orderBy: { creadoEn: 'asc' },
    }),
    prisma.pedido.findMany({
      where: { tenantId: id },
      orderBy: { creadoEn: 'desc' },
      take: 10,
      select: {
        id: true,
        referencia: true,
        estado: true,
        creadoEn: true,
        actualizadoEn: true,
        _count: { select: { archivos: true } },
      },
    }),
  ]);

  res.json({
    id: tenant.id,
    nombre: tenant.nombre,
    slug: tenant.slug,
    creadoEn: tenant.creadoEn,
    stats: {
      totalPedidos,
      totalArchivos,
      totalUsuarios: usuarios.length,
      porEstado: Object.fromEntries(porEstadoRaw.map((e) => [e.estado, e._count])),
    },
    pedidosRecientes: pedidosRecientes.map((p) => ({
      id: p.id,
      referencia: p.referencia,
      estado: p.estado,
      creadoEn: p.creadoEn,
      actualizadoEn: p.actualizadoEn,
      numArchivos: p._count.archivos,
    })),
    usuarios,
  });
});

export default router;
