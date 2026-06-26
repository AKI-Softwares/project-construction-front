<template>
  <div class="layout-container">
    
    <aside class="sidebar no-print">
      <nav class="sidebar-menu">
        <div class="menu-section">Home</div>
        <router-link to="/dashboard" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'chart-pie']" class="menu-icon" />
          <span>Dashboard</span>
        </router-link>

        <div class="menu-section">Empreendimentos</div>
        
        <router-link to="/visits" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'clipboard-list']" class="menu-icon" />
          <span>Vistorias</span>
        </router-link>

        <router-link to="/apartment-types" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'door-open']" class="menu-icon" />
          <span>Tipos de Apartamento</span>
        </router-link>

        <router-link to="/services-catalog" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'screwdriver-wrench']" class="menu-icon" />
          <span>Catálogo de Serviços</span>
        </router-link>

        <router-link to="/re-inspections" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'rotate']" class="menu-icon" />
          <span>Re-inspeções</span>
        </router-link>

        <router-link to="/non-conformities" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" class="menu-icon" />
          <span>Não-Conformidades</span>
        </router-link>

        <router-link to="/team" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'users']" class="menu-icon" />
          <span>Equipe</span>
        </router-link>

        <router-link to="/reports" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'file-lines']" class="menu-icon" />
          <span>Relatórios</span>
        </router-link>

        <router-link to="/settings" class="menu-item" active-class="active">
          <FontAwesomeIcon :icon="['fas', 'gear']" class="menu-icon" />
          <span>Configurações</span>
        </router-link>

        <div class="menu-separator"></div>

        <button class="menu-item btn-logout" @click="handleLogout">
          <FontAwesomeIcon :icon="['fas', 'right-from-bracket']" class="menu-icon" />
          <span>Sair</span>
        </button>
      </nav>
    </aside>

    <div class="main-wrapper">
      
      <header class="content-header no-print">
        <div class="header-logo-box">
          <img 
            src="../../assets/logo_check_hotizontal.png" 
            alt="CheckObra Logo" 
            class="header-logo" 
          />
        </div>
        <h1 class="page-title">{{ titulo }}</h1>
      </header>

      <main class="page-body">
        <slot />
      </main>
    </div>

  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  titulo: {
    type: String,
    default: ''
  }
})

const router = useRouter()

function handleLogout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
/* Estrutura Principal do Layout */
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Envoltório do Conteúdo à direita do Sidebar */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ESTILIZAÇÃO DO SIDEBAR */
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  background-color: #0b132b;
  position: sticky;
  top: 0;
  box-sizing: border-box;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.menu-section {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 18px 0 8px 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.menu-item:hover {
  color: #f3f4f6;
  background-color: rgba(255, 255, 255, 0.03);
}

.menu-item.active {
  color: #001e2b;
  background-color: #00e5cc;
  font-weight: 600;
}

.menu-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.menu-separator {
  margin: 15px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-logout {
  color: #f87171;
  margin-top: auto;
}

.btn-logout:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* AJUSTE E CORREÇÃO DO HEADER (CABEÇALHO) */
.content-header {
  background-color: #0b132b; /* Alinhado com a cor escura do app para destacar a logo */
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Mantém a logo à esquerda e o título à direita */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

/* Caixa da Logo para controlar o alinhamento e respiro */
.header-logo-box {
  display: flex;
  align-items: center;
}

/* Dimensões da Logo Horizontal no topo */
.header-logo {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff; /* Título em branco para contrastar com o cabeçalho escuro */
  margin: 0;
}

/* Corpo da página */
.page-body {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
}

/* Configuração para impressão do relatório */
@media print {
  .no-print, .sidebar, .content-header { display: none !important; }
  .main-wrapper { padding: 0; }
  .page-body { padding: 0; }
}
</style>
