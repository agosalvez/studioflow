import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../composables/useApi';

export type EstadoPedido = 'RECIBIDO' | 'EN_PRODUCCION' | 'TERMINADO' | 'ENTREGADO';

export interface Archivo {
  id: string;
  nombre: string;
  tamaño: number;
  mimeType: string;
  creadoEn: string;
}

export interface Pedido {
  id: string;
  referencia: string;
  observaciones?: string;
  estado: EstadoPedido;
  creadoEn: string;
  archivos: Archivo[];
}

export const usePedidosStore = defineStore('pedidos', () => {
  const pedidos = ref<Pedido[]>([]);
  const pedidoActual = ref<Pedido | null>(null);
  const cargando = ref(false);

  async function cargar() {
    cargando.value = true;
    try {
      const { data } = await api.get('/api/pedidos');
      pedidos.value = data;
    } finally {
      cargando.value = false;
    }
  }

  async function obtener(id: string) {
    const { data } = await api.get(`/api/pedidos/${id}`);
    pedidoActual.value = data;
    return data as Pedido;
  }

  async function crear(datos: { referencia: string; observaciones?: string }) {
    const { data } = await api.post('/api/pedidos', datos);
    pedidos.value.unshift(data);
    return data as Pedido;
  }

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    const { data } = await api.patch(`/api/pedidos/${id}/estado`, { estado });
    const idx = pedidos.value.findIndex((p) => p.id === id);
    if (idx !== -1) pedidos.value[idx] = data;
    if (pedidoActual.value?.id === id) pedidoActual.value = data;
    return data as Pedido;
  }

  async function eliminar(id: string) {
    await api.delete(`/api/pedidos/${id}`);
    pedidos.value = pedidos.value.filter((p) => p.id !== id);
  }

  async function subirArchivo(pedidoId: string, archivo: File) {
    const form = new FormData();
    form.append('archivo', archivo);
    const { data } = await api.post(`/api/pedidos/${pedidoId}/archivos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (pedidoActual.value?.id === pedidoId) {
      pedidoActual.value.archivos.push(data);
    }
    return data as Archivo;
  }

  return { pedidos, pedidoActual, cargando, cargar, obtener, crear, cambiarEstado, eliminar, subirArchivo };
});
