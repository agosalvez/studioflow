import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import logger from './lib/logger';
import authRoutes from './routes/auth.routes';
import pedidosRoutes from './routes/pedidos.routes';
import archivosRoutes from './routes/archivos.routes';
import adminRoutes from './routes/admin.routes';
import internalRoutes from './routes/internal.routes';
import { errorHandler } from './middleware/error.middleware';
import { limitadorGeneral } from './middleware/rateLimit.middleware';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors());
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(limitadorGeneral);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'orderly-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/internal', internalRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`orderly-api corriendo en http://localhost:${PORT}`);
});
