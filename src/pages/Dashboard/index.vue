<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Barra de progresso geral -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">Progresso geral das vistorias</span>
          <span class="progress-pct">{{ summary.approvedPct }}% concluído</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill approved" :style="{ width: summary.approvedPct + '%' }"></div>
          <div class="progress-fill pending" :style="{ width: summary.pendingPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot approved"></span>Aprovados {{ summary.approved }} apts</span>
          <span><span class="dot pending"></span>Pendências {{ summary.pending }} apts</span>
          <span><span class="dot waiting"></span>Aguardando {{ summary.waiting }} apts</span>
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
          <div class="card-sub">{{ totalApartments }} apartamentos no total</div>
        </div>
        <div class="card card-orange">
          <div class="card-header">
            <span>Com Pendências</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          </div>
          <div class="card-number">{{ summary.pending }}</div>
          <div class="card-sub card-sub-alert">Requerem atenção imediata</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header">
            <span>Aguardando Vistoria</span>
            <FontAwesomeIcon :icon="['fas', 'clock']" />
          </div>
          <div class="card-number">{{ summary.waiting }}</div>
          <div class="card-sub">{{ summary.waitingPct }}% do total</div>
        </div>
        <div class="card card-teal">
          <div class="card-header">
            <span>Aprovados</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          </div>
          <div class="card-number">{{ summary.approved }}</div>
          <div class="card-sub">{{ summary.approvedPct }}% do total</div>
        </div>
      </div>

      <!-- Gráficos + Pendências críticas -->
      <div class="charts-row">

        <!-- Gráfico de barras -->
        <div class="chart-card chart-bars">
          <div class="chart-title">Status por Empreendimento</div>
          <Bar :data="barData" :options="barOptions" />
        </div>

        <!-- Gráfico de rosca -->
        <div class="chart-card chart-doughnut">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
          <div class="legend">
            <div class="legend-item">
              <span class="legend-color" style="background:#00e5cc"></span>
              Aprovados {{ summary.approvedPct }}%
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background:#f99f56"></span>
              Pendentes {{ summary.pendingPct }}%
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background:#f5a623"></span>
              Aguardando {{ summary.waitingPct }}%
            </div>
          </div>
        </div>

      </div>

      <!-- Pendências críticas + Progresso por empreendimento -->
      <div class="bottom-row">

        <!-- Pendências críticas -->
        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="title-icon orange" />
            Apartamentos com pendências críticas
          </div>
          <div class="table-header">
            <span>Empreendimento</span>
            <span>Apartamento</span>
            <span>Bloco</span>
            <span>Progresso</span>
          </div>
          <div
            v-for="apt in criticalApartments"
            :key="apt.id"
            class="table-row"
          >
            <span class="row-building">{{ apt.buildingName }}</span>
            <span class="row-apt">{{ apt.identifier }}</span>
            <span>{{ apt.block }}</span>
            <div class="row-progress">
              <div class="mini-bar">
                <div class="mini-fill" :style="{ width: apt.progress + '%' }"></div>
              </div>
              <span>{{ apt.progress }}%</span>
            </div>
          </div>
          <div v-if="criticalApartments.length === 0" class="empty">
            Nenhuma pendência crítica. 🎉
          </div>
        </div>

        <!-- Progresso por empreendimento -->
        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" class="title-icon teal" />
            Progresso por empreendimento
          </div>
          <div
            v-for="b in buildingSummaries"
            :key="b.id"
            class="building-progress-row"
          >
            <div class="building-name">{{ b.name }}</div>
            <div class="building-stats">
              <span class="stat approved">{{ b.approved }} aprov.</span>
              <span class="stat pending">{{ b.pending }} pend.</span>
              <span class="stat waiting">{{ b.waiting }} aguard.</span>
            </div>
            <div class="building-bar">
              <div class="building-fill approved" :style="{ width: b.approvedPct + '%' }"></div>
              <div class="building-fill pending" :style="{ width: b.pendingPct + '%' }"></div>
            </div>
            <span class="building-pct">{{ b.approvedPct }}%</span>
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
import { mockChecklists, mockApartments } from '../../mocks/buildings.js'
import { getApartmentsSummary, getApartmentStatus, getProgress } from '../../utils/checklist.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const loading = ref(true)
const error = ref('')
const buildings = ref([])

const totalBuildings = computed(() => buildings.value.length)
const totalApartments = computed(() => mockApartments.length)

const summary = computed(() =>
  getApartmentsSummary(mockApartments, mockChecklists)
)

const buildingSummaries = computed(() =>
  buildings.value.map(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    const s = getApartmentsSummary(apts, mockChecklists)
    return { ...s, id: b.id, name: b.name.replace('Residencial ', '') }
  })
)

// Apartamentos com PENDING ordenados por menor progresso
const criticalApartments = computed(() => {
  return mockApartments
    .filter(apt => getApartmentStatus(mockChecklists[apt.id]) === 'pending')
    .map(apt => {
      const building = buildings.value.find(b => b.id === apt.buildingId)
      return {
        ...apt,
        buildingName: building ? building.name.replace('Residencial ', '') : '—',
        progress: getProgress(mockChecklists[apt.id]),
      }
    })
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 8)
})

const barData = computed(() => ({
  labels: buildingSummaries.value.map(b => b.name),
  datasets: [
    { label: 'Aprovados', data: buildingSummaries.value.map(b => b.approved), backgroundColor: '#00e5cc', borderRadius: 4 },
    { label: 'Pendentes', data: buildingSummaries.value.map(b => b.pending), backgroundColor: '#f99f56', borderRadius: 4 },
    { label: 'Aguardando', data: buildingSummaries.value.map(b => b.waiting), backgroundColor: '#f5a623', borderRadius: 4 },
  ]
}))

const barOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 10 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } }
  }
}

const doughnutData = computed(() => ({
  labels: ['Aprovados', 'Pendentes', 'Aguardando'],
  datasets: [{
    data: [summary.value.approved, summary.value.pending, summary.value.waiting],
    backgroundColor: ['#00e5cc', '#f99f56', '#f5a623'],
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
    buildings.value = await getBuildings()
  } catch (e) {
    error.value = 'Erro ao carregar dados.'
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
.dot.waiting { background: rgba(0,0,0,0.15); }

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
.mini-fill { height: 100%; background: #00e5cc; border-radius: 4px; }
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
.stat { font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
.stat.approved { background: #e0faf6; color: #00897b; }
.stat.pending { background: #fff3e0; color: #f99f56; }
.stat.waiting { background: #f5f5f5; color: #888; }
.building-bar { height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; }
.building-fill { height: 100%; transition: width 0.3s; }
.building-fill.approved { background: #00e5cc; }
.building-fill.pending { background: #f99f56; }
.building-pct { font-size: 0.82rem; font-weight: bold; color: #00e5cc; min-width: 36px; text-align: right; }
</style>