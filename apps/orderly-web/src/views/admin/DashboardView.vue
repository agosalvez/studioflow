<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>

    <div v-if="cargando" class="estado-vacio">Cargando estadísticas…</div>
    <div v-else-if="errorCarga" class="estado-vacio estado-error">No se pudieron cargar las estadísticas</div>
    <template v-else-if="adminStore.stats">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total pedidos</span>
          <span class="stat-value">{{ adminStore.stats.totalPedidos }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Archivos subidos</span>
          <span class="stat-value">{{ adminStore.stats.totalArchivos }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Usuarios</span>
          <span class="stat-value">{{ adminStore.stats.totalUsuarios }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">En producción</span>
          <span class="stat-value accent">{{ adminStore.stats.porEstado['EN_PRODUCCION'] ?? 0 }}</span>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">Pedidos por estado</h2>
        <div class="estado-bars">
          <div v-for="(count, estado) in adminStore.stats.porEstado" :key="estado" class="estado-bar-item">
            <div class="estado-bar-label">
              <EstadoBadge :estado="(estado as any)" />
              <span class="bar-count">{{ count }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${adminStore.stats!.totalPedidos > 0 ? (count / adminStore.stats!.totalPedidos) * 100 : 0}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin.store';
import { useToastStore } from '../../stores/toast.store';
import EstadoBadge from '../../components/EstadoBadge.vue';

const adminStore = useAdminStore();
const toast = useToastStore();
const cargando = ref(true);
const errorCarga = ref(false);

onMounted(async () => {
  try {
    await adminStore.cargarStats();
  } catch {
    errorCarga.value = true;
    toast.error('No se pudieron cargar las estadísticas');
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.page { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { margin-bottom: 0.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #18181b; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.stat-card { background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.35rem; }
.stat-label { font-size: 0.8rem; color: #71717a; font-weight: 500; }
.stat-value { font-size: 2rem; font-weight: 800; color: #18181b; }
.stat-value.accent { color: #6366f1; }
.card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.card-title { font-size: 1rem; font-weight: 600; color: #18181b; margin: 0 0 1.25rem; }
.estado-bars { display: flex; flex-direction: column; gap: 1rem; }
.estado-bar-item { display: flex; flex-direction: column; gap: 0.35rem; }
.estado-bar-label { display: flex; align-items: center; justify-content: space-between; }
.bar-count { font-size: 0.85rem; font-weight: 600; color: #18181b; }
.bar-track { height: 8px; background: #f4f4f5; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: #6366f1; border-radius: 999px; transition: width 0.4s ease; }
.estado-vacio { padding: 3rem; text-align: center; color: #a1a1aa; }
.estado-error { color: #ef4444; }
</style>
