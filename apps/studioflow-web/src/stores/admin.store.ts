import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../composables/useApi';

export type Rol = 'ADMIN' | 'OPERARIO' | 'CLIENTE';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  creadoEn: string;
}

export interface Stats {
  totalPedidos: number;
  porEstado: Record<string, number>;
  totalArchivos: number;
  totalUsuarios: number;
}

export const useAdminStore = defineStore('admin', () => {
  const usuarios = ref<Usuario[]>([]);
  const stats = ref<Stats | null>(null);
  const cargando = ref(false);

  async function cargarUsuarios() {
    cargando.value = true;
    try {
      const { data } = await api.get('/api/admin/usuarios');
      usuarios.value = data;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarStats() {
    const { data } = await api.get('/api/admin/stats');
    stats.value = data;
  }

  async function cambiarRol(id: string, rol: Rol) {
    const { data } = await api.patch(`/api/admin/usuarios/${id}/rol`, { rol });
    const idx = usuarios.value.findIndex((u) => u.id === id);
    if (idx !== -1) usuarios.value[idx] = data;
  }

  async function eliminarUsuario(id: string) {
    await api.delete(`/api/admin/usuarios/${id}`);
    usuarios.value = usuarios.value.filter((u) => u.id !== id);
  }

  return { usuarios, stats, cargando, cargarUsuarios, cargarStats, cambiarRol, eliminarUsuario };
});
