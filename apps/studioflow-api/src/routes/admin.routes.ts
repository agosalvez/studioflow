import { Router, Response } from 'express';
import { autenticar, requireRol, RequestAutenticada } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { Rol } from '@prisma/client';

const router = Router();

router.use(autenticar, requireRol('ADMIN'));

// Listar usuarios del tenant
router.get('/usuarios', async (req: RequestAutenticada, res: Response): Promise<void> => {
  const usuarios = await prisma.usuario.findMany({
    where: { tenantId: req.usuario!.tenantId },
    select: { id: true, email: true, nombre: true, rol: true, creadoEn: true },
    orderBy: { creadoEn: 'asc' },
  });
  res.json(usuarios);
});

// Cambiar rol de un usuario
router.patch('/usuarios/:id/rol', async (req: RequestAutenticada, res: Response): Promise<void> => {
  const { rol } = req.body as { rol: Rol };
  const rolesValidos: Rol[] = ['ADMIN', 'OPERARIO', 'CLIENTE'];
  if (!rolesValidos.includes(rol)) {
    res.status(400).json({ error: 'Rol inválido' });
    return;
  }
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { id: req.params.id, tenantId: req.usuario!.tenantId },
    });
    if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    const actualizado = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { rol },
      select: { id: true, email: true, nombre: true, rol: true },
    });
    res.json(actualizado);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req: RequestAutenticada, res: Response): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { id: req.params.id, tenantId: req.usuario!.tenantId },
    });
    if (!usuario) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    if (usuario.id === req.usuario!.sub) { res.status(400).json({ error: 'No puedes eliminarte a ti mismo' }); return; }

    await prisma.usuario.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stats del tenant
router.get('/stats', async (req: RequestAutenticada, res: Response): Promise<void> => {
  const tenantId = req.usuario!.tenantId;
  const [totalPedidos, porEstado, totalArchivos, totalUsuarios] = await Promise.all([
    prisma.pedido.count({ where: { tenantId } }),
    prisma.pedido.groupBy({ by: ['estado'], where: { tenantId }, _count: true }),
    prisma.archivo.count({ where: { pedido: { tenantId } } }),
    prisma.usuario.count({ where: { tenantId } }),
  ]);

  res.json({
    totalPedidos,
    porEstado: Object.fromEntries(porEstado.map((e) => [e.estado, e._count])),
    totalArchivos,
    totalUsuarios,
  });
});

export default router;
