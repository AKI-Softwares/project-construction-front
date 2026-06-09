<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Loading...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <div class="cards">
        <div class="card card-dark">
          <div class="card-header">
            <span>Total de Empreendimentos</span>
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" />
          </div>
          <div class="card-number">{{ totalBuildings }}</div>
        </div>
        <div class="card card-orange">
          <div class="card-header">
            <span>Aptos com Pendências</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          </div>
          <div class="card-number">{{ summary.pending }}</div>
          <div class="card-sub">de {{ summary.total }} apartamentos</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header">
            <span>Aguardando Vistoria</span>
            <FontAwesomeIcon :icon="['fas', 'clock']" />
          </div>
          <div class="card-number">{{ summary.waiting }}</div>
          <div class="card-sub">de {{ summary.total }} apartamentos</div>
        </div>
        <div class="card card-teal">
          <div class="card-header">
            <span>Aptos Aprovados</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          </div>
          <div class="card-number">{{ summary.approved }}</div>
          <div class="card-sub">{{ summary.approvedPct }}% do total</div>
        </div>
      </div>

      <div class="charts">
        <div class="chart-card chart-bars">
          <div class="chart-title">Status por Empreendimento (apartamentos)</div>
          <Bar :data="barData" :options="barOptions" />
        </div>
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
import { getApartmentsSummary } from '../../utils/checklist.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const loading = ref(true)
const error = ref('')
const buildings = ref([])

const totalBuildings = computed(() => buildings.value.length)

const summary = computed(() =>
  getApartmentsSummary(mockApartments, mockChecklists)
)

const buildingSummaries = computed(() =>
  buildings.value.map(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    return {
      name: b.name.replace('Residencial ', ''),
      ...getApartmentsSummary(apts, mockChecklists)
    }
  })
)

const barData = computed(() => ({
  labels: buildingSummaries.value.map(b => b.name),
  datasets: [
    { label: 'Approved', data: buildingSummaries.value.map(b => b.approved), backgroundColor: '#00e5cc', borderRadius: 4 },
    { label: 'Pending', data: buildingSummaries.value.map(b => b.pending), backgroundColor: '#f99f56', borderRadius: 4 },
    { label: 'Waiting', data: buildingSummaries.value.map(b => b.waiting), backgroundColor: '#f5a623', borderRadius: 4 },
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
  labels: ['Approved', 'Pending', 'Waiting'],
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
    error.value = 'Error loading data.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.card { border-radius: 12px; padding: 20px; background: #fff; border-left: 6px solid transparent; }
.card-dark { border-left-color: #1a1a2e; }
.card-orange { border-left-color: #f99f56; }
.card-yellow { border-left-color: #f5a623; }
.card-teal { border-left-color: #00e5cc; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #555; margin-bottom: 8px; }
.card-number { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.8rem; color: #888; margin-top: 4px; }
.charts { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
.chart-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.chart-title { font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.chart-doughnut { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
.legend { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #333; }
.legend-color { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
</style>