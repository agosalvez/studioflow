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
          <button class="toast-close" @click.stop="toastStore.eliminar(toast.id)">✕</button>
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
  gap: 0.6rem;
  z-index: 9999;
  pointer-events: none;
  max-width: 380px;
  width: calc(100vw - 3rem);
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  pointer-events: all;
  cursor: default;
}
.toast--exito { background: #14532d; color: #dcfce7; border-left: 4px solid #22c55e; }
.toast--error  { background: #7f1d1d; color: #fee2e2; border-left: 4px solid #ef4444; }
.toast--info   { background: #1e3a5f; color: #dbeafe; border-left: 4px solid #3b82f6; }
.toast-icon { font-size: 1rem; flex-shrink: 0; opacity: 0.9; }
.toast-msg { flex: 1; line-height: 1.4; }
.toast-close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.25rem;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1;
}
.toast-close:hover { opacity: 1; }

.toast-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(2rem) scale(0.9); }
.toast-leave-to     { opacity: 0; transform: translateX(2rem); }
</style>
