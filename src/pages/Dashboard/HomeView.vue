<template>
  <MainLayout titulo="Painel de Controle">
    
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>Olá, {{ authStore.user?.name || 'Usuário' }}!</h2>
        <p>Acompanhe os indicadores resumidos e acesse as ferramentas do sistema.</p>
      </div>
    </div>

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

    <div class="dashboard-content">
      <div class="content-panel quick-actions-panel">
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

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const isRich = ref(false)
const buildings = ref([])
const apartments = ref([])

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
    const [b, a] = await Promise.allSettled([getBuildings(), getApartments()])
    if (b.status === 'fulfilled') buildings.value = b.value
    if (a.status === 'fulfilled') apartments.value = a.value

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

/* Bloco de Cards - Alinhados com o topo do padrão enviado */
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
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

/* Bordas Laterais do padrão */
.border-dark { border-left: 5px solid #11142d; }
.border-orange { border-left: 5px solid #f99f56; }
.border-coral { border-left: 5px solid #ff7a59; }
.border-teal { border-left: 5px solid #00e5cc; }

/* Estrutura das Ações Rápidas */
.dashboard-content { display: grid; grid-template-columns: 1fr; }
.content-panel { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 24px; }
.panel-title { font-size: 1.05rem; font-weight: 700; color: #1a1a2e; margin: 0 0 20px 0; }

.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 32px 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.action-btn:hover { background: #ffffff; border-color: #00e5cc; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,229,204,0.08); }
.action-btn span { font-size: 0.9rem; font-weight: 600; color: #2d3748; }
.action-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

/* Cores dos botões */
.bg-cyan-light { background: #e0faf6; color: #00897b; }
.bg-blue-light { background: #e0eafc; color: #0d0d2b; }
.bg-dark-light { background: #f0f1f5; color: #4a5568; }
.bg-purple-light { background: #f3e8ff; color: #6b21a8; }

@media (max-width: 1024px) {
  .metrics-grid, .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
