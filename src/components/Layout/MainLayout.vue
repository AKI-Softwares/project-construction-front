<template>
  <div class="main-layout">
    <Sidebar @update:aberta="onSidebarToggle" />
    
    <div :class="['conteudo-wrapper', { 'sidebar-expandida': isSidebarOpen }]">
      <Header :titulo="titulo" />
      <main class="conteudo">
        <slot />
      </main>
    </div>

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

const isSidebarOpen = ref(false)
const toast = ref({ visible: false, message: '', type: 'error' })
let timer = null

function onSidebarToggle(val) {
  isSidebarOpen.value = val
}

function showToast({ detail }) {
  clearTimeout(timer)
  toast.value = { visible: true, message: detail.message, type: detail.type || 'error' }
  timer = setTimeout(() => { toast.value.visible = false }, 5000)
}

onMounted(() => window.addEventListener('app:toast', showToast))
onUnmounted(() => window.removeEventListener('app:toast', showToast))
</script>

<style scoped>
/* RESET GLOBAL PARA TRAVAR TOTALMENTE O SCROLL DA TELA INTEIRA */
:global(html), :global(body), :global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important; /* Remove permanentemente o scroll mestre do navegador */
  background-color: #f4f4f4;
}

.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Garante que nada passe das bordas do monitor */
}

.conteudo-wrapper {
  margin-left: 60px; /* Alinhado com a largura fechada da sidebar */
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f4f4f4;
  transition: margin-left 0.25s ease; /* Transição suave idêntica à animação do menu */
}

/* Quando a sidebar expande via hover, o conteúdo empurra dinamicamente */
.conteudo-wrapper.sidebar-expandida {
  margin-left: 260px;
}

/* ÁREA DO MEIO - O ÚNICO LUGAR DA APLICAÇÃO PERMITIDO PARA ROLAGEM */
.conteudo {
  margin-top: 60px; /* Espaço fixado para o Header */
  padding: 32px;
  flex: 1;
  overflow-y: auto; /* Se a tabela ou os cards forem compridos, o scroll nasce só aqui dentro */
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Customização fina e moderna do scroll interno da tabela */
.conteudo::-webkit-scrollbar {
  width: 6px;
}
.conteudo::-webkit-scrollbar-track {
  background: #f4f4f4;
}
.conteudo::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* Toast mantido com as cores ajustadas */
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
.toast--success { background-color: #0099b8; color: #fff; }

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

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to      { opacity: 0; transform: translateY(12px); }
</style>
