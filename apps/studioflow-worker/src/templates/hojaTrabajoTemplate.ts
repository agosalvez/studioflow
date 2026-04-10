export interface DatosPedido {
  referencia: string;
  observaciones?: string | null;
  estado: string;
  creadoEn: string;
  archivos: { nombre: string; tamaño: number; mimeType: string }[];
  tenant: string;
}

export function generarHojaTrabajo(pedido: DatosPedido): string {
  const etiquetaEstado: Record<string, string> = {
    RECIBIDO: 'Recibido',
    EN_PRODUCCION: 'En producción',
    TERMINADO: 'Terminado',
    ENTREGADO: 'Entregado',
  };

  const formatTamaño = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const archivosHtml = pedido.archivos
    .map(
      (a) => `
      <tr>
        <td>${a.nombre}</td>
        <td>${a.mimeType}</td>
        <td>${formatTamaño(a.tamaño)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Hoja de trabajo — ${pedido.referencia}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; color: #18181b; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .logo { font-size: 1.5rem; font-weight: 800; color: #6366f1; }
    .ref { font-size: 1.2rem; font-weight: 700; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; margin-bottom: 1.5rem; }
    .meta-item label { font-size: 0.75rem; color: #71717a; display: block; text-transform: uppercase; }
    .meta-item span { font-weight: 600; }
    .estado { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-weight: 600; font-size: 0.9rem; }
    .obs { background: #fafafa; border-left: 3px solid #6366f1; padding: 0.75rem 1rem; margin-bottom: 1.5rem; border-radius: 0 8px 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    th { background: #f4f4f5; text-align: left; padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #52525b; }
    td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    .firma { margin-top: 3rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .firma-box { border-top: 1px solid #d4d4d8; padding-top: 0.5rem; font-size: 0.8rem; color: #71717a; }
    .print-btn { position: fixed; bottom: 2rem; right: 2rem; padding: 0.75rem 1.5rem; background: #6366f1; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡ StudioFlow</div>
    <div>
      <div class="ref">${pedido.referencia}</div>
      <div style="font-size:0.85rem;color:#71717a">${pedido.tenant}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><label>Fecha de recepción</label><span>${new Date(pedido.creadoEn).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
    <div class="meta-item"><label>Estado</label><span class="estado">${etiquetaEstado[pedido.estado] ?? pedido.estado}</span></div>
    <div class="meta-item"><label>Nº archivos</label><span>${pedido.archivos.length}</span></div>
    <div class="meta-item"><label>Generado</label><span>${new Date().toLocaleString('es-ES')}</span></div>
  </div>

  ${pedido.observaciones ? `<div class="obs"><strong>Observaciones:</strong><br>${pedido.observaciones}</div>` : ''}

  <h3 style="margin-bottom:0.5rem">Archivos adjuntos</h3>
  ${
    pedido.archivos.length === 0
      ? '<p style="color:#71717a">Sin archivos adjuntos</p>'
      : `<table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Tamaño</th></tr></thead>
          <tbody>${archivosHtml}</tbody>
        </table>`
  }

  <div class="firma">
    <div class="firma-box">Firma operario</div>
    <div class="firma-box">Firma cliente / recogida</div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir</button>
</body>
</html>`;
}
