<template>
  <div :class="['sidebar', { expandida: aberta }]" @mouseenter="toggleSidebar(true)" @mouseleave="toggleSidebar(false)">

    <nav class="menu">

      <!-- VISÃO GERAL -->
      <div class="menu-separator"><span v-if="aberta">VISÃO GERAL</span></div>

      <router-link to="/dashboard" class="menu-item" :title="aberta ? '' : 'Home'">
        <FontAwesomeIcon :icon="['fas', 'house']" class="icone" />
        <span v-if="aberta" class="label">Home</span>
      </router-link>

      <router-link to="/analytics" class="menu-item" :title="aberta ? '' : 'Analytics'">
        <FontAwesomeIcon :icon="['fas', 'chart-pie']" class="icone" />
        <span v-if="aberta" class="label">Analytics</span>
      </router-link>

      <router-link to="/relatorios" class="menu-item" :title="aberta ? '' : 'Relatórios'">
        <FontAwesomeIcon :icon="['fas', 'chart-bar']" class="icone" />
        <span v-if="aberta" class="label">Relatórios</span>
      </router-link>

      <!-- CADASTRO -->
      <div class="menu-separator"><span v-if="aberta">CADASTRO</span></div>

      <router-link to="/buildings" class="menu-item" :title="aberta ? '' : 'Empreendimentos'">
        <FontAwesomeIcon :icon="['fas', 'building']" class="icone" />
        <span v-if="aberta" class="label">Empreendimentos</span>
      </router-link>

      <router-link to="/apartment-types" class="menu-item" :title="aberta ? '' : 'Tipos de Apartamento'">
        <FontAwesomeIcon :icon="['fas', 'door-open']" class="icone" />
        <span v-if="aberta" class="label">Tipos de Apartamento</span>
      </router-link>

      <router-link to="/services" class="menu-item" :title="aberta ? '' : 'Catálogo de Serviços'">
        <FontAwesomeIcon :icon="['fas', 'screwdriver-wrench']" class="icone" />
        <span v-if="aberta" class="label">Catálogo de Serviços</span>
      </router-link>

      <!-- OPERAÇÃO -->
      <div class="menu-separator"><span v-if="aberta">OPERAÇÃO</span></div>

      <router-link to="/visits" class="menu-item" :title="aberta ? '' : 'Vistorias'">
        <FontAwesomeIcon :icon="['fas', 'clipboard-list']" class="icone" />
        <span v-if="aberta" class="label">Vistorias</span>
      </router-link>

      <router-link to="/non-conformities" class="menu-item" :title="aberta ? '' : 'Não Conformidades'">
        <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" class="icone" />
        <span v-if="aberta" class="label">Não Conformidades</span>
      </router-link>

      <router-link to="/reinspections" class="menu-item" :title="aberta ? '' : 'Re-inspeções'">
        <FontAwesomeIcon :icon="['fas', 'rotate']" class="icone" />
        <span v-if="aberta" class="label">Re-inspeções</span>
      </router-link>

      <!-- GESTÃO -->
      <div class="menu-separator"><span v-if="aberta">GESTÃO</span></div>

      <router-link to="/equipe" class="menu-item" :title="aberta ? '' : 'Equipe'">
        <FontAwesomeIcon :icon="['fas', 'users']" class="icone" />
        <span v-if="aberta" class="label">Equipe</span>
      </router-link>

      <!-- PLATAFORMA (só admin) -->
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
import { ref } from 'vue'
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
  height: calc(100vh - 60px);
  background-color: #46C7D5;
  display: flex;
  flex-direction: column;
  padding: 8px 8px 16px 8px;
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 90;
  transition: width 0.25s ease;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
.sidebar.expandida { width: 260px; }

.menu { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.menu-inferior { display: flex; flex-direction: column; gap: 4px; margin-top: auto; }

.menu-separator {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.08em;
  padding: 12px 10px 4px;
  white-space: nowrap;
  overflow: hidden;
  min-height: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.92rem;
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

.menu-item:hover { background-color: rgba(255,255,255,0.06); color: #ffffff; }
.menu-item.router-link-active { background-color: #00d5cc !important; color: #46C7D5 !important; font-weight: bold; }

.icone { font-size: 1.05rem; flex-shrink: 0; width: 24px; text-align: center; color: inherit; }
.label { font-size: 0.92rem; }

.sair { color: #f87171; }
.sair:hover { background-color: rgba(239,68,68,0.1); color: #f87171; }

@media print { .sidebar { display: none !important; } }
</style>
