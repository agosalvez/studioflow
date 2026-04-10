import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { RequestAutenticada } from '../middleware/auth.middleware';

export async function registro(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req: RequestAutenticada, res: Response): Promise<void> {
  res.json(req.usuario);
}

export async function crearTenant(req: Request, res: Response): Promise<void> {
  try {
    const tenant = await authService.crearTenant(req.body);
    res.status(201).json(tenant);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
