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
  const usuario = ref<Usuario | null>(null);

  const autenticado = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    token.value = data.token;
    localStorage.setItem('token', data.token);
    usuario.value = data.usuario;
  }

  async function cargarPerfil() {
    if (!token.value) return;
    const { data } = await api.get('/api/auth/me');
    usuario.value = data;
  }

  function logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('token');
  }

  return { token, usuario, autenticado, login, cargarPerfil, logout };
});
