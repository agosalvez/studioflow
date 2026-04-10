import { Response } from 'express';
import path from 'path';
import * as archivosService from '../services/archivos.service';
import { RequestAutenticada } from '../middleware/auth.middleware';

export async function subir(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ningún archivo' });
      return;
    }
    const archivo = await archivosService.registrarArchivo({
      pedidoId: req.params.pedidoId,
      tenantId: req.usuario!.tenantId,
      nombre: req.file.originalname,
      ruta: req.file.path,
      tamaño: req.file.size,
      mimeType: req.file.mimetype,
    });
    res.status(201).json(archivo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function descargar(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    const archivo = await archivosService.obtenerArchivo(req.params.id, req.usuario!.tenantId);
    const rutaAbsoluta = path.join(process.cwd(), archivo.ruta);
    res.download(rutaAbsoluta, archivo.nombre);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function eliminar(req: RequestAutenticada, res: Response): Promise<void> {
  try {
    await archivosService.eliminarArchivo(req.params.id, req.usuario!.tenantId);
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
