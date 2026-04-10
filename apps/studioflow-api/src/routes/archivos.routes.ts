import { Router } from 'express';
import * as archivosController from '../controllers/archivos.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

router.use(autenticar);

router.get('/:id/download', archivosController.descargar);
router.delete('/:id', archivosController.eliminar);

export default router;
