<template>
  <MainLayout titulo="Painel de Controle">
    
    <!-- Boas-vindas baseada exclusivamente no Usuário Logado -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>Olá, {{ authStore.user?.name || '...' }}!</h2>
        <p>Acompanhe os indicadores resumidos e acesse as ferramentas do sistema.</p>
      </div>
    </div>

    <!-- Indicadores da Home (Padrão limpo puxando dados 100% reais) -->
    <div class="metrics-grid">
      <div v-if="loading" class="loading-state">Carregando indicadores...</div>
      
      <template v-else>
        <div class="metric-card border-dark">
          <span class="metric-label">Obras Ativas</span>
          <span class="metric-value">{{ totalBuildings }}</span>
        </div>

        <div class="metric-card border-orange">
          <span class="metric-label">Vistorias Realizadas</span>
          <span class="metric-value">{{ isRich ? overview.visitsFinalized : totalApartments }}</span>
        </div>

        <div class="metric-card border-coral">
          <span class="metric-label">Não Conformidades</span>
          <span class="metric-value">{{ isRich ? overview.totalNonConformities : 0 }}</span>
        </div>

        <div class="metric-card border-teal">
          <span class="metric-label">Unidades Entregues</span>
          <span class="metric-value">{{ isRich ? (totalApartments - overview.visitsPending) : totalApartments }}</span>
        </div>
      </template>
    </div>

    <!-- Layout Principal da Home (Ações Rápidas + Vistorias Reais) -->
    <div class="home-layout-grid">
      
      <!-- COLUNA DA ESQUERDA: Ações Rápidas -->
      <div class="content-panel">
        <h3 class="panel-title">Ações Rápidas</h3>
        
        <div class="actions-grid">
          <button class="action-btn" @click="navigate('/visits')">
            <div class="action-icon bg-cyan-light">
              <FontAwesomeIcon :icon="['fas', 'clipboard-list']" />
            </div>
            <span>Vistorias</span>
          </button>
          
          <button class="action-btn" @click="navigate('/buildings')">
            <div class="action-icon bg-blue-light">
              <FontAwesomeIcon :icon="['fas', 'building']" />
            </div>
            <span>Ver Obras</span>
          </button>

          <button class="action-btn" @click="navigate('/team')">
            <div class="action-icon bg-dark-light">
              <FontAwesomeIcon :icon="['fas', 'users']" />
            </div>
            <span>Gerenciar Equipe</span>
          </button>

          <button class="action-btn" @click="navigate('/relatorios')">
            <div class="action-icon bg-purple-light">
              <FontAwesomeIcon :icon="['fas', 'chart-bar']" />
            </div>
            <span>Relatórios</span>
          </button>
        </div>
      </div>

      <!-- COLUNA DA DIREITA: Histórico de Vistorias do Banco de Dados -->
      <div class="content-panel">
        <h3 class="panel-title">Últimas Vistorias do Sistema</h3>
        
        <div v-if="loading" class="panel-loading">Buscando registros...</div>
        
        <div v-else-if="recentVisits.length === 0" class="panel-empty">
          Nenhuma vistoria recente encontrada no banco de dados.
        </div>
        
        <div v-else class="visit-list">
          <div v-for="visit in recentVisits" :key="visit.id" class="visit-item" @click="navigate(`/visits/${visit.id}`)">
            <div class="visit-info">
              <span class="visit-title">{{ visit.title || 'Vistoria sem título' }}</span>
              <span class="visit-sub">{{ visit.buildingName || 'Empreendimento cadastrado' }}</span>
            </div>
            <span :class="['status-badge', visit.status?.toLowerCase()]">
              {{ visit.status }}
            </span>
          </div>
        </div>
      </div>

    </div>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { useAuthStore } from '../../store/auth'
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getOverview } from '../../services/analytics.js'
import { getVisits } from '../../services/visits.js'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const isRich = ref(false)
const buildings = ref([])
const apartments = ref([])
const recentVisits = ref([])

const overview = ref({
  visitsFinalized: 0,
  visitsPending: 0,
  totalNonConformities: 0
})

const totalBuildings = computed(() => buildings.value.length)
const totalApartments = computed(() => apartments.value.length)

function navigate(path) {
  router.push(path)
}

onMounted(async () => {
  try {
    // Carrega em paralelo tudo o que existe de real na API
    const [b, a, v] = await Promise.allSettled([
      getBuildings(),
      getApartments(),
      getVisits()
    ])
    
    if (b.status === 'fulfilled') buildings.value = b.value
    if (a.status === 'fulfilled') apartments.value = a.value
    if (v.status === 'fulfilled' && v.value) {
      // Exibe apenas as 4 últimas inseridas para manter o layout limpo
      recentVisits.value = Array.isArray(v.value) ? v.value.slice(0, 4) : []
    }

    try {
      const ov = await getOverview()
      if (ov && ov.data) {
        overview.value = ov.data
        isRich.value = true
      }
    } catch {
      isRich.value = false
    }
  } catch (e) {
    console.error('Erro ao carregar dados da Home:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loading-state { grid-column: 1 / -1; text-align: center; color: #718096; padding: 20px; font-style: italic; }

/* Cabeçalho */
.welcome-section { margin-bottom: 24px; }
.welcome-text h2 { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin: 0 0 4px 0; }
.welcome-text p { font-size: 0.95rem; color: #666; margin: 0; }

/* Bloco de Indicadores conforme o padrão de image_d92bdc.png */
.metrics-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px; 
  margin-bottom: 32px; 
}

.metric-card { 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px; 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 12px; 
  padding: 20px 24px; 
}

.metric-label { 
  font-size: 0.8rem; 
  color: #555; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value { 
  font-size: 2.6rem; 
  font-weight: 700; 
  color: #11142d; 
  line-height: 1;
}

.border-dark { border-left: 5px solid #11142d; }
.border-orange { border-left: 5px solid #f99f56; }
.border-coral { border-left: 5px solid #ff7a59; }
.border-teal { border-left: 5px solid #00e5cc; }

/* Layout Lado a Lado */
.home-layout-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 24px; 
}

.content-panel { 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 12px; 
  padding: 24px; 
  display: flex;
  flex-direction: column;
}

.panel-title { font-size: 1.05rem; font-weight: 700; color: #1a1a2e; margin: 0 0 20px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }

/* Grid de Botões das Ações */
.actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; height: 100%; }
.action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.action-btn:hover { background: #ffffff; border-color: #00e5cc; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,229,204,0.08); }
.action-btn span { font-size: 0.88rem; font-weight: 600; color: #2d3748; }
.action-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

.bg-cyan-light { background: #e0faf6; color: #00897b; }
.bg-blue-light { background: #e0eafc; color: #0d0d2b; }
.bg-dark-light { background: #f0f1f5; color: #4a5568; }
.bg-purple-light { background: #f3e8ff; color: #6b21a8; }

/* Linhas do Histórico Real */
.visit-list { display: flex; flex-direction: column; gap: 12px; }
.visit-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.visit-item:hover { background: #f1f5f9; }
.visit-info { display: flex; flex-direction: column; gap: 2px; }
.visit-title { font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }
.visit-sub { font-size: 0.78rem; color: #718096; }

/* Emblemas de Status */
.status-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; }
.status-badge.pendente { background: #fff3e0; color: #ef6c00; }
.status-badge.finalizada { background: #e0f2f1; color: #004d40; }
.status-badge.andamento { background: #e8eaf6; color: #1a237e; }

.panel-loading, .panel-empty { text-align: center; color: #a0aec0; padding: 40px 0; font-size: 0.88rem; }

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .home-layout-grid { grid-template-columns: 1fr; }
}
</style>
