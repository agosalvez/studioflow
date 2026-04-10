import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as pedidosController from '../controllers/pedidos.controller';
import * as archivosController from '../controllers/archivos.controller';
import { autenticar } from '../middleware/auth.middleware';
import { RequestAutenticada } from '../middleware/auth.middleware';

const storage = multer.diskStorage({
  destination: (req: RequestAutenticada, _file, cb) => {
    const dir = path.join('uploads', req.usuario?.tenantId ?? 'unknown', req.params.pedidoId ?? 'tmp');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unico = `${Date.now()}-${file.originalname}`;
    cb(null, unico);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

const router = Router();

router.use(autenticar);

router.get('/', pedidosController.listar);
router.post('/', pedidosController.crear);
router.get('/:id', pedidosController.obtener);
router.patch('/:id/estado', pedidosController.actualizarEstado);
router.delete('/:id', pedidosController.eliminar);

router.post('/:pedidoId/archivos', upload.single('archivo'), archivosController.subir);

export default router;
