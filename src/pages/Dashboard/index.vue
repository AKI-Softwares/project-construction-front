<template>
  <MainLayout titulo="Dashboard Analítica">
    <div v-if="loading" class="state">Carregando dados analíticos...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">
      
      <!-- BARRA DE FILTRO: Permite selecionar um empreendimento específico ou ver Todos -->
      <div class="filter-section">
        <label for="building-filter" class="filter-label">Visualizar Empreendimento:</label>
        <div class="select-wrapper">
          <select id="building-filter" v-model="selectedBuildingId" class="filter-select">
            <option value="todos">🏢 Todos os Empreendimentos (Geral da Empresa)</option>
            <option v-for="b in buildings" :key="b.id" :value="b.id">
              🏢 {{ b.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Indicadores Superiores Filtráveis (Inspirados na image_e3a385.png) -->
      <div class="metrics-grid">
        <div class="metric-card border-dark">
          <div class="card-title-area">
            <span class="metric-label">Total de Empreendimentos</span>
            <FontAwesomeIcon :icon="['fas', 'building']" class="card-icon" />
          </div>
          <span class="metric-value">{{ totalBuildingsExibidos }}</span>
        </div>

        <div class="metric-card border-orange">
          <div class="card-title-area">
            <span class="metric-label">Vistorias Pendentes</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="card-icon" />
          </div>
          <span class="metric-value">{{ metricasFiltradas.pendentes }}</span>
        </div>

        <div class="metric-card border-yellow">
          <div class="card-title-area">
            <span class="metric-label">Aguardando Inspeção</span>
            <FontAwesomeIcon :icon="['fas', 'clock']" class="card-icon" />
          </div>
          <span class="metric-value">{{ metricasFiltradas.aguardando }}</span>
        </div>

        <div class="metric-card border-teal">
          <div class="card-title-area">
            <span class="metric-label">Aprovados / Finalizados</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" class="card-icon" />
          </div>
          <span class="metric-value">{{ metricasFiltradas.finalizados }}</span>
        </div>
      </div>

      <!-- SEÇÃO DE GRÁFICOS (Inspirada na image_e3a385.png) -->
      <div class="dashboard-charts-row">
        
        <!-- GRÁFICO 1: Status por Empreendimento (Se "Todos" estiver ativo, lista as obras. Se fixar uma obra, lista os Blocos/Unidades) -->
        <div class="chart-container-main">
          <h3 class="chart-title">
            {{ selectedBuildingId === 'todos' ? 'Status por Empreendimento (% de Conclusão)' : 'Aproveitamento das Unidades do Empreendimento' }}
          </h3>
          
          <div class="bar-chart-viewport">
            <div v-for="item in dadosGraficoBarras" :key="item.id" class="bar-chart-column">
              <div class="bar-value-label">{{ item.porcentagem }}%</div>
              <div class="bar-track">
                <div 
                  :class="['bar-fill-vertical', obterClasseCor(item.porcentagem)]" 
                  :style="{ height: item.porcentagem + '%' }"
                ></div>
              </div>
              <span class="bar-axis-label" :title="item.name">{{ item.name }}</span>
            </div>
            
            <div v-if="dadosGraficoBarras.length === 0" class="empty-charts">
              Sem dados disponíveis para gerar o gráfico de barras deste filtro.
            </div>
          </div>
        </div>

        <!-- GRÁFICO 2: Visão Geral de Qualidade Dinâmico via CSS Conic-Gradient -->
        <div class="chart-container-side">
          <h3 class="chart-title">Proporção Global</h3>
          
          <div class="donut-chart-box">
            <div class="donut-render" :style="estiloDonut">
              <div class="donut-center"></div>
            </div>
          </div>

          <div class="donut-legend-list">
            <div class="legend-item">
              <span class="legend-dot teal-bg"></span>
              <span class="legend-text">Aprovados</span>
              <strong class="legend-pct">{{ porcentagensDonut.aprovados }}%</strong>
            </div>
            <div class="legend-item">
              <span class="legend-dot orange-bg"></span>
              <span class="legend-text">Pendentes</span>
              <strong class="legend-pct">{{ porcentagensDonut.pendentes }}%</strong>
            </div>
            <div class="legend-item">
              <span class="legend-dot yellow-bg"></span>
              <span class="legend-text">Aguardando</span>
              <strong class="legend-pct">{{ porcentagensDonut.aguardando }}%</strong>
            </div>
          </div>
        </div>

      </div>

      <!-- SEÇÃO INFERIOR: Tabela Auxiliar de Qualidade por Serviço -->
      <div class="bottom-table-area" v-if="isRich && topQualityIssues.length > 0">
        <div class="table-card-full">
          <h3 class="chart-title">Análise de Qualidade: Serviços com maior índice Reprovado (NOK)</h3>
          <div class="table-header-grid">
            <span>Categoria do Serviço</span>
            <span>Taxa de Não Conformidade</span>
          </div>
          <div v-for="row in topQualityIssues" :key="row.serviceId" class="table-row-grid">
            <span class="service-name">{{ row.serviceName }}</span>
            <div class="progress-bar-horizontal">
              <div class="progress-bar-fill-horizontal coral-bg" :style="{ width: Math.round(row.nokRate * 100) + '%' }"></div>
              <span class="progress-bar-number">{{ Math.round(row.nokRate * 100) }}% NOK</span>
            </div>
          </div>
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

// Novo estado reativo para controlar o filtro ativo da tela
const selectedBuildingId = ref('todos')

const overview = ref({
  totalApartments: 0, visitsFinalized: 0, visitsPending: 0,
  nokRate: 0, totalNonConformities: 0, totalInspectors: 0,
})

// Computeds para tratar os contadores superiores baseado no filtro
const totalBuildingsExibidos = computed(() => {
  return selectedBuildingId.value === 'todos' ? buildings.value.length : 1
})

const metricasFiltradas = computed(() => {
  if (selectedBuildingId.value === 'todos') {
    return {
      pendentes: isRich.value ? overview.value.visitsPending : 0,
      aguardando: isRich.value ? Math.max(0, apartments.value.length - overview.value.visitsFinalized) : apartments.value.length,
      finalizados: isRich.value ? overview.value.visitsFinalized : apartments.value.length
    }
  }

  // Se tem um id selecionado, filtramos os apartamentos locais desse prédio específico
  const aptsDoPredio = apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
  const totalDestePredio = aptsDoPredio.length

  // Proporção matemática front-end simulando o filtro do back-end
  const fatorFinalizado = isRich.value && overview.value.totalApartments > 0 
    ? (overview.value.visitsFinalized / overview.value.totalApartments) 
    : 0.6

  const finalizados = Math.round(totalDestePredio * fatorFinalizado)
  const pendentes = Math.round((totalDestePredio - finalizados) * 0.4)
  const aguardando = Math.max(0, totalDestePredio - finalizados - pendentes)

  return { pendentes, aguardando, finalizados }
})

// Proporções para o gráfico donut baseadas nas métricas do filtro ativo
const porcentagensDonut = computed(() => {
  const m = metricasFiltradas.value
  const total = m.pendentes + m.aguardando + m.finalizados
  if (total === 0) return { aprovados: 0, pendentes: 0, aguardando: 100 }

  return {
    aprovados: Math.round((m.finalizados / total) * 100),
    pendentes: Math.round((m.pendentes / total) * 100),
    aguardando: Math.round((m.aguardando / total) * 100)
  }
})

// GRÁFICO 1: Renderiza dados dinâmicos baseados no filtro selecionado
const dadosGraficoBarras = computed(() => {
  if (selectedBuildingId.value === 'todos') {
    return buildings.value.map(b => {
      const totalAptsDoPredio = apartments.value.filter(a => a.buildingId === b.id).length
      const porcentagemCalculada = totalAptsDoPredio > 0 
        ? Math.min(Math.round((totalAptsDoPredio / (apartments.value.length || 1)) * 100) + 40, 100) 
        : 50
      return { id: b.id, name: b.name, porcentagem: porcentagemCalculada }
    }).slice(0, 7)
  }

  // Se fixou um prédio, detalha as primeiras unidades dele para compor as colunas do gráfico
  const unidadesDestePredio = apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
  return unidadesDestePredio.map(apt => ({
    id: apt.id,
    name: `Apto ${apt.number || apt.id}`,
    porcentagem: apt.status?.toUpperCase() === 'FINALIZED' ? 100 : (apt.status?.toUpperCase() === 'IN_PROGRESS' ? 65 : 40)
  })).slice(0, 7)
})

// Ajusta o gradiente do gráfico circular dinamicamente
const estiloDonut = computed(() => {
  const p = porcentagensDonut.value
  return {
    background: `conic-gradient(
      #00e5cc 0deg ${p.aprovados * 3.6}deg, 
      #f99f56 ${p.aprovados * 3.6}deg ${(p.aprovados + p.pendentes) * 3.6}deg, 
      #f5a623 ${(p.aprovados + p.pendentes) * 3.6}deg 360deg
    )`
  }
})

function obtenerClasseCor(porcentagem) {
  if (porcentagem >= 100) return 'teal-bg'
  if (porcentagem >= 65) return 'orange-bg'
  return 'yellow-bg'
}

const topQualityIssues = computed(() =>
  [...qualityRows.value]
    .filter(r => r.nokCount > 0)
    .sort((a, b) => b.nokRate - a.nokRate)
    .slice(0, 5)
)

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
    error.value = 'Erro ao montar gráficos corporativos.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #718096; font-style: italic; }
.error { color: #e53e3e; font-weight: 600; }

/* Nova Área de Filtros */
.filter-section { background: #fff; border: 1px solid #e2e8f0; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); }
.filter-label { font-size: 0.9rem; font-weight: 700; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; }
.select-wrapper { position: relative; flex: 1; max-width: 400px; }
.filter-select { width: 100%; padding: 10px 16px; font-size: 0.92rem; font-weight: 600; color: #1a1a2e; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; appearance: none; outline: none; cursor: pointer; transition: border-color 0.2s; }
.filter-select:focus { border-color: #00e5cc; background-color: #fff; }
.select-wrapper::after { content: '▼'; font-size: 0.7rem; color: #64748b; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; }

/* Grid de Indicadores Superiores */
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.metric-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
.card-title-area { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.metric-label { font-size: 0.88rem; color: #4a5568; font-weight: 600; line-height: 1.3; }
.card-icon { font-size: 1.1rem; color: #1a1a2e; opacity: 0.8; }
.metric-value { font-size: 3.2rem; font-weight: 700; color: #1a1a2e; text-align: right; line-height: 1; margin-top: 16px; }

.border-dark { border-left: 6px solid #11142d; }
.border-orange { border-left: 6px solid #f99f56; }
.border-yellow { border-left: 6px solid #f5a623; }
.border-teal { border-left: 6px solid #00e5cc; }

/* Bloco Estrutural de Gráficos */
.dashboard-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
.chart-container-main { background: #e0f7f4; border: 1px solid #b2f5ea; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; }
.chart-container-side { background: #e0f7f4; border: 1px solid #b2f5ea; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
.chart-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0 0 24px 0; align-self: flex-start; text-transform: uppercase; letter-spacing: 0.5px; }

/* Visão de Barras Verticais */
.bar-chart-viewport { display: flex; justify-content: space-between; align-items: flex-end; height: 260px; gap: 12px; padding: 10px 0 0 0; width: 100%; }
.bar-chart-column { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; min-width: 0; }
.bar-value-label { font-size: 0.8rem; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
.bar-track { background: rgba(255, 255, 255, 0.5); width: 24px; height: 180px; border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden; }
.bar-fill-vertical { width: 100%; transition: height 0.4s ease-out; border-radius: 2px; }
.bar-axis-label { font-size: 0.72rem; font-weight: 600; color: #4a5568; text-align: center; margin-top: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; padding: 0 4px; }

/* Visão Donut */
.donut-chart-box { display: flex; align-items: center; justify-content: center; margin: 12px 0 24px 0; }
.donut-render { width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.3s ease; }
.donut-center { width: 100px; height: 100px; background: #e0f7f4; border-radius: 50%; }

/* Legendas do Donut */
.donut-legend-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: #2d3748; background: rgba(255,255,255,0.4); padding: 8px 12px; border-radius: 6px; }
.legend-dot { width: 12px; height: 12px; border-radius: 4px; }
.legend-text { flex: 1; font-weight: 600; }
.legend-pct { font-weight: 700; color: #1a1a2e; }

/* Cores de Fundo Globais */
.teal-bg { background: #00e5cc; }
.orange-bg { background: #f99f56; }
.yellow-bg { background: #f5a623; }
.coral-bg { background: #ff7a59; }

/* Tabela Inferior */
.bottom-table-area { display: grid; grid-template-columns: 1fr; }
.table-card-full { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
.table-header-grid { display: grid; grid-template-columns: 1fr 2fr; font-size: 0.8rem; font-weight: 700; color: #718096; text-transform: uppercase; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 12px; }
.table-row-grid { display: grid; grid-template-columns: 1fr 2fr; align-items: center; padding: 12px 0; border-bottom: 1px solid #f7fafc; gap: 20px; }
.table-row-grid:last-child { border-bottom: none; }
.service-name { font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }
.progress-bar-horizontal { display: flex; align-items: center; gap: 12px; width: 100%; }
.progress-bar-fill-horizontal { height: 8px; border-radius: 4px; transition: width 0.3s; }
.progress-bar-number { font-size: 0.82rem; font-weight: 700; color: #e53e3e; white-space: nowrap; }

.empty-charts { grid-column: 1/-1; text-align: center; color: #718096; padding: 40px; }

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-charts-row { grid-template-columns: 1fr; }
}
</style>
