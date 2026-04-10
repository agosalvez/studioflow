import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../composables/useApi';

export interface TenantResumen {
  id: string;
  nombre: string;
  slug: string;
  creadoEn: string;
  totalUsuarios: number;
  totalPedidos: number;
  totalArchivos: number;
}

export interface TenantDetalle {
  id: string;
  nombre: string;
  slug: string;
  creadoEn: string;
  stats: {
    totalPedidos: number;
    totalArchivos: number;
    totalUsuarios: number;
    porEstado: Record<string, number>;
  };
  pedidosRecientes: {
    id: string;
    referencia: string;
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
    numArchivos: number;
  }[];
  usuarios: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    creadoEn: string;
  }[];
}

export const useSuperAdminStore = defineStore('superadmin', () => {
  const tenants = ref<TenantResumen[]>([]);
  const detalle = ref<TenantDetalle | null>(null);
  const cargandoTenants = ref(false);
  const cargandoDetalle = ref(false);

  async function cargarTenants() {
    cargandoTenants.value = true;
    try {
      const { data } = await api.get('/api/superadmin/tenants');
      tenants.value = data;
    } finally {
      cargandoTenants.value = false;
    }
  }

  async function cargarDetalle(id: string) {
    cargandoDetalle.value = true;
    detalle.value = null;
    try {
      const { data } = await api.get(`/api/superadmin/tenants/${id}`);
      detalle.value = data;
    } finally {
      cargandoDetalle.value = false;
    }
  }

  return { tenants, detalle, cargandoTenants, cargandoDetalle, cargarTenants, cargarDetalle };
});
