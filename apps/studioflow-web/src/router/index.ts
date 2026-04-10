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
        {
          path: '',
          redirect: '/pedidos',
        },
        {
          path: 'pedidos',
          component: () => import('../views/PedidosView.vue'),
        },
        {
          path: 'pedidos/:id',
          component: () => import('../views/PedidoDetalleView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!to.meta.publica && !auth.autenticado) return '/login';
  if (to.path === '/login' && auth.autenticado) return '/pedidos';
});
