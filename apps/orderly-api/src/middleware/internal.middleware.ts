import { Request, Response, NextFunction } from 'express';

export function autenticarInterno(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-internal-key'];
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || key !== expected) {
    res.status(401).json({ error: 'Clave interna requerida' });
    return;
  }
  next();
}
