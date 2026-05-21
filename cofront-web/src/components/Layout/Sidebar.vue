<template>
    <div class="sidebar">
  
      <!-- Logo -->
      <div class="logo">
        <h2 class="logo-nome">CheckObra</h2>
      </div>
  
      <!-- Menu principal -->
      <nav class="menu">
        <router-link to="/dashboard" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-no-axes-column-increasing-icon lucide-chart-no-axes-column-increasing"><path d="M5 21v-6"/><path d="M12 21V9"/><path d="M19 21V3"/></svg></span> Dashboard
        </router-link>
        <router-link to="/cadastro" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-plus-icon lucide-house-plus"><path d="M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35"/><path d="M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8"/><path d="M15 18h6"/><path d="M18 15v6"/></svg></span> Cadastro
        </router-link>
        <router-link to="/empreendimentos" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span> Empreendimentos
        </router-link>
        <router-link to="/calendario" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg></span> Calendário
        </router-link>
        <router-link to="/equipe" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg></span> Equipe
        </router-link>
        <router-link to="/relatorios" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></span> Relatórios
        </router-link>
      </nav>
  
      <!-- Menu inferior -->
      <div class="menu-inferior">
        <router-link to="/configuracoes" class="menu-item">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bolt-icon lucide-bolt"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg></span> Configurações
        </router-link>
        <button class="menu-item sair" @click="sair">
          <span class="icone"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-door-open-icon lucide-door-open"><path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/></svg></span> Sair
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
    min-height: 98vh;
    background-color: #0d0d2b;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: fixed;
    top: 0;
    left: 0;
    font-family: 'Inter', sans-serif;
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
    gap: 1px;
    padding: 12px 16px;
    border-radius: 10px;
    color: #ffffff;
    text-decoration: none;
    font-size: 0.95rem;
    transition: background 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    width: 80%;
    text-align: left;
    
  }
  
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  /* Vector */



  .menu-item.router-link-active {
    background-color: rgb(0, 229, 204, 0.5);
    mask-repeat: 30px; 
    color: #1CD4C5;
    font-weight: bold;
    font-family: 'Inter', sans-serif;
  }

  /* Empreendimentos */




  
  .icone {
    font-size: 1.1rem;
  }
  
  .sair {
    color: #ffffff;
  }
  </style>