<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Carregando indicadores...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">
      
      <!-- Barra de progresso integrada e limpa -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">
            {{ isRich ? 'Vistorias finalizadas no período' : 'Progresso geral dos empreendimentos' }}
          </span>
          <span class="progress-pct">
            {{ isRich ? finalizedPct + '% concluído' : totalBuildings + ' empreendimento' + (totalBuildings !== 1 ? 's' : '') }}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill teal" :style="{ width: (isRich ? finalizedPct : 100) + '%' }"></div>
          <div v-if="isRich" class="progress-fill orange" :style="{ width: pendingPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span v-if="isRich">
            <span class="dot teal"></span>Finalizadas ({{ overview.visitsFinalized }})
          </span>
          <span v-if="isRich">
            <span class="dot orange"></span>Pendentes ({{ overview.visitsPending }})
          </span>
          <span v-if="!isRich">
            <span class="dot teal"></span>{{ totalApartments }} apartamentos
          </span>
          <span v-if="!isRich">
            <span class="dot dark"></span>{{ totalUsers }} usuários
          </span>
        </div>
      </div>

      <!-- Seção de Blocos/Cards no Padrão exato de image_d92bdc.png -->
      <div class="metrics-grid">
        
        <!-- CARD 1: Empreendimentos -->
        <div class="metric-card border-dark">
          <span class="metric-label">Empreendimentos Ativos</span>
          <span class="metric-value">{{ totalBuildings }}</span>
        </div>

        <!-- CARD 2: Aprovação ou Apartamentos -->
        <div class="metric-card border-orange">
          <span class="metric-label">{{ isRich ? 'Taxa de Aprovação' : 'Total de Apartamentos' }}</span>
          <span class="metric-value">{{ isRich ? approvalPct + '%' : totalApartments }}</span>
        </div>

        <!-- CARD 3: Vistorias Pendentes ou Usuários -->
        <div class="metric-card border-coral">
          <span class="metric-label">{{ isRich ? 'Vistorias Pendentes' : 'Usuários Cadastrados' }}</span>
          <span class="metric-value">{{ isRich ? overview.visitsPending : totalUsers }}</span>
        </div>

        <!-- CARD 4: Não Conformidades ou Média de Aptos -->
        <div class="metric-card border-teal">
          <span class="metric-label">{{ isRich ? 'Não Conformidades' : 'Média de Aptos / Obra' }}</span>
          <span class="metric-value">{{ isRich ? overview.totalNonConformities : avgApts }}</span>
        </div>

      </div>

      <!-- Gráficos + listas inferiores estruturados -->
      <div class="bottom-row">

        <!-- Empreendimentos com contagem de apartamentos -->
        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" class="title-icon dark-color" />
            Distribuição de Obras
          </div>
          <div v-for="b in buildingsWithCount" :key="b.id" class="building-row">
            <div class="building-name">{{ b.name }}</div>
            <div class="building-bar">
              <div class="building-fill dark-bg" :style="{ width: totalApartments > 0 ? (b.aptCount / maxApts * 100) + '%' : '0%' }"></div>
            </div>
            <span class="building-count">{{ b.aptCount }} apt{{ b.aptCount !== 1 ? 's' : '' }}</span>
          </div>
          <div v-if="buildingsWithCount.length === 0" class="empty">Nenhum empreendimento cadastrado.</div>
        </div>

        <!-- Dados Dinâmicos da Direita (Serviços Reprovados ou Equipes) -->
        <div class="table-card">
          <template v-if="isRich && qualityRows.length > 0">
            <div class="table-title">
              <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="title-icon orange-color" />
              Serviços com maior índice NOK
            </div>
            <div class="table-header-2">
              <span>Serviço</span>
              <span>Taxa NOK</span>
            </div>
            <div v-for="row in topQualityIssues" :key="row.serviceId" class="building-row">
              <div class="building-name">{{ row.serviceName }}</div>
              <div class="building-bar">
                <div class="building-fill orange-bg" :style="{ width: Math.round(row.nokRate * 100) + '%' }"></div>
              </div>
              <span class="building-count">{{ Math.round(row.nokRate * 100) }}%</span>
            </div>
            <div v-if="topQualityIssues.length === 0" class="empty">Nenhuma reprovação detectada no período. 🎉</div>
          </template>

          <template v-else>
            <div class="table-title">
              <FontAwesomeIcon :icon="['fas', 'users']" class="title-icon coral-color" />
              Usuários por Função
            </div>
            <div v-for="group in usersByRole" :key="group.role" class="building-row">
              <div class="building-name">{{ group.role }}</div>
              <div class="building-bar">
                <div class="building-fill coral-bg" :style="{ width: totalUsers > 0 ? (group.count / totalUsers * 100) + '%' : '0%' }"></div>
              </div>
              <span class="building-count">{{ group.count }}</span>
            </div>
            <div v-if="usersByRole.length === 0" class="empty">Nenhum usuário cadastrado na base.</div>
          </template>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getUsers } from '../../services/users.js'
import { getOverview, getQuality } from '../../services/analytics.js'

const loading = ref(true)
const error = ref('')
const buildings = ref([])
const apartments = ref([])
const users = ref([])
const isRich = ref(false)
const qualityRows = ref([])

const overview = ref({
  totalApartments: 0, visitsFinalized: 0, visitsPending: 0,
  nokRate: 0, totalNonConformities: 0, totalInspectors: 0,
})

const totalBuildings = computed(() => buildings.value.length)
const totalApartments = computed(() => apartments.value.length)
const totalUsers = computed(() => users.value.length)
const avgApts = computed(() =>
  totalBuildings.value > 0 ? Math.round(totalApartments.value / totalBuildings.value) : 0
)

const totalVisits = computed(() => overview.value.visitsFinalized + overview.value.visitsPending)
const finalizedPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsFinalized / totalVisits.value) * 100) : 0
)
const pendingPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsPending / totalVisits.value) * 100) : 0
)
const approvalPct = computed(() => Math.round((1 - overview.value.nokRate) * 100))

const buildingsWithCount = computed(() =>
  buildings.value.map(b => ({
    ...b,
    aptCount: apartments.value.filter(a => a.buildingId === b.id).length,
  })).sort((a, b) => b.aptCount - a.aptCount)
)
const maxApts = computed(() => Math.max(...buildingsWithCount.value.map(b => b.aptCount), 1))

const topQualityIssues = computed(() =>
  [...qualityRows.value]
    .filter(r => r.nokCount > 0)
    .sort((a, b) => b.nokRate - a.nokRate)
    .slice(0, 6)
)

const usersByRole = computed(() => {
  const map = new Map()
  for (const u of users.value) {
    const role = u.role?.name || 'Sem função'
    map.set(role, (map.get(role) || 0) + 1)
  }
  return [...map.entries()].map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count)
})

onMounted(async () => {
  try {
    const [b, a, u] = await Promise.allSettled([getBuildings(), getApartments(), getUsers()])
    if (b.status === 'fulfilled') buildings.value = b.value
    if (a.status === 'fulfilled') apartments.value = a.value
    if (u.status === 'fulfilled') users.value = u.value

    try {
      const [ov, q] = await Promise.all([getOverview(), getQuality()])
      overview.value = ov.data
      qualityRows.value = q.data
      isRich.value = true
    } catch {
      isRich.value = false
    }
  } catch (e) {
    error.value = 'Erro ao carregar dados do dashboard.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

/* Barra de progresso limpa */
.progress-card { background: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #eee; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.progress-label { font-size: 0.9rem; font-weight: 600; color: #2d3748; }
.progress-pct { font-size: 0.95rem; font-weight: 700; color: #00e5cc; }
.progress-bar { height: 10px; background: rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden; display: flex; margin-bottom: 12px; }
.progress-fill { height: 100%; transition: width 0.4s ease; }
.progress-fill.teal { background: #00e5cc; }
.progress-fill.orange { background: #f99f56; }
.progress-legend { display: flex; gap: 24px; font-size: 0.8rem; color: #718096; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.dot.teal { background: #00e5cc; }
.dot.orange { background: #f99f56; }
.dot.dark { background: #11142d; }

/* Grid de Cards baseada na imagem image_d92bdc.png */
.metrics-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px; 
  margin-bottom: 28px; 
}

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
}

.metric-label { 
  font-size: 0.82rem; 
  color: #555555; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value { 
  font-size: 2.8rem; /* Estilo numérico encorpado idêntico à imagem */
  font-weight: 700; 
  color: #0f1123; 
  line-height: 1;
}

/* Bordas Esquerdas idênticas aos blocos da imagem */
.border-dark { border-left: 5px solid #11142d; }
.border-orange { border-left: 5px solid #f99f56; }
.border-coral { border-left: 5px solid #ff7a59; }
.border-teal { border-left: 5px solid #00e5cc; }

/* Gráficos inferiores */
.bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.table-title { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; }
.table-header-2 { display: grid; grid-template-columns: 1fr auto; padding: 0 0 8px; font-size: 0.78rem; color: #888; font-weight: 600; border-bottom: 1px solid #eee; margin-bottom: 8px; }

.building-row { display: grid; grid-template-columns: 1.2fr 2fr 0.5fr; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
.building-row:last-child { border-bottom: none; }
.building-name { font-size: 0.85rem; font-weight: 600; color: #2d3748; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.building-bar { height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; }
.building-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

/* Cores internas das barras de progresso inferiores */
.dark-bg { background: #11142d; }
.orange-bg { background: #f99f56; }
.coral-bg { background: #ff7a59; }

.dark-color { color: #11142d; }
.orange-color { color: #f99f56; }
.coral-color { color: #ff7a59; }

.building-count { font-size: 0.85rem; font-weight: 700; color: #4a5568; text-align: right; }
.empty { text-align: center; padding: 32px; color: #a0aec0; font-size: 0.88rem; }

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-row { grid-template-columns: 1fr; }
}
</style>
