import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, method: req.method, url: req.url }, 'Error no controlado');
  res.status(500).json({ error: err.message ?? 'Error interno del servidor' });
}
