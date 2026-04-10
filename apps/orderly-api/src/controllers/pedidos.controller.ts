import { Response } from 'express';
import { EstadoPedido } from '@prisma/client';
import * as pedidosService from '../services/pedidos.service';
import { schemaPaginacion } from '../schemas/pedidos.schema';
import { RequestAutenticada } from '../middleware/auth.middleware';

export async function listar(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    const { pagina, limite, estado } = schemaPaginacion.parse(req.query);
    const resultado = await pedidosService.listarPedidos(req.usuario!.tenantId, {
      pagina,
      limite,
      estado: estado as EstadoPedido | undefined,
    });
    res.json(resultado);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function obtener(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    const pedido = await pedidosService.obtenerPedido(req.params.id, req.usuario!.tenantId);
    res.json(pedido);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function crear(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    const pedido = await pedidosService.crearPedido(req.body, req.usuario!.tenantId);
    res.status(201).json(pedido);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function actualizarEstado(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    const { estado } = req.body as { estado: EstadoPedido };
    const pedido = await pedidosService.cambiarEstado(req.params.id, estado, req.usuario!.tenantId);
    res.json(pedido);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function eliminar(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    await pedidosService.eliminarPedido(req.params.id, req.usuario!.tenantId);
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
