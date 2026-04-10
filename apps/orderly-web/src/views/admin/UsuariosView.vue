<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Usuarios</h1>
        <p class="page-subtitle">{{ adminStore.usuarios.length }} usuarios en el tenant</p>
      </div>
    </div>

    <div class="tabla-wrapper">
      <div v-if="adminStore.cargando" class="estado-vacio">Cargando…</div>
      <table v-else class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Desde</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in adminStore.usuarios" :key="usuario.id">
            <td class="nombre">{{ usuario.nombre }}</td>
            <td class="email">{{ usuario.email }}</td>
            <td>
              <select
                class="select-rol"
                :value="usuario.rol"
                @change="handleCambiarRol(usuario.id, ($event.target as HTMLSelectElement).value as Rol)"
                :disabled="usuario.id === authStore.usuario?.sub"
              >
                <option value="ADMIN">Admin</option>
                <option value="OPERARIO">Operario</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </td>
            <td class="fecha">{{ formatFecha(usuario.creadoEn) }}</td>
            <td class="acciones">
              <button
                class="btn-icon"
                :disabled="usuario.id === authStore.usuario?.sub"
                @click="handleEliminar(usuario.id)"
                title="Eliminar usuario"
              >✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore, type Rol } from '../../stores/admin.store';
import { useAuthStore } from '../../stores/auth.store';
import { useToastStore } from '../../stores/toast.store';

const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToastStore();

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function handleCambiarRol(id: string, rol: Rol) {
  try {
    await adminStore.cambiarRol(id, rol);
    toast.exito('Rol actualizado correctamente');
  } catch {
    toast.error('No se pudo cambiar el rol');
  }
}

async function handleEliminar(id: string) {
  if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
  try {
    await adminStore.eliminarUsuario(id);
    toast.exito('Usuario eliminado');
  } catch {
    toast.error('No se pudo eliminar el usuario');
  }
}

onMounted(async () => {
  try {
    await adminStore.cargarUsuarios();
  } catch {
    toast.error('No se pudieron cargar los usuarios');
  }
});
</script>

<style scoped>
.page { padding: 2rem; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #18181b; margin: 0; }
.page-subtitle { font-size: 0.85rem; color: #71717a; margin: 0.25rem 0 0; }
.tabla-wrapper { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.tabla { width: 100%; border-collapse: collapse; }
.tabla thead tr { background: #fafafa; border-bottom: 1px solid #f0f0f0; }
.tabla th { padding: 0.75rem 1rem; font-size: 0.8rem; text-align: left; color: #71717a; font-weight: 600; }
.tabla tr td { padding: 0.85rem 1rem; font-size: 0.9rem; border-bottom: 1px solid #f4f4f5; }
.nombre { font-weight: 600; color: #18181b; }
.email, .fecha { color: #71717a; font-size: 0.85rem; }
.select-rol { padding: 0.3rem 0.6rem; border: 1px solid #e4e4e7; border-radius: 6px; font-size: 0.85rem; cursor: pointer; outline: none; }
.select-rol:disabled { opacity: 0.5; cursor: not-allowed; }
.acciones { width: 40px; text-align: right; }
.btn-icon { background: none; border: none; color: #a1a1aa; cursor: pointer; font-size: 0.85rem; padding: 0.25rem; border-radius: 4px; }
.btn-icon:hover:not(:disabled) { color: #ef4444; background: #fef2f2; }
.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
.estado-vacio { padding: 3rem; text-align: center; color: #a1a1aa; }
</style>
