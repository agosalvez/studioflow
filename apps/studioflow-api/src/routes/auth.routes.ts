import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { autenticar } from '../middleware/auth.middleware';

const router = Router();

router.post('/tenants', authController.crearTenant);
router.post('/register', authController.registro);
router.post('/login', authController.login);
router.get('/me', autenticar, authController.me);

export default router;
