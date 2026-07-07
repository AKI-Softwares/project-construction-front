<template>
  <div class="main-layout">
    <Header :titulo="titulo" />
    <Sidebar />
    <div class="conteudo-wrapper">
      <main class="conteudo">
        <slot />
      </main>
    </div>

    <!-- Toast global -->
    <transition name="toast">
      <div v-if="toast.visible" :class="['toast', `toast--${toast.type}`]">
        <span>{{ toast.message }}</span>
        <button @click="toast.visible = false">✕</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

defineProps({
  titulo: {
    type: String,
    default: 'Dashboard'
  }
})

const toast = ref({ visible: false, message: '', type: 'error' })
let timer = null

function showToast({ detail }) {
  clearTimeout(timer)
  toast.value = { visible: true, message: detail.message, type: detail.type || 'error' }
  timer = setTimeout(() => { toast.value.visible = false }, 5000)
}

onMounted(() => window.addEventListener('app:toast', showToast))
onUnmounted(() => window.removeEventListener('app:toast', showToast))
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.conteudo-wrapper {
  margin-left: 60px;
  margin-top: 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
  transition: margin-left 0.25s ease;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
.conteudo {
  padding: 32px;
  flex: 1;
}

/* Quando sidebar expande via hover, empurra o conteúdo */
.main-layout:has(.sidebar.expandida) .conteudo-wrapper {
  margin-left: 260px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 380px;
}
.toast--error   { background-color: #c0392b; }
.toast--warning { background-color: #f5a623; }
.toast--success { background-color: #00e5cc; color: #0b1120; }

.toast button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  opacity: 0.8;
}
.toast button:hover { opacity: 1; }

/* Animação */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to      { opacity: 0; transform: translateY(12px); }
</style>
