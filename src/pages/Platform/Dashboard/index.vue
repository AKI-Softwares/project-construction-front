<template>
  <MainLayout titulo="Dashboard da Plataforma">

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Cards -->
      <div class="cards">
        <div class="card card-teal">
          <div class="card-header"><span>Empresas Ativas</span><FontAwesomeIcon :icon="['fas', 'circle-check']" /></div>
          <div class="card-number">{{ overview.activeCompanies }}</div>
        </div>
        <div class="card card-orange">
          <div class="card-header"><span>Empresas Suspensas</span><FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /></div>
          <div class="card-number">{{ overview.suspendedCompanies }}</div>
        </div>
        <div class="card card-dark">
          <div class="card-header"><span>Total de Usuários</span><FontAwesomeIcon :icon="['fas', 'users']" /></div>
          <div class="card-number">{{ overview.totalUsers }}</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header"><span>Vistorias Criadas</span><FontAwesomeIcon :icon="['fas', 'clipboard-list']" /></div>
          <div class="card-number">{{ overview.visitsCreated }}</div>
          <div class="card-sub">no período</div>
        </div>
        <div class="card card-teal">
          <div class="card-header"><span>Inspeções Finalizadas</span><FontAwesomeIcon :icon="['fas', 'circle-check']" /></div>
          <div class="card-number">{{ overview.inspectionsFinalized }}</div>
          <div class="card-sub">no período</div>
        </div>
      </div>

      <div class="charts-row">

        <!-- Crescimento de empresas -->
        <div class="chart-card">
          <div class="chart-title">Novas empresas por mês (últimos 12 meses)</div>
          <Bar v-if="growth.length > 0" :data="growthChartData" :options="growthChartOptions" />
          <div v-else class="empty">Sem dados de crescimento ainda.</div>
        </div>

      </div>

      <!-- Uso por empresa -->
      <div class="table-card">
        <div class="table-title">
          <FontAwesomeIcon :icon="['fas', 'chart-simple']" class="title-icon teal" />
          Uso por empresa
        </div>
        <div class="table-header">
          <span>Empresa</span>
          <span>Vistorias criadas</span>
          <span>Inspeções finalizadas</span>
        </div>
        <div v-for="row in usage" :key="row.companyId" class="table-row">
          <span class="row-company">{{ row.companyName }}</span>
          <span>{{ row.visitsCreated }}</span>
          <span>{{ row.inspectionsFinalized }}</span>
        </div>
        <div v-if="usage.length === 0" class="empty">Nenhuma empresa ativa com dados no período.</div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import MainLayout from '../../../components/Layout/MainLayout.vue'
import { getPlatformOverview, getPlatformUsage, getPlatformGrowth } from '../../../services/platform.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const loading = ref(true)
const error = ref('')

const overview = ref({
  activeCompanies: 0, suspendedCompanies: 0, totalUsers: 0,
  visitsCreated: 0, inspectionsFinalized: 0,
})
const usage = ref([])
const growth = ref([])

const growthChartData = computed(() => ({
  labels: [...growth.value].reverse().map(g => formatMonth(g.month)),
  datasets: [{
    label: 'Novas empresas',
    data: [...growth.value].reverse().map(g => g.newCompanies),
    backgroundColor: '#00e5cc',
    borderRadius: 4,
  }],
}))

const growthChartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } },
  },
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${names[Number(month) - 1]}/${year.slice(2)}`
}

onMounted(async () => {
  try {
    const [ov, us, gr] = await Promise.all([
      getPlatformOverview(),
      getPlatformUsage(),
      getPlatformGrowth(),
    ])
    overview.value = ov
    usage.value = us
    growth.value = gr
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar dashboard.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

.cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
.card { border-radius: 12px; padding: 18px; background: #fff; border-left: 6px solid transparent; }
.card-dark { border-left-color: #1a1a2e; }
.card-teal { border-left-color: #00e5cc; }
.card-orange { border-left-color: #f99f56; }
.card-yellow { border-left-color: #f5a623; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #555; margin-bottom: 6px; }
.card-number { font-size: 2rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.75rem; color: #888; margin-top: 2px; }

.charts-row { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.chart-title { font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.empty { text-align: center; padding: 24px; color: #aaa; font-size: 0.9rem; }

.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.table-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.title-icon.teal { color: #00e5cc; }
.table-header { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 8px 12px; font-size: 0.78rem; color: #888; font-weight: 600; border-bottom: 1px solid #eee; margin-bottom: 8px; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 10px 12px; font-size: 0.85rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; }
.table-row:last-child { border-bottom: none; }
.row-company { font-weight: 600; color: #1a1a2e; }
</style>
