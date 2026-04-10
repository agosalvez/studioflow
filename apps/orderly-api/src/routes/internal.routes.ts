import { Router, Request, Response } from 'express';
import { autenticarInterno } from '../middleware/internal.middleware';
import prisma from '../lib/prisma';

const router = Router();

router.use(autenticarInterno);

router.get('/pedidos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: { archivos: true, tenant: true },
    });
    if (!pedido) { res.status(404).json({ error: 'Pedido no encontrado' }); return; }
    res.json(pedido);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
