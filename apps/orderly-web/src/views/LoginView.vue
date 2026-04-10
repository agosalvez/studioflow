<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">SF</span>
        <span class="logo-title">Orderly</span>
      </div>
      <h1 class="login-heading">Iniciar sesión</h1>

      <div v-if="sesionExpirada" class="aviso-expiracion">
        Tu sesión ha expirado. Vuelve a iniciar sesión.
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';

const email = ref('');
const password = ref('');
const cargando = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const sesionExpirada = computed(() => route.query.sesion === 'expirada');

async function handleLogin() {
  cargando.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push(auth.esSuperAdmin ? '/superadmin/tenants' : '/pedidos');
  } catch (e: any) {
    toast.error(e.response?.data?.error ?? 'Error al iniciar sesión');
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.login-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.logo-icon {
  background: #6366f1;
  color: #fff;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
}
.logo-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #18181b;
}
.login-heading {
  font-size: 1.3rem;
  font-weight: 600;
  color: #18181b;
  margin: 0 0 1.5rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #3f3f46;
}
.field input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus {
  border-color: #6366f1;
}
.aviso-expiracion {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.btn-primary {
  padding: 0.7rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 0.25rem;
}
.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
