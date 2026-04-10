import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as pedidosController from '../controllers/pedidos.controller';
import * as archivosController from '../controllers/archivos.controller';
import { autenticar, requireRol, RequestAutenticada } from '../middleware/auth.middleware';
import { validar } from '../middleware/validate.middleware';
import { schemaCrearPedido, schemaCambiarEstado } from '../schemas/pedidos.schema';

const storage = multer.diskStorage({
  destination: (req: RequestAutenticada, _file, cb) => {
    const dir = path.join('uploads', req.usuario?.tenantId ?? 'unknown', req.params.pedidoId ?? 'tmp');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

const router = Router();

router.use(autenticar);

router.get('/', pedidosController.listar);
router.post('/', requireRol('ADMIN', 'OPERARIO'), validar(schemaCrearPedido), pedidosController.crear);
router.get('/:id', pedidosController.obtener);
router.patch('/:id/estado', requireRol('ADMIN', 'OPERARIO'), validar(schemaCambiarEstado), pedidosController.actualizarEstado);
router.delete('/:id', requireRol('ADMIN'), pedidosController.eliminar);
router.post('/:pedidoId/archivos', upload.single('archivo'), archivosController.subir);

export default router;
