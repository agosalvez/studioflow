import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarEmail(opciones: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP no configurado, email no enviado');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'StudioFlow <noreply@studioflow.app>',
      ...opciones,
    });
    logger.info({ to: opciones.to, subject: opciones.subject }, 'Email enviado');
  } catch (err) {
    logger.error({ err }, 'Error enviando email');
  }
}

export function emailCambioEstado(datos: {
  nombreCliente: string;
  referencia: string;
  estado: string;
}): string {
  const etiquetas: Record<string, string> = {
    RECIBIDO: 'Recibido',
    EN_PRODUCCION: 'En producción',
    TERMINADO: 'Terminado ✓',
    ENTREGADO: 'Entregado ✓',
  };
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#6366f1">StudioFlow</h2>
      <p>Hola <strong>${datos.nombreCliente}</strong>,</p>
      <p>Tu pedido <strong>${datos.referencia}</strong> ha cambiado de estado:</p>
      <div style="background:#f4f4f5;border-radius:8px;padding:1rem;text-align:center;font-size:1.2rem;font-weight:bold;color:#18181b">
        ${etiquetas[datos.estado] ?? datos.estado}
      </div>
      <p style="color:#71717a;font-size:0.85rem;margin-top:2rem">StudioFlow — Gestión de pedidos para estudios y talleres</p>
    </div>
  `;
}
