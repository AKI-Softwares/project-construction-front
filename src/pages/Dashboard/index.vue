<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Barra de progresso geral (% de vistorias finalizadas no período) -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">Vistorias finalizadas no período</span>
          <span class="progress-pct">{{ finalizedPct }}% concluído</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill approved" :style="{ width: finalizedPct + '%' }"></div>
          <div class="progress-fill pending" :style="{ width: pendingPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot approved"></span>Finalizadas {{ overview.visitsFinalized }}</span>
          <span><span class="dot pending"></span>Pendentes {{ overview.visitsPending }}</span>
        </div>
      </div>

      <!-- Cards -->
      <div class="cards">
        <div class="card card-dark">
          <div class="card-header">
            <span>Total de Empreendimentos</span>
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" />
          </div>
          <div class="card-number">{{ totalBuildings }}</div>
          <div class="card-sub">{{ overview.totalApartments }} apartamentos no total</div>
        </div>
        <div class="card card-orange">
          <div class="card-header">
            <span>Vistorias Pendentes</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          </div>
          <div class="card-number">{{ overview.visitsPending }}</div>
          <div class="card-sub card-sub-alert">Aguardando inspeção</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header">
            <span>Não Conformidades</span>
            <FontAwesomeIcon :icon="['fas', 'clock']" />
          </div>
          <div class="card-number">{{ overview.totalNonConformities }}</div>
          <div class="card-sub">Identificadas nas vistorias</div>
        </div>
        <div class="card card-teal">
          <div class="card-header">
            <span>Taxa de Aprovação</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          </div>
          <div class="card-number">{{ approvalPct }}%</div>
          <div class="card-sub">{{ overview.visitsFinalized }} vistorias finalizadas no período</div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-row">

        <!-- Gráfico de barras: progresso e qualidade por empreendimento -->
        <div class="chart-card chart-bars">
          <div class="chart-title">Progresso e qualidade por empreendimento</div>
          <Bar v-if="buildingRanking.length > 0" :data="barData" :options="barOptions" />
          <div v-else class="empty">Nenhum empreendimento com dados ainda.</div>
        </div>

        <!-- Gráfico de rosca: finalizadas x pendentes -->
        <div class="chart-card chart-doughnut">
          <Doughnut v-if="totalVisits > 0" :data="doughnutData" :options="doughnutOptions" />
          <div v-else class="empty">Sem vistorias no período.</div>
          <div class="legend">
            <div class="legend-item">
              <span class="legend-color" style="background:#00e5cc"></span>
              Finalizadas {{ finalizedPct }}%
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background:#f99f56"></span>
              Pendentes {{ pendingPct }}%
            </div>
          </div>
        </div>

      </div>

      <!-- Qualidade por serviço + Ranking de empreendimentos -->
      <div class="bottom-row">

        <!-- Qualidade por serviço (o que mais reprova nas vistorias) -->
        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="title-icon orange" />
            Serviços com mais reprovações
          </div>
          <div class="table-header">
            <span>Serviço</span>
            <span>Categoria</span>
            <span>Reprovações</span>
            <span>Taxa de reprovação</span>
          </div>
          <div
            v-for="row in topQualityIssues"
            :key="row.serviceId"
            class="table-row"
          >
            <span class="row-building">{{ row.serviceName }}</span>
            <span>{{ row.category || '—' }}</span>
            <span class="row-apt">{{ row.nokCount }}</span>
            <div class="row-progress">
              <div class="mini-bar">
                <div class="mini-fill" :style="{ width: Math.round(row.nokRate * 100) + '%' }"></div>
              </div>
              <span>{{ Math.round(row.nokRate * 100) }}%</span>
            </div>
          </div>
          <div v-if="topQualityIssues.length === 0" class="empty">
            Nenhuma reprovação registrada no período. 🎉
          </div>
        </div>

        <!-- Ranking de empreendimentos -->
        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" class="title-icon teal" />
            Ranking de empreendimentos
          </div>
          <div
            v-for="b in buildingRanking"
            :key="b.buildingId"
            class="building-progress-row"
          >
            <div class="building-name">{{ b.buildingName }}</div>
            <div class="building-stats">
              <span class="stat approved">{{ b.finalizedApartments }}/{{ b.totalApartments }} finalizados</span>
              <span class="stat pending">{{ Math.round(b.nokRate * 100) }}% reprovação</span>
            </div>
            <div class="building-bar">
              <div class="building-fill approved" :style="{ width: b.progressPercent + '%' }"></div>
            </div>
            <span class="building-pct">{{ b.progressPercent }}%</span>
          </div>
          <div v-if="buildingRanking.length === 0" class="empty">
            Nenhum empreendimento com dados ainda.
          </div>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { getOverview, getBuildingRanking, getQuality } from '../../services/analytics.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const loading = ref(true)
const error = ref('')
const buildings = ref([])
const buildingRanking = ref([])
const qualityRows = ref([])

const overview = ref({
  totalApartments: 0,
  visitsFinalized: 0,
  visitsPending: 0,
  nokRate: 0,
  totalNonConformities: 0,
  totalInspectors: 0,
})

const totalBuildings = computed(() => buildings.value.length)

const totalVisits = computed(() => overview.value.visitsFinalized + overview.value.visitsPending)
const finalizedPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsFinalized / totalVisits.value) * 100) : 0
)
const pendingPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsPending / totalVisits.value) * 100) : 0
)
const approvalPct = computed(() => Math.round((1 - overview.value.nokRate) * 100))

// Top 8 serviços com mais reprovações (substitui a antiga lista de
// "apartamentos com pendências críticas", que dependia de um modelo de
// status por apartamento que não existe no back real)
const topQualityIssues = computed(() =>
  [...qualityRows.value]
    .filter(r => r.nokCount > 0)
    .sort((a, b) => b.nokRate - a.nokRate)
    .slice(0, 8)
)

const barData = computed(() => ({
  labels: buildingRanking.value.map(b => b.buildingName.replace('Residencial ', '')),
  datasets: [
    { label: 'Progresso (%)', data: buildingRanking.value.map(b => b.progressPercent), backgroundColor: '#00e5cc', borderRadius: 4 },
    { label: 'Taxa de reprovação (%)', data: buildingRanking.value.map(b => Math.round(b.nokRate * 100)), backgroundColor: '#f99f56', borderRadius: 4 },
  ]
}))

const barOptions = {
  responsive: true,
  plugins: { legend: { display: true, position: 'bottom' } },
  scales: {
    y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } }
  }
}

const doughnutData = computed(() => ({
  labels: ['Finalizadas', 'Pendentes'],
  datasets: [{
    data: [overview.value.visitsFinalized, overview.value.visitsPending],
    backgroundColor: ['#00e5cc', '#f99f56'],
    borderWidth: 0,
    hoverOffset: 8,
  }]
}))

const doughnutOptions = {
  responsive: true,
  cutout: '70%',
  plugins: { legend: { display: false } }
}

onMounted(async () => {
  try {
    const [b, ov, ranking, quality] = await Promise.all([
      getBuildings(),
      getOverview(),
      getBuildingRanking(),
      getQuality(),
    ])
    buildings.value = b
    overview.value = ov.data
    buildingRanking.value = ranking.data
    qualityRows.value = quality.data
  } catch (e) {
    if (e.response?.status === 403) {
      error.value = 'Este dashboard exige permissão de administrador da empresa.'
    } else {
      error.value = 'Erro ao carregar dados.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

/* Progress geral */
.progress-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid #eee;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.progress-label { font-size: 0.9rem; font-weight: 600; color: #333; }
.progress-pct { font-size: 1rem; font-weight: bold; color: #00e5cc; }
.progress-bar {
  height: 12px;
  background: rgba(0,0,0,0.08);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  margin-bottom: 10px;
}
.progress-fill { height: 100%; transition: width 0.4s ease; }
.progress-fill.approved { background: #00e5cc; }
.progress-fill.pending { background: #f99f56; }
.progress-legend {
  display: flex;
  gap: 24px;
  font-size: 0.8rem;
  color: #555;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.dot.approved { background: #00e5cc; }
.dot.pending { background: #f99f56; }

/* Cards */
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.card { border-radius: 12px; padding: 20px; background: #fff; border-left: 6px solid transparent; }
.card-dark { border-left-color: #1a1a2e; }
.card-orange { border-left-color: #f99f56; }
.card-yellow { border-left-color: #f5a623; }
.card-teal { border-left-color: #00e5cc; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #555; margin-bottom: 8px; }
.card-number { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.8rem; color: #888; margin-top: 4px; }
.card-sub-alert { color: #f99f56; font-weight: 600; }

/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 280px; gap: 20px; margin-bottom: 24px; }
.chart-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.chart-title { font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.chart-doughnut { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.legend { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #333; }
.legend-color { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }

/* Bottom row */
.bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}
.title-icon.orange { color: #f99f56; }
.title-icon.teal { color: #00e5cc; }

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  padding: 6px 8px;
  font-size: 0.78rem;
  color: #888;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
}
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  padding: 10px 8px;
  font-size: 0.82rem;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
}
.table-row:last-child { border-bottom: none; }
.row-building { font-weight: 500; }
.row-apt { font-weight: bold; color: #f99f56; }
.row-progress { display: flex; align-items: center; gap: 8px; }
.mini-bar { flex: 1; height: 6px; background: #eee; border-radius: 4px; overflow: hidden; }
.mini-fill { height: 100%; background: #f99f56; border-radius: 4px; }
.empty { text-align: center; padding: 24px; color: #aaa; font-size: 0.9rem; }

/* Building progress */
.building-progress-row {
  display: grid;
  grid-template-columns: 1fr auto 2fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.building-progress-row:last-child { border-bottom: none; }
.building-name { font-size: 0.85rem; font-weight: 600; color: #1a1a2e; }
.building-stats { display: flex; gap: 6px; }
.stat { font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
.stat.approved { background: #e0faf6; color: #00897b; }
.stat.pending { background: #fff3e0; color: #f99f56; }
.building-bar { height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; }
.building-fill { height: 100%; transition: width 0.3s; }
.building-fill.approved { background: #00e5cc; }
.building-pct { font-size: 0.82rem; font-weight: bold; color: #00e5cc; min-width: 36px; text-align: right; }
</style>
