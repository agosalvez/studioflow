<template>
  <div class="sa-page">
    <!-- Columna izquierda: lista de tenants -->
    <aside class="sa-sidebar">
      <div class="sa-sidebar-header">
        <h1 class="sa-title">Tenants</h1>
        <span class="sa-badge">{{ store.tenants.length }}</span>
      </div>

      <div v-if="store.cargandoTenants" class="sa-empty">Cargando…</div>
      <ul v-else class="tenant-list">
        <li
          v-for="t in store.tenants"
          :key="t.id"
          class="tenant-item"
          :class="{ activo: tenantSeleccionado === t.id }"
          @click="seleccionar(t.id)"
        >
          <div class="tenant-avatar">{{ iniciales(t.nombre) }}</div>
          <div class="tenant-info">
            <span class="tenant-nombre">{{ t.nombre }}</span>
            <span class="tenant-slug">{{ t.slug }}</span>
          </div>
          <div class="tenant-mini-stats">
            <span class="mini-stat" title="Pedidos">📋 {{ t.totalPedidos }}</span>
            <span class="mini-stat" title="Usuarios">👥 {{ t.totalUsuarios }}</span>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Panel derecho: detalle del tenant seleccionado -->
    <main class="sa-main">
      <div v-if="!tenantSeleccionado" class="sa-placeholder">
        <span class="placeholder-icon">🏢</span>
        <p>Selecciona un tenant para ver su actividad</p>
      </div>

      <div v-else-if="store.cargandoDetalle" class="sa-empty sa-empty--center">
        Cargando actividad…
      </div>

      <template v-else-if="store.detalle">
        <!-- Header del tenant -->
        <div class="detalle-header">
          <div class="detalle-avatar-lg">{{ iniciales(store.detalle.nombre) }}</div>
          <div>
            <h2 class="detalle-nombre">{{ store.detalle.nombre }}</h2>
            <span class="detalle-slug">{{ store.detalle.slug }}</span>
            <span class="detalle-fecha">· Desde {{ formatFecha(store.detalle.creadoEn) }}</span>
          </div>
        </div>

        <!-- Tarjetas de stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">📋</span>
            <div>
              <span class="stat-value">{{ store.detalle.stats.totalPedidos }}</span>
              <span class="stat-label">Pedidos totales</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📁</span>
            <div>
              <span class="stat-value">{{ store.detalle.stats.totalArchivos }}</span>
              <span class="stat-label">Archivos subidos</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">👥</span>
            <div>
              <span class="stat-value">{{ store.detalle.stats.totalUsuarios }}</span>
              <span class="stat-label">Usuarios</span>
            </div>
          </div>
          <div class="stat-card stat-card--accent">
            <span class="stat-icon">⚙️</span>
            <div>
              <span class="stat-value">{{ store.detalle.stats.porEstado['EN_PRODUCCION'] ?? 0 }}</span>
              <span class="stat-label">En producción</span>
            </div>
          </div>
        </div>

        <!-- Barras por estado -->
        <div class="card">
          <h3 class="card-title">Pedidos por estado</h3>
          <div v-if="store.detalle.stats.totalPedidos === 0" class="card-empty">Sin pedidos aún</div>
          <div v-else class="estado-bars">
            <div
              v-for="(count, estado) in store.detalle.stats.porEstado"
              :key="estado"
              class="bar-item"
            >
              <div class="bar-meta">
                <EstadoBadge :estado="(estado as any)" />
                <span class="bar-count">{{ count }}</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: `${(count / store.detalle.stats.totalPedidos) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Dos columnas: pedidos recientes + usuarios -->
        <div class="two-col">
          <!-- Pedidos recientes -->
          <div class="card">
            <h3 class="card-title">Últimos pedidos</h3>
            <div v-if="store.detalle.pedidosRecientes.length === 0" class="card-empty">Sin pedidos</div>
            <ul v-else class="pedidos-lista">
              <li
                v-for="p in store.detalle.pedidosRecientes"
                :key="p.id"
                class="pedido-item"
              >
                <div class="pedido-row">
                  <span class="pedido-ref">{{ p.referencia }}</span>
                  <EstadoBadge :estado="(p.estado as any)" />
                </div>
                <div class="pedido-meta">
                  <span>{{ formatFecha(p.creadoEn) }}</span>
                  <span>· {{ p.numArchivos }} archivo(s)</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Usuarios -->
          <div class="card">
            <h3 class="card-title">Usuarios</h3>
            <div v-if="store.detalle.usuarios.length === 0" class="card-empty">Sin usuarios</div>
            <ul v-else class="usuarios-lista">
              <li
                v-for="u in store.detalle.usuarios"
                :key="u.id"
                class="usuario-item"
              >
                <div class="usuario-avatar">{{ iniciales(u.nombre) }}</div>
                <div class="usuario-info">
                  <span class="usuario-nombre">{{ u.nombre }}</span>
                  <span class="usuario-email">{{ u.email }}</span>
                </div>
                <span class="rol-badge" :class="`rol-${u.rol.toLowerCase()}`">{{ u.rol }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSuperAdminStore } from '../../stores/superadmin.store';
import { useToastStore } from '../../stores/toast.store';
import EstadoBadge from '../../components/EstadoBadge.vue';

const store = useSuperAdminStore();
const toast = useToastStore();

const tenantSeleccionado = ref<string | null>(null);

function iniciales(nombre: string) {
  return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function seleccionar(id: string) {
  if (tenantSeleccionado.value === id) return;
  tenantSeleccionado.value = id;
  try {
    await store.cargarDetalle(id);
  } catch {
    toast.error('No se pudo cargar la información del tenant');
  }
}

onMounted(async () => {
  try {
    await store.cargarTenants();
    // Seleccionar el primer tenant que no sea 'sistema'
    const primero = store.tenants.find((t) => t.slug !== 'sistema');
    if (primero) seleccionar(primero.id);
  } catch {
    toast.error('No se pudieron cargar los tenants');
  }
});
</script>

<style scoped>
.sa-page {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: #f4f4f5;
}

/* Sidebar de tenants */
.sa-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e4e4e7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sa-sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}
.sa-title { font-size: 1rem; font-weight: 700; color: #18181b; margin: 0; }
.sa-badge {
  background: #6366f1;
  color: #fff;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
}
.sa-empty {
  padding: 2rem;
  text-align: center;
  color: #a1a1aa;
  font-size: 0.9rem;
}
.sa-empty--center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tenant-list { list-style: none; padding: 0.5rem 0; margin: 0; }
.tenant-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: background 0.12s;
  border-left: 3px solid transparent;
}
.tenant-item:hover { background: #fafafa; }
.tenant-item.activo {
  background: #f0f0ff;
  border-left-color: #6366f1;
}
.tenant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tenant-item.activo .tenant-avatar { background: #6366f1; color: #fff; }
.tenant-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.tenant-nombre { font-size: 0.88rem; font-weight: 600; color: #18181b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tenant-slug { font-size: 0.75rem; color: #a1a1aa; }
.tenant-mini-stats { display: flex; flex-direction: column; gap: 0.1rem; align-items: flex-end; }
.mini-stat { font-size: 0.72rem; color: #71717a; }

/* Panel principal */
.sa-main {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}
.sa-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #a1a1aa;
}
.placeholder-icon { font-size: 3rem; }
.sa-placeholder p { font-size: 0.95rem; margin: 0; }

/* Header detalle */
.detalle-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}
.detalle-avatar-lg {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #6366f1;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detalle-nombre { font-size: 1.3rem; font-weight: 700; color: #18181b; margin: 0; }
.detalle-slug { font-size: 0.82rem; color: #6366f1; font-weight: 500; }
.detalle-fecha { font-size: 0.82rem; color: #a1a1aa; margin-left: 0.25rem; }

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.stat-card--accent { border-left: 3px solid #6366f1; }
.stat-icon { font-size: 1.4rem; }
.stat-card > div { display: flex; flex-direction: column; }
.stat-value { font-size: 1.6rem; font-weight: 800; color: #18181b; line-height: 1; }
.stat-label { font-size: 0.78rem; color: #71717a; margin-top: 0.2rem; }

/* Cards */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-title { font-size: 0.95rem; font-weight: 600; color: #18181b; margin: 0 0 1rem; }
.card-empty { color: #a1a1aa; font-size: 0.88rem; padding: 0.5rem 0; }

/* Barras por estado */
.estado-bars { display: flex; flex-direction: column; gap: 0.85rem; }
.bar-item { display: flex; flex-direction: column; gap: 0.3rem; }
.bar-meta { display: flex; align-items: center; justify-content: space-between; }
.bar-count { font-size: 0.85rem; font-weight: 600; color: #18181b; }
.bar-track { height: 7px; background: #f4f4f5; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: #6366f1; border-radius: 999px; transition: width 0.4s ease; }

/* Dos columnas */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

/* Pedidos recientes */
.pedidos-lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.pedido-item {
  padding: 0.65rem 0.75rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.pedido-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
.pedido-ref { font-size: 0.88rem; font-weight: 600; color: #18181b; }
.pedido-meta { font-size: 0.75rem; color: #a1a1aa; }

/* Usuarios */
.usuarios-lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.usuario-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.usuario-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.usuario-info { flex: 1; display: flex; flex-direction: column; gap: 0.05rem; min-width: 0; }
.usuario-nombre { font-size: 0.85rem; font-weight: 600; color: #18181b; }
.usuario-email { font-size: 0.75rem; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rol-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.rol-admin     { background: #ede9fe; color: #6d28d9; }
.rol-operario  { background: #fef3c7; color: #92400e; }
.rol-cliente   { background: #dcfce7; color: #166534; }
.rol-superadmin { background: #fee2e2; color: #991b1b; }
</style>
