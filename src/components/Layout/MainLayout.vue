<template>
  <div class="main-layout">
    <Sidebar />
    <div class="conteudo-wrapper">
      <Header :titulo="titulo" />
      <main class="conteudo">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

defineProps({
  titulo: {
    type: String,
    default: 'Dashboard'
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.conteudo-wrapper {
  margin-left: 60px; /* largura da sidebar recolhida */
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
  transition: margin-left 0.25s ease;
}

.conteudo {
  margin-top: 60px;
  padding: 32px;
}
</style>