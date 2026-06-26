<template>
  <MainLayout titulo="Painel de Controle">
    
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>Olá, {{ authStore.user?.name || 'Usuário' }}!</h2>
        <p>Acompanhe os indicadores e dados em tempo real de todos os empreendimentos cadastrados no sistema.</p>
      </div>
      <div class="current-date">
        <FontAwesomeIcon :icon="['fas', 'calendar-days']" />
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <div class="metrics-grid">
      <div v-if="loadingStats" class="loading-metrics">Carregando indicadores...</div>
      <template v-else>
        
        <div class="metric-card border-total">
          <span class="metric-label">Obras Ativas</span>
          <span class="metric-value">{{ stats.activeBuildings ?? 0 }}</span>
        </div>

        <div class="metric-card border-pendentes">
          <span class="metric-label">Vistorias Realizadas</span>
          <span class="metric-value">{{ stats.totalInspections ?? 0 }}</span>
        </div>

        <div class="metric-card border-andamento">
          <span class="metric-label">Não Conformidades</span>
          <span class="metric-value">{{ stats.pendingIssues ?? 0 }}</span>
        </div>

        <div class="metric-card border-finalizadas">
          <span class="metric-label">Unidades Entregues</span>
          <span class="metric-value">{{ stats.deliveredUnits ?? 0 }}</span>
        </div>

      </template>
    </div>

    <div class="dashboard-content">
      <div class="content-panel quick-actions-panel">
        <h3 class="panel-title">Ações Rápidas</h3>
        <div class="actions-grid">
          <button class="action-btn" @click="navigate('/visits')">
            <div class="action-icon bg-cyan-light">
              <FontAwesomeIcon :icon="['fas', 'file-circle-plus']" />
            </div>
            <span>Vistorias</span>
          </button>
          
          <button class="action-btn" @click="navigate('/buildings')">
            <div class="action-icon bg-blue-light">
              <FontAwesomeIcon :icon="['fas', 'city']" />
            </div>
            <span>Ver Obras</span>
          </button>

          <button class="action-btn" @click="navigate('/team')">
            <div class="action-icon bg-dark-light">
              <FontAwesomeIcon :icon="['fas', 'users-gear']" />
            </div>
            <span>Gerenciar Equipe</span>
          </button>

          <button class="action-btn" @click="navigate('/relatorios')">
            <div class="action-icon bg-purple-light">
              <FontAwesomeIcon :icon="['fas', 'chart-pie']" />
            </div>
            <span>Relatórios</span>
          </button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { getOverview } from '../../services/analytics'
import MainLayout from '../../components/Layout/MainLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentDate = ref(new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))

const loadingStats = ref(true)
const stats = ref({
  activeBuildings: 0,
  totalInspections: 0,
  pendingIssues: 0,
  deliveredUnits: 0
})

function navigate(path) {
  router.push(path)
}

onMounted(async () => {
  try {
    loadingStats.value = true
    
    // getOverview sem parâmetros traz o consolidado global (todos os empreendimentos)
    const response = await getOverview()
    if (response && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Erro ao carregar dados globais do dashboard:', error)
  } finally {
    loadingStats.value = false
  }
})
</script>

<style scoped>
/* Boas-vindas */
.welcome-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.welcome-text h2 { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin: 0 0 6px 0; }
.welcome-text p { font-size: 0.95rem; color: #555; margin: 0; }
.current-date { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: #4a5568; background: #e2e8f0; padding: 10px 18px; border-radius: 20px; }

/* Grid de Métricas */
.metrics-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); 
  gap: 20px; 
  margin-bottom: 32px; 
  min-height: 140px; 
}
.loading-metrics { grid-column: 1 / -1; color: #718096; font-style: italic; padding: 20px 0; }

/* Cards idênticos à tela de Vistorias */
.metric-card { 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px; 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 12px; 
  padding: 24px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
  min-height: 130px;
}

.metric-label { 
  font-size: 0.85rem; 
  color: #555555; 
  font-weight: 500;
}

.metric-value { 
  font-size: 2.6rem; /* Fonte grande e robusta igual ao print */
  font-weight: 700; 
  color: #0f1123; 
  line-height: 1;
}

/* Cores exatas das bordas esquerdas do print */
.border-total { border-left: 5px solid #11142d; }       /* Escuro / Total */
.border-pendentes { border-left: 5px solid #f99f56; }   /* Laranja / Pendentes */
.border-andamento { border-left: 5px solid #ff7a59; }   /* Coral / Em Andamento */
.border-finalizadas { border-left: 5px solid #00e5cc; }  /* Ciano / Finalizadas */

/* Conteúdo de Ações */
.dashboard-content { display: grid; grid-template-columns: 1fr; gap: 24px; }
.content-panel { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.panel-title { font-size: 1.05rem; font-weight: 700; color: #1a1a2e; margin: 0; border-bottom: 1px solid #f0f2f5; padding-bottom: 12px; }

/* Botões de Ações Rápidas */
.actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.action-btn:hover { background: #ffffff; border-color: #00e5cc; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,229,204,0.08); }
.action-btn span { font-size: 0.88rem; font-weight: 600; color: #2d3748; text-align: center; }
.action-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; }

.bg-cyan-light { background: #e0faf6; color: #00897b; }
.bg-blue-light { background: #e0eafc; color: #0d0d2b; }
.bg-dark-light { background: #f0f1f5; color: #4a5568; }
.bg-purple-light { background: #f3e8ff; color: #6b21a8; }
</style>
