import { Request, Response, NextFunction } from 'express';
import { verificarToken, JwtPayload } from '../lib/jwt';

export interface RequestAutenticada extends Request {
  usuario?: JwtPayload;
}

export function autenticar(req: RequestAutenticada, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  try {
    req.usuario = verificarToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireRol(...roles: string[]) {
  return (req: RequestAutenticada, res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'Sin permisos suficientes' });
      return;
    }
    next();
  };
}
