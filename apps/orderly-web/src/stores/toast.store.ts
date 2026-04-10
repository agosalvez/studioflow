import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastTipo = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

let nextId = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function mostrar(mensaje: string, tipo: ToastTipo = 'info', duracion = 4000) {
    const id = ++nextId;
    toasts.value.push({ id, mensaje, tipo });
    setTimeout(() => eliminar(id), duracion);
  }

  function exito(mensaje: string)  { mostrar(mensaje, 'exito'); }
  function error(mensaje: string)  { mostrar(mensaje, 'error', 6000); }
  function info(mensaje: string)   { mostrar(mensaje, 'info'); }

  function eliminar(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, exito, error, info, eliminar };
});
