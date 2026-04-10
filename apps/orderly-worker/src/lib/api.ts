import https from 'https';
import http from 'http';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

export function fetchPedido(pedidoId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}/api/pedidos/${pedidoId}`;
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'x-internal-key': process.env.INTERNAL_API_KEY ?? '' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout al obtener pedido')); });
  });
}
