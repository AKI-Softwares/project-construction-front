<template>
    <div class="sidebar">
  
      <!-- Logo -->
      <div class="logo">
        <h2 class="logo-nome">CheckObra</h2>
      </div>
  
      <!-- Menu principal -->
      <nav class="menu">
        <router-link to="/dashboard" class="menu-item">
          <span class="icone">📊</span> Dashboard
        </router-link>
        <router-link to="/cadastro" class="menu-item">
          <span class="icone">🏢</span> Cadastro
        </router-link>
        <router-link to="/empreendimentos" class="menu-item">
          <span class="icone">🏗️</span> Empreendimentos
        </router-link>
        <router-link to="/calendario" class="menu-item">
          <span class="icone">📅</span> Calendário
        </router-link>
        <router-link to="/equipe" class="menu-item">
          <span class="icone">👥</span> Equipe
        </router-link>
        <router-link to="/relatorios" class="menu-item">
          <span class="icone">📝</span> Relatórios
        </router-link>
      </nav>
  
      <!-- Menu inferior -->
      <div class="menu-inferior">
        <router-link to="/configuracoes" class="menu-item">
          <span class="icone">⚙️</span> Configurações
        </router-link>
        <button class="menu-item sair" @click="sair">
          <span class="icone">🚪</span> Sair
        </button>
      </div>
  
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
  .sidebar {
    width: 260px;
    min-height: 100vh;
    background-color: #0d0d2b;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: fixed;
    top: 0;
    left: 0;
  }
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
  }
  
  .logo-nome {
    color: #00e5cc;
    font-size: 1.5rem;
  }
  
  .menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  
  .menu-inferior {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: #ffffff;
    text-decoration: none;
    font-size: 0.95rem;
    transition: background 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }
  
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .menu-item.router-link-active {
    background-color: #00e5cc;
    color: #0d0d2b;
    font-weight: bold;
  }
  
  .icone {
    font-size: 1.1rem;
  }
  
  .sair {
    color: #ffffff;
  }
  </style>