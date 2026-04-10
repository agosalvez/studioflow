<template>
  <span class="badge" :class="clase">{{ etiqueta }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EstadoPedido } from '../stores/pedidos.store';

const props = defineProps<{ estado: EstadoPedido }>();

const etiquetas: Record<EstadoPedido, string> = {
  RECIBIDO: 'Recibido',
  EN_PRODUCCION: 'En producción',
  TERMINADO: 'Terminado',
  ENTREGADO: 'Entregado',
};

const clases: Record<EstadoPedido, string> = {
  RECIBIDO: 'badge--recibido',
  EN_PRODUCCION: 'badge--produccion',
  TERMINADO: 'badge--terminado',
  ENTREGADO: 'badge--entregado',
};

const etiqueta = computed(() => etiquetas[props.estado]);
const clase = computed(() => clases[props.estado]);
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge--recibido    { background: #e0f2fe; color: #0369a1; }
.badge--produccion  { background: #fef9c3; color: #854d0e; }
.badge--terminado   { background: #dcfce7; color: #166534; }
.badge--entregado   { background: #f3f4f6; color: #374151; }
</style>
