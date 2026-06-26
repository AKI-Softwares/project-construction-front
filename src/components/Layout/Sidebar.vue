<template>
  <div :class="['sidebar', { expandida: aberta }]" @mouseenter="toggleSidebar(true)" @mouseleave="toggleSidebar(false)">

    <nav class="menu">
      <router-link to="/dashboard" class="menu-item" :title="aberta ? '' : 'Home'">
        <FontAwesomeIcon :icon="['fas', 'house']" class="icone" />
        <span v-if="aberta" class="label">Home</span>
      </router-link>

      <router-link to="/analytics" class="menu-item" :title="aberta ? '' : 'Dashboard'">
        <FontAwesomeIcon :icon="['fas', 'chart-pie']" class="icone" />
        <span v-if="aberta" class="label">Dashboard</span>
      </router-link>

      <router-link to="/buildings" class="menu-item" :title="aberta ? '' : 'Empreendimentos'">
        <FontAwesomeIcon :icon="['fas', 'building']" class="icone" />
        <span v-if="aberta" class="label">Empreendimentos</span>
      </router-link>

      <router-link to="/visits" class="menu-item" :title="aberta ? '' : 'Vistorias'">
        <FontAwesomeIcon :icon="['fas', 'clipboard-list']" class="icone" />
        <span v-if="aberta" class="label">Vistorias</span>
      </router-link>

      <router-link to="/apartment-types" class="menu-item" :title="aberta ? '' : 'Tipos de Apartamento'">
        <FontAwesomeIcon :icon="['fas', 'door-open']" class="icone" />
        <span v-if="aberta" class="label">Tipos de Apartamento</span>
      </router-link>

      <router-link to="/services" class="menu-item" :title="aberta ? '' : 'Catálogo de Serviços'">
        <FontAwesomeIcon :icon="['fas', 'screwdriver-wrench']" class="icone" />
        <span v-if="aberta" class="label">Catálogo de Serviços</span>
      </router-link>

      <router-link to="/reinspections" class="menu-item" :title="aberta ? '' : 'Re-inspeções'">
        <FontAwesomeIcon :icon="['fas', 'rotate']" class="icone" />
        <span v-if="aberta" class="label">Re-inspeções</span>
      </router-link>

      <router-link to="/non-conformities" class="menu-item" :title="aberta ? '' : 'Não-Conformidades'">
        <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" class="icone" />
        <span v-if="aberta" class="label">Não-Conformidades</span>
      </router-link>

      <router-link to="/equipe" class="menu-item" :title="aberta ? '' : 'Equipe'">
        <FontAwesomeIcon :icon="['fas', 'users']" class="icone" />
        <span v-if="aberta" class="label">Equipe</span>
      </router-link>

      <router-link to="/relatorios" class="menu-item" :title="aberta ? '' : 'Relatórios'">
        <FontAwesomeIcon :icon="['fas', 'chart-bar']" class="icone" />
        <span v-if="aberta" class="label">Relatórios</span>
      </router-link>

      <template v-if="authStore.isPlatformAdmin">
        <div class="menu-separator"><span v-if="aberta">PLATAFORMA</span></div>
        <router-link to="/platform/dashboard" class="menu-item" :title="aberta ? '' : 'Dashboard da Plataforma'">
          <FontAwesomeIcon :icon="['fas', 'chart-line']" class="icone" />
          <span v-if="aberta" class="label">Dashboard da Plataforma</span>
        </router-link>
        <router-link to="/platform/companies" class="menu-item" :title="aberta ? '' : 'Empresas'">
          <FontAwesomeIcon :icon="['fas', 'sitemap']" class="icone" />
          <span v-if="aberta" class="label">Empresas</span>
        </router-link>
        <router-link to="/platform/catalog" class="menu-item" :title="aberta ? '' : 'Catálogo Global'">
          <FontAwesomeIcon :icon="['fas', 'book']" class="icone" />
          <span v-if="aberta" class="label">Catálogo Global</span>
        </router-link>
        <router-link to="/platform/role-templates" class="menu-item" :title="aberta ? '' : 'Templates de Funções'">
          <FontAwesomeIcon :icon="['fas', 'shield-halved']" class="icone" />
          <span v-if="aberta" class="label">Templates de Funções</span>
        </router-link>
      </template>
    </nav>

    <div class="menu-inferior">
      <router-link
        v-if="authStore.isCompanyAdmin || authStore.isPlatformAdmin || authStore.companyId"
        to="/configuracoes"
        class="menu-item"
        :title="aberta ? '' : 'Configurações'"
      >
        <FontAwesomeIcon :icon="['fas', 'gear']" class="icone" />
        <span v-if="aberta" class="label">Configurações</span>
      </router-link>

      <button class="menu-item sair" @click="sair" :title="aberta ? '' : 'Sair'">
        <FontAwesomeIcon :icon="['fas', 'arrow-right-from-bracket']" class="icone" />
        <span v-if="aberta" class="label">Sair</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.js'

const emit = defineEmits(['update:aberta'])
const router = useRouter()
const authStore = useAuthStore()
const aberta = ref(false)

function toggleSidebar(estado) {
  aberta.value = estado
  emit('update:aberta', estado)
}

function sair() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.sidebar { 
  width: 60px; 
  height: calc(100vh - 60px); /* CORREÇÃO: Ocupa o espaço restante abaixo do Header */
  background-color: #0b1120; 
  display: flex; 
  flex-direction: column; 
  padding: 16px 8px; 
  position: fixed; 
  top: 60px; /* CORREÇÃO: Começa exatamente onde o Header de 60px termina */
  left: 0; 
  z-index: 90; /* CORREÇÃO: Fica por baixo do Header (z-index 100) para não tampar a logo */
  transition: width 0.25s ease; 
  overflow-y: auto; 
  overflow-x: hidden; 
  box-sizing: border-box;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar.expandida { 
  width: 260px; 
}

.menu { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  flex: 1; 
}

.menu-inferior { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  margin-top: auto; 
}

.menu-item { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 12px 8px; 
  border-radius: 8px; 
  color: #9ca3af; 
  text-decoration: none; 
  font-size: 0.95rem; 
  transition: all 0.2s; 
  background: none; 
  border: none; 
  cursor: pointer; 
  width: 100%; 
  text-align: left; 
  white-space: nowrap; 
  overflow: hidden; 
  box-sizing: border-box;
}

.menu-item:hover { 
  background-color: rgba(255, 255, 255, 0.06); 
  color: #ffffff;
}

.menu-item.router-link-active { 
  background-color: #00d5cc !important; 
  color: #0b1120 !important; 
  font-weight: bold; 
}

.icone { 
  font-size: 1.1rem; 
  flex-shrink: 0; 
  width: 24px; 
  text-align: center; 
  color: inherit;
}

.label { 
  font-size: 0.95rem; 
}

.sair { 
  color: #f87171; 
}

.sair:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.menu-separator { 
  font-size: 0.68rem; 
  font-weight: 700; 
  color: rgba(255,255,255,0.25); 
  letter-spacing: 0.05em; 
  padding: 14px 12px 4px; 
  white-space: nowrap; 
  overflow: hidden; 
}

@media print {
  .sidebar { display: none !important; }
}
</style>
