<template>
  <div class="page">
    <div v-if="cargando" class="estado-vacio">Cargando…</div>
    <template v-else-if="pedido">
      <div class="page-header">
        <div class="header-left">
          <button class="btn-back" @click="router.back()">← Volver</button>
          <div>
            <h1 class="page-title">{{ pedido.referencia }}</h1>
            <p class="fecha">Recibido el {{ formatFecha(pedido.creadoEn) }}</p>
          </div>
        </div>
        <div class="header-right">
          <EstadoBadge :estado="pedido.estado" />
          <select class="select-estado" :value="pedido.estado" @change="handleEstado">
            <option value="RECIBIDO">Recibido</option>
            <option value="EN_PRODUCCION">En producción</option>
            <option value="TERMINADO">Terminado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>
      </div>

      <!-- Observaciones -->
      <div v-if="pedido.observaciones" class="card observaciones">
        <h2 class="card-title">Observaciones</h2>
        <p class="obs-text">{{ pedido.observaciones }}</p>
      </div>

      <!-- Archivos -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Archivos ({{ pedido.archivos.length }})</h2>
          <label class="btn-upload">
            {{ subiendo ? 'Subiendo…' : '+ Añadir archivo' }}
            <input type="file" multiple @change="handleSubir" :disabled="subiendo" />
          </label>
        </div>

        <div v-if="pedido.archivos.length === 0" class="archivos-vacio">
          Sin archivos adjuntos
        </div>
        <ul v-else class="archivos-lista">
          <li v-for="archivo in pedido.archivos" :key="archivo.id" class="archivo-item">
            <span class="archivo-icon">📄</span>
            <div class="archivo-info">
              <span class="archivo-nombre">{{ archivo.nombre }}</span>
              <span class="archivo-meta">{{ formatTamaño(archivo.tamaño) }}</span>
            </div>
            <a class="btn-download" :href="`${apiUrl}/api/archivos/${archivo.id}/download`" target="_blank">
              ↓ Descargar
            </a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePedidosStore, type EstadoPedido, type Pedido } from '../stores/pedidos.store';
import EstadoBadge from '../components/EstadoBadge.vue';

const route = useRoute();
const router = useRouter();
const pedidosStore = usePedidosStore();

const pedido = ref<Pedido | null>(null);
const cargando = ref(true);
const subiendo = ref(false);
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTamaño(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleEstado(e: Event) {
  const estado = (e.target as HTMLSelectElement).value as EstadoPedido;
  pedido.value = await pedidosStore.cambiarEstado(pedido.value!.id, estado);
}

async function handleSubir(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files?.length) return;
  subiendo.value = true;
  try {
    for (const file of Array.from(files)) {
      await pedidosStore.subirArchivo(pedido.value!.id, file);
    }
    pedido.value = await pedidosStore.obtener(pedido.value!.id);
  } finally {
    subiendo.value = false;
    (e.target as HTMLInputElement).value = '';
  }
}

onMounted(async () => {
  pedido.value = await pedidosStore.obtener(route.params.id as string);
  cargando.value = false;
});
</script>

<style scoped>
.page { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 1rem; }
.header-right { display: flex; align-items: center; gap: 0.75rem; }
.btn-back {
  background: none; border: none; color: #6366f1;
  cursor: pointer; font-size: 0.9rem; padding: 0;
}
.page-title { font-size: 1.4rem; font-weight: 700; color: #18181b; margin: 0; }
.fecha { font-size: 0.82rem; color: #71717a; margin: 0.2rem 0 0; }
.select-estado {
  padding: 0.4rem 0.7rem; border: 1px solid #e4e4e7;
  border-radius: 8px; font-size: 0.85rem; cursor: pointer; outline: none;
}
.card {
  background: #fff; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.card-title { font-size: 1rem; font-weight: 600; color: #18181b; margin: 0 0 0.75rem; }
.obs-text { color: #52525b; font-size: 0.95rem; line-height: 1.6; margin: 0; }
.btn-upload {
  padding: 0.5rem 0.9rem; background: #6366f1; color: #fff;
  border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
}
.btn-upload input { display: none; }
.archivos-vacio { color: #a1a1aa; font-size: 0.9rem; padding: 1rem 0; text-align: center; }
.archivos-lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.archivo-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem; background: #fafafa; border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.archivo-icon { font-size: 1.2rem; }
.archivo-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.archivo-nombre { font-size: 0.9rem; font-weight: 500; color: #18181b; }
.archivo-meta { font-size: 0.78rem; color: #a1a1aa; }
.btn-download {
  font-size: 0.82rem; color: #6366f1; text-decoration: none;
  padding: 0.3rem 0.65rem; border: 1px solid #e0e0ff;
  border-radius: 6px; white-space: nowrap;
}
.btn-download:hover { background: #f0f0ff; }
.estado-vacio { padding: 4rem; text-align: center; color: #a1a1aa; }
</style>
