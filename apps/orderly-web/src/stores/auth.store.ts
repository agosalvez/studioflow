import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../composables/useApi';

interface Usuario {
  sub: string;
  email: string;
  nombre: string;
  rol: string;
  tenantId: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const usuario = ref<Usuario | null>(null);

  const autenticado = computed(() => !!token.value);
  const esSuperAdmin = computed(() => usuario.value?.rol === 'SUPERADMIN');
  const esAdmin = computed(() => usuario.value?.rol === 'ADMIN');
  const esCliente = computed(() => usuario.value?.rol === 'CLIENTE');

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    token.value = data.token;
    refreshToken.value = data.refreshToken;
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    usuario.value = data.usuario;
  }

  async function renovarToken() {
    if (!refreshToken.value) throw new Error('Sin refresh token');
    const { data } = await api.post('/api/auth/refresh', { refreshToken: refreshToken.value });
    token.value = data.token;
    refreshToken.value = data.refreshToken;
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  async function cargarPerfil() {
    if (!token.value) return;
    const { data } = await api.get('/api/auth/me');
    usuario.value = data;
  }

  function logout() {
    token.value = null;
    refreshToken.value = null;
    usuario.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  return { token, usuario, autenticado, esSuperAdmin, esAdmin, esCliente, login, renovarToken, cargarPerfil, logout };
});
