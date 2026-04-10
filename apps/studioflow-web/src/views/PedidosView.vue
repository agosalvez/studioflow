<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Pedidos</h1>
        <p class="page-subtitle">{{ pedidosStore.pedidos.length }} pedidos en total</p>
      </div>
      <button class="btn-primary" @click="mostrarModal = true">+ Nuevo pedido</button>
    </div>

    <!-- Filtros de estado -->
    <div class="filtros">
      <button
        v-for="f in filtros"
        :key="f.valor"
        class="filtro-btn"
        :class="{ activo: filtroActivo === f.valor }"
        @click="filtroActivo = f.valor"
      >
        {{ f.etiqueta }}
      </button>
    </div>

    <!-- Tabla de pedidos -->
    <div class="tabla-wrapper">
      <div v-if="pedidosStore.cargando" class="estado-vacio">Cargando…</div>
      <div v-else-if="pedidosFiltrados.length === 0" class="estado-vacio">Sin pedidos</div>
      <table v-else class="tabla">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Estado</th>
            <th>Archivos</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="pedido in pedidosFiltrados"
            :key="pedido.id"
            class="tabla-fila"
            @click="router.push(`/pedidos/${pedido.id}`)"
          >
            <td class="ref">{{ pedido.referencia }}</td>
            <td><EstadoBadge :estado="pedido.estado" /></td>
            <td class="archivos-count">{{ pedido.archivos.length }} archivo(s)</td>
            <td class="fecha">{{ formatFecha(pedido.creadoEn) }}</td>
            <td class="acciones" @click.stop>
              <button class="btn-icon" title="Eliminar" @click="handleEliminar(pedido.id)">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nuevo pedido -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal">
        <h2 class="modal-title">Nuevo pedido</h2>
        <form @submit.prevent="handleCrear" class="modal-form">
          <div class="field">
            <label>Referencia</label>
            <input v-model="form.referencia" type="text" placeholder="REF-001" required />
          </div>
          <div class="field">
            <label>Observaciones</label>
            <textarea v-model="form.observaciones" placeholder="Notas opcionales…" rows="3" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="mostrarModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="creando">
              {{ creando ? 'Creando…' : 'Crear pedido' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePedidosStore, type EstadoPedido } from '../stores/pedidos.store';
import EstadoBadge from '../components/EstadoBadge.vue';

const router = useRouter();
const pedidosStore = usePedidosStore();

const mostrarModal = ref(false);
const creando = ref(false);
const form = ref({ referencia: '', observaciones: '' });
const filtroActivo = ref<EstadoPedido | 'TODOS'>('TODOS');

const filtros = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'RECIBIDO', etiqueta: 'Recibidos' },
  { valor: 'EN_PRODUCCION', etiqueta: 'En producción' },
  { valor: 'TERMINADO', etiqueta: 'Terminados' },
  { valor: 'ENTREGADO', etiqueta: 'Entregados' },
] as const;

const pedidosFiltrados = computed(() =>
  filtroActivo.value === 'TODOS'
    ? pedidosStore.pedidos
    : pedidosStore.pedidos.filter((p) => p.estado === filtroActivo.value)
);

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function handleCrear() {
  creando.value = true;
  try {
    await pedidosStore.crear(form.value);
    mostrarModal.value = false;
    form.value = { referencia: '', observaciones: '' };
  } finally {
    creando.value = false;
  }
}

async function handleEliminar(id: string) {
  if (confirm('¿Eliminar este pedido?')) await pedidosStore.eliminar(id);
}

onMounted(() => pedidosStore.cargar());
</script>

<style scoped>
.page { padding: 2rem; }
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.page-title  { font-size: 1.5rem; font-weight: 700; color: #18181b; margin: 0; }
.page-subtitle { font-size: 0.85rem; color: #71717a; margin: 0.25rem 0 0; }
.btn-primary {
  padding: 0.6rem 1.1rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost {
  padding: 0.6rem 1.1rem;
  background: transparent;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}
.filtros { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.filtro-btn {
  padding: 0.4rem 0.85rem;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  background: #fff;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.filtro-btn.activo { background: #6366f1; border-color: #6366f1; color: #fff; }
.tabla-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.tabla { width: 100%; border-collapse: collapse; }
.tabla thead tr { background: #fafafa; border-bottom: 1px solid #f0f0f0; }
.tabla th { padding: 0.75rem 1rem; font-size: 0.8rem; text-align: left; color: #71717a; font-weight: 600; }
.tabla-fila { cursor: pointer; transition: background 0.1s; }
.tabla-fila:hover { background: #fafafa; }
.tabla-fila td { padding: 0.85rem 1rem; font-size: 0.9rem; border-bottom: 1px solid #f4f4f5; }
.ref { font-weight: 600; color: #18181b; }
.fecha, .archivos-count { color: #71717a; font-size: 0.85rem; }
.acciones { width: 40px; text-align: right; }
.btn-icon {
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem;
  border-radius: 4px;
}
.btn-icon:hover { color: #ef4444; background: #fef2f2; }
.estado-vacio { padding: 3rem; text-align: center; color: #a1a1aa; }
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.modal-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 1.25rem; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label { font-size: 0.85rem; font-weight: 500; color: #3f3f46; }
.field input, .field textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
}
.field input:focus, .field textarea:focus { border-color: #6366f1; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
</style>
