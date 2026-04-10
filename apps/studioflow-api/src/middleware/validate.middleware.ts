import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validar(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({
        error: 'Datos inválidos',
        detalles: resultado.error.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        })),
      });
      return;
    }
    req.body = resultado.data;
    next();
  };
}
