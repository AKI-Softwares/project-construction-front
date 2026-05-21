<template>
  <div class="main-layout">

    <!-- Menu lateral -->
    <Sidebar />

    <!-- Lado direito -->
    <div class="conteudo-wrapper">

      <!-- Cabeçalho -->
      <Header :titulo="titulo" />

      <!-- Conteúdo da página -->
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
  margin-left: 260px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
}

.conteudo {
  margin-top: 60px;
  padding: 32px;
}
</style>