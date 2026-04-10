<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.tipo}`"
          @click="toastStore.eliminar(toast.id)"
        >
          <span class="toast-icon">{{ iconos[toast.tipo] }}</span>
          <span class="toast-msg">{{ toast.mensaje }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '../stores/toast.store';

const toastStore = useToastStore();
const iconos = { exito: '✓', error: '✕', info: 'ℹ' };
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 9999;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  pointer-events: all;
  cursor: pointer;
  max-width: 360px;
}
.toast--exito { background: #166534; color: #fff; }
.toast--error  { background: #991b1b; color: #fff; }
.toast--info   { background: #1e3a5f; color: #fff; }
.toast-icon { font-size: 1rem; flex-shrink: 0; }

.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(1rem); }
.toast-leave-to     { opacity: 0; transform: translateX(1rem); }
</style>
