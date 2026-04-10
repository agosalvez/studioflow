import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validate.middleware';
import { limitadorAuth } from '../middleware/rateLimit.middleware';
import { schemaLogin, schemaRegistro, schemaTenant, schemaRefresh } from '../schemas/auth.schema';

const router = Router();

router.post('/tenants', validar(schemaTenant), authController.crearTenant);
router.post('/register', limitadorAuth, validar(schemaRegistro), authController.registro);
router.post('/login', limitadorAuth, validar(schemaLogin), authController.login);
router.post('/refresh', validar(schemaRefresh), authController.refresh);
router.get('/me', autenticar, authController.me);

export default router;
