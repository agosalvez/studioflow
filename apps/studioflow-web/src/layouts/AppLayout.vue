<template>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">SF</span>
        <span class="logo-text">StudioFlow</span>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/pedidos" class="nav-item">
          <span class="nav-icon">📋</span>
          <span>Pedidos</span>
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <span class="user-email">{{ auth.usuario?.email }}</span>
        <button class="btn-logout" @click="auth.logout(); router.push('/login')">Salir</button>
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

const auth = useAuthStore();
const router = useRouter();
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 220px;
  background: #1a1d23;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  gap: 2rem;
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
}
.logo-icon {
  background: #6366f1;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover,
.nav-item.router-link-active {
  background: #2d3139;
  color: #fff;
}
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.user-email {
  color: #71717a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-logout {
  background: transparent;
  border: 1px solid #3f3f46;
  color: #a1a1aa;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: border-color 0.15s, color 0.15s;
}
.btn-logout:hover {
  border-color: #6366f1;
  color: #fff;
}
.main {
  flex: 1;
  background: #f4f4f5;
  overflow-y: auto;
}
</style>
