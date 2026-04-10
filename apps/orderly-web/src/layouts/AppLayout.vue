<template>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">SF</span>
        <span class="logo-text">Orderly</span>
      </div>
      <nav class="sidebar-nav">
        <template v-if="!auth.esSuperAdmin">
          <RouterLink to="/pedidos" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>Pedidos</span>
          </RouterLink>
        </template>
        <template v-if="auth.esAdmin">
          <div class="nav-separator">Admin</div>
          <RouterLink to="/admin/dashboard" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/admin/usuarios" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>Usuarios</span>
          </RouterLink>
        </template>
        <template v-if="auth.esSuperAdmin">
          <div class="nav-separator">Super Admin</div>
          <RouterLink to="/superadmin/tenants" class="nav-item">
            <span class="nav-icon">🏢</span>
            <span>Tenants</span>
          </RouterLink>
        </template>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-nombre">{{ auth.usuario?.nombre }}</span>
          <span class="user-rol">{{ auth.usuario?.rol }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast.store';

const auth = useAuthStore();
const router = useRouter();
const toast = useToastStore();

function handleLogout() {
  const nombre = auth.usuario?.nombre ?? 'Usuario';
  auth.logout();
  toast.info(`Hasta pronto, ${nombre}`);
  router.push('/login');
}
</script>

<style scoped>
.app { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #1a1d23; color: #fff; display: flex; flex-direction: column; padding: 1.5rem 1rem; gap: 1.5rem; flex-shrink: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; font-weight: 700; }
.logo-icon { background: #6366f1; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 8px; color: #a1a1aa; text-decoration: none; font-size: 0.9rem; transition: background 0.15s, color 0.15s; }
.nav-item:hover, .nav-item.router-link-active { background: #2d3139; color: #fff; }
.nav-separator { font-size: 0.7rem; text-transform: uppercase; color: #52525b; letter-spacing: 0.08em; padding: 0.75rem 0.75rem 0.25rem; }
.sidebar-footer { display: flex; flex-direction: column; gap: 0.5rem; }
.user-info { display: flex; flex-direction: column; }
.user-nombre { font-size: 0.85rem; font-weight: 600; color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-rol { font-size: 0.72rem; color: #52525b; text-transform: uppercase; }
.btn-logout { background: transparent; border: 1px solid #3f3f46; color: #a1a1aa; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: border-color 0.15s, color 0.15s; }
.btn-logout:hover { border-color: #6366f1; color: #fff; }
.main { flex: 1; background: #f4f4f5; overflow-y: auto; }
</style>
