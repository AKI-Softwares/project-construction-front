<template>
    <div class="dashboard">
      <h1>Bem-vindo ao CheckObra! ✅</h1>
      <p>Você está logado.</p>
      <button @click="sair">Sair</button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  function sair() {
    localStorage.removeItem('token')
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 16px;
  }
  
  button {
    padding: 10px 24px;
    background-color: #00e5cc;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: bold;
  }
  </style>