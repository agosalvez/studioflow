import jwt from 'jsonwebtoken';

const SECRET         = process.env.JWT_SECRET         ?? 'dev_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  tenantId: string;
}

export function firmarToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' });
}

export function firmarRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verificarToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export function verificarRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
