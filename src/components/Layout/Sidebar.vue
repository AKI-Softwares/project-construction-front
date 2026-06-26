<template>
  <div :class="['sidebar', { expandida: aberta }]" @mouseenter="aberta = true" @mouseleave="aberta = false">

    <div class="logo">
      <FontAwesomeIcon :icon="['far', 'building']" class="logo-icone" />
      <span v-if="aberta" class="logo-nome">CheckObra</span>
    </div>

    
  <nav class="menu">
      <!-- 1. HOME: Aponta para a HomeView com as ações e os cards novos -->
      <router-link to="/dashboard" class="menu-item" :title="aberta ? '' : 'Home'">
        <FontAwesomeIcon :icon="['fas', 'house']" class="icone" />
        <span v-if="aberta" class="label">Home</span>
      </router-link>

      <!-- 2. DASHBOARD: Agora aponta para /relatorios, que é onde estão suas métricas e gráficos normais -->
      <router-link to="/relatorios" class="menu-item" :title="aberta ? '' : 'Dashboard'">
        <FontAwesomeIcon :icon="['fas', 'chart-pie']" class="icone" />
        <span v-if="aberta" class="label">Dashboard</span>
      </router-link>

      <!-- 3. EMPREENDIMENTOS -->
      <router-link to="/buildings" class="menu-item" :title="aberta ? '' : 'Empreendimentos'">
        <FontAwesomeIcon :icon="['fas', 'building']" class="icone" />
        <span v-if="aberta" class="label">Empreendimentos</span>
      </router-link>

      <!-- 4. VISTORIAS -->
      <router-link to="/visits" class="menu-item" :title="aberta ? '' : 'Vistorias'">
        <FontAwesomeIcon :icon="['fas', 'clipboard-list']" class="icone" />
        <span v-if="aberta" class="label">Vistorias</span>
      </router-link>

      <!-- 5. TIPOS DE APARTAMENTO -->
      <router-link to="/apartment-types" class="menu-item" :title="aberta ? '' : 'Tipos de Apartamento'">
        <FontAwesomeIcon :icon="['fas', 'door-open']" class="icone" />
        <span v-if="aberta" class="label">Tipos de Apartamento</span>
      </router-link>

      <!-- 6. CATÁLOGO DE SERVIÇOS -->
      <router-link to="/services" class="menu-item" :title="aberta ? '' : 'Catálogo de Serviços'">
        <FontAwesomeIcon :icon="['fas', 'screwdriver-wrench']" class="icone" />
        <span v-if="aberta" class="label">Catálogo de Serviços</span>
      </router-link>

      <!-- 7. RE-INSPEÇÕES -->
      <router-link to="/reinspections" class="menu-item" :title="aberta ? '' : 'Re-inspeções'">
        <FontAwesomeIcon :icon="['fas', 'rotate']" class="icone" />
        <span v-if="aberta" class="label">Re-inspeções</span>
      </router-link>

      <!-- 8. NÃO-CONFORMIDADES -->
      <router-link to="/non-conformities" class="menu-item" :title="aberta ? '' : 'Não-Conformidades'">
        <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" class="icone" />
        <span v-if="aberta" class="label">Não-Conformidades</span>
      </router-link>

      <!-- 9. EQUIPE -->
      <router-link to="/equipe" class="menu-item" :title="aberta ? '' : 'Equipe'">
        <FontAwesomeIcon :icon="['fas', 'users']" class="icone" />
        <span v-if="aberta" class="label">Equipe</span>
      </router-link>

      <!-- Seção administrativa restrita (Mantida intacta lá embaixo) -->
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

const router = useRouter()
const authStore = useAuthStore()
const aberta = ref(false)

function sair() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.sidebar { width: 60px; height: 97vh; background-color: #0d0d2b; display: flex; flex-direction: column; padding: 24px 8px; position: fixed; top: 0; left: 0; z-index: 200; transition: width 0.25s ease; overflow: hidden; }
.sidebar.expandida { width: 260px; }
.logo { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding: 0 8px; white-space: nowrap; overflow: hidden; }
.logo-icone { font-size: 1.4rem; color: #00e5cc; flex-shrink: 0; width: 24px; text-align: center; }
.logo-nome { color: #00e5cc; font-size: 1.2rem; font-weight: bold; }
.menu { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.menu-inferior { display: flex; flex-direction: column; gap: 4px; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 8px; border-radius: 8px; color: #ffffff; text-decoration: none; font-size: 0.95rem; transition: background 0.2s; background: none; border: none; cursor: pointer; width: 100%; text-align: left; white-space: nowrap; overflow: hidden; }
.menu-item:hover { background-color: rgba(255, 255, 255, 0.08); }
.menu-item.router-link-active { background-color: #00e5cc; color: #0d0d2b; font-weight: bold; }
.icone { font-size: 1.1rem; flex-shrink: 0; width: 24px; text-align: center; }
.label { font-size: 0.95rem; }
.sair { color: #ffffff; }
.menu-separator { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; padding: 14px 12px 4px; white-space: nowrap; overflow: hidden; }

/* Ocultação da sidebar na impressão física para evitar faixas pretas laterais na folha */
@media print {
  .sidebar { display: none !important; }
}
</style>
