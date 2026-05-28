<template>
    <MainLayout :titulo="tituloAtual">
      <div class="em-construcao">
        <div class="icone">🚧</div>
        <h2>Página em construção</h2>
        <p>Esta funcionalidade está sendo desenvolvida e estará disponível em breve.</p>
        <button @click="router.push('/dashboard')">Voltar ao Dashboard</button>
      </div>
    </MainLayout>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import MainLayout from '../../components/Layout/MainLayout.vue'
  
  const router = useRouter()
  const route = useRoute()
  
  const titulos = {
    '/cadastro': 'Cadastro',
    '/calendario': 'Calendário',
    '/equipe': 'Equipe',
    '/relatorios': 'Relatórios',
    '/configuracoes': 'Configurações',
  }
  
  const tituloAtual = computed(() => titulos[route.path] || 'Em Construção')
  </script>
  
  <style scoped>
  .em-construcao {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: 16px;
    text-align: center;
  }
  
  .icone {
    font-size: 4rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #1a1a2e;
  }
  
  p {
    font-size: 0.95rem;
    color: #666;
    max-width: 400px;
  }
  
  button {
    margin-top: 8px;
    padding: 12px 28px;
    background: #00e5cc;
    border: none;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    color: #1a1a2e;
  }
  </style>