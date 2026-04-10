import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/LoginView.vue'),
      meta: { publica: true },
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/pedidos' },
        { path: 'pedidos', component: () => import('../views/PedidosView.vue') },
        { path: 'pedidos/:id', component: () => import('../views/PedidoDetalleView.vue') },
        {
          path: 'admin',
          meta: { soloAdmin: true },
          children: [
            { path: '', redirect: '/admin/dashboard' },
            { path: 'dashboard', component: () => import('../views/admin/DashboardView.vue') },
            { path: 'usuarios', component: () => import('../views/admin/UsuariosView.vue') },
          ],
        },
        {
          path: 'superadmin',
          meta: { soloSuperAdmin: true },
          children: [
            { path: '', redirect: '/superadmin/tenants' },
            { path: 'tenants', component: () => import('../views/superadmin/TenantsView.vue') },
          ],
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!to.meta.publica && !auth.autenticado) return '/login';
  if (to.path === '/login' && auth.autenticado) return '/pedidos';
  if (auth.autenticado && !auth.usuario) await auth.cargarPerfil();
  if (to.meta.soloAdmin && !auth.esAdmin) return '/pedidos';
  if (to.meta.soloSuperAdmin && !auth.esSuperAdmin) return '/pedidos';
});
