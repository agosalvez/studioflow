import { z } from 'zod';

export const schemaCrearPedido = z.object({
  referencia: z.string().min(1, 'La referencia es requerida').max(100),
  observaciones: z.string().max(2000).optional(),
});

export const schemaCambiarEstado = z.object({
  estado: z.enum(['RECIBIDO', 'EN_PRODUCCION', 'TERMINADO', 'ENTREGADO'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
});

export const schemaPaginacion = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
  estado: z.enum(['RECIBIDO', 'EN_PRODUCCION', 'TERMINADO', 'ENTREGADO']).optional(),
});
