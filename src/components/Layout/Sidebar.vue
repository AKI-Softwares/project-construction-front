<template>
  <div :class="['sidebar', { expandida: aberta }]" @mouseenter="aberta = true" @mouseleave="aberta = false">

    <div class="logo">
      <FontAwesomeIcon :icon="['far', 'building']" class="logo-icone" />
      <span v-if="aberta" class="logo-nome">CheckObra</span>
    </div>

    <nav class="menu">
      <router-link to="/dashboard" class="menu-item" :title="aberta ? '' : 'Dashboard'">
        <FontAwesomeIcon :icon="['fas', 'chart-simple']" class="icone" />
        <span v-if="aberta" class="label">Dashboard</span>
      </router-link>

      <router-link to="/buildings" class="menu-item" :title="aberta ? '' : 'Empreendimentos'">
        <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" class="icone" />
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

      <router-link to="/reinspections" class="menu-item" :title="aberta ? '' : 'Re-inspeções'">
      <FontAwesomeIcon :icon="['fas', 'rotate']" class="icone" />
      <span v-if="aberta" class="label">Re-inspeções</span>
      </router-link>

      <router-link to="/calendario" class="menu-item" :title="aberta ? '' : 'Calendário'">
        <FontAwesomeIcon :icon="['fas', 'calendar-days']" class="icone" />
        <span v-if="aberta" class="label">Calendário</span>
      </router-link>

      <router-link to="/equipe" class="menu-item" :title="aberta ? '' : 'Equipe'">
        <FontAwesomeIcon :icon="['fas', 'users']" class="icone" />
        <span v-if="aberta" class="label">Equipe</span>
      </router-link>

      <router-link to="/relatorios" class="menu-item" :title="aberta ? '' : 'Relatórios'">
        <FontAwesomeIcon :icon="['fas', 'pen-to-square']" class="icone" />
        <span v-if="aberta" class="label">Relatórios</span>
      </router-link>
    </nav>

    <div class="menu-inferior">
      <router-link to="/configuracoes" class="menu-item" :title="aberta ? '' : 'Configurações'">
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

const router = useRouter()
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
</style>
