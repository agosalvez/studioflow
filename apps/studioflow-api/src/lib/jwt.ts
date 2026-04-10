import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dev_secret';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  tenantId: string;
}

export function firmarToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verificarToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
