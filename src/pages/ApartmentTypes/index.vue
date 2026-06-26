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

// Estado reativo para controlar o filtro selecionado
const selectedBuildingId = ref('todos')

// Inicialização segura do objeto de overview
const overview = ref({
  totalApartments: 0, 
  visitsFinalized: 0, 
  visitsPending: 0,
  nokRate: 0, 
  totalNonConformities: 0, 
  totalInspectors: 0,
})

// 1. Contador superior do total de empreendimentos exibidos
const totalBuildingsExibidos = computed(() => {
  return Array.isArray(buildings.value) ? (selectedBuildingId.value === 'todos' ? buildings.value.length : 1) : 0
})

// 2. Cálculo reativo e real dos cartões de métricas baseado no filtro ativo
const metricasFiltradas = computed(() => {
  const totalAptsGeral = Array.isArray(apartments.value) ? apartments.value.length : 0
  const ov = overview.value || { visitsPending: 0, visitsFinalized: 0, totalApartments: 0 }

  // Se o filtro for Geral ("Todos")
  if (selectedBuildingId.value === 'todos') {
    return {
      pendentes: isRich.value ? (ov.visitsPending || 0) : 0,
      aguardando: isRich.value ? Math.max(0, totalAptsGeral - (ov.visitsFinalized || 0)) : totalAptsGeral,
      finalizados: isRich.value ? (ov.visitsFinalized || 0) : totalAptsGeral
    }
  }

  // Se houver um empreendimento específico selecionado
  if (!Array.isArray(apartments.value)) return { pendentes: 0, aguardando: 0, finalizados: 0 }

  const aptsDoPredio = apartments.value.filter(a => a && a.buildingId === selectedBuildingId.value)
  const totalDestePredio = aptsDoPredio.length

  if (totalDestePredio === 0) return { pendentes: 0, aguardando: 0, finalizados: 0 }

  // Extrai as métricas reais do banco baseadas nos status das unidades deste prédio
  const finalizados = aptsDoPredio.filter(a => String(a.status || '').toUpperCase() === 'FINALIZED').length
  const pendentes = aptsDoPredio.filter(a => {
    const s = String(a.status || '').toUpperCase()
    return s === 'PENDING' || s === 'IN_PROGRESS' || s === 'PROGRESS'
  }).length
  const aguardando = Math.max(0, totalDestePredio - finalizados - pendentes)

  return { pendentes, aguardando, finalizados }
})

// 3. Proporções percentuais para alimentar a legenda e o gráfico Donut
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

// 4. GRÁFICO DE BARRAS UNIFICADO (Corrige a divergência de % entre telas)
const dadosGraficoBarras = computed(() => {
  if (!Array.isArray(buildings.value) || !Array.isArray(apartments.value)) return []

  // VISÃO GERAL: Calcula a média real baseada nas unidades finalizadas de cada obra
  if (selectedBuildingId.value === 'todos') {
    return buildings.value.map(b => {
      if (!b) return { id: Math.random(), name: 'Sem nome', porcentagem: 0 }
      
      const aptsDoPredio = apartments.value.filter(a => a && a.buildingId === b.id)
      const totalApts = aptsDoPredio.length
      
      if (totalApts === 0) return { id: b.id, name: b.name || 'Obra sem nome', porcentagem: 0 }
      
      const finalizados = aptsDoPredio.filter(a => String(a.status || '').toUpperCase() === 'FINALIZED').length
      const porcentagemReal = Math.round((finalizados / totalApts) * 100)
      
      return { 
        id: b.id, 
        name: b.name || 'Obra sem nome', 
        porcentagem: porcentagemReal 
      }
    }).slice(0, 7)
  }

  // VISÃO FILTRADA: Detalha o progresso real de cada unidade pertencente àquela obra
  const unidadesDestePredio = apartments.value.filter(a => a && a.buildingId === selectedBuildingId.value)
  return unidadesDestePredio.map(apt => {
    if (!apt) return { id: Math.random(), name: 'Unidade', porcentagem: 0 }
    const statusNormalizado = String(apt.status || '').toUpperCase()
    
    let progressoUnidade = 0
    if (statusNormalizado === 'FINALIZED') progressoUnidade = 100
    else if (statusNormalizado === 'IN_PROGRESS' || statusNormalizado === 'PROGRESS') progressoUnidade = 50

    return {
      id: apt.id,
      name: `Apto ${apt.number || apt.id}`,
      porcentagem: progressoUnidade
    }
  }).slice(0, 7)
})

// 5. Estilização dinâmica do gradiente cônico para o gráfico circular (Donut)
const estiloDonut = computed(() => {
  const p = porcentagensDonut.value || { aprovados: 0, pendentes: 0, aguardando: 100 }
  return {
    background: `conic-gradient(
      #00e5cc 0deg ${p.aprovados * 3.6}deg, 
      #f99f56 ${p.aprovados * 3.6}deg ${(p.aprovados + p.pendentes) * 3.6}deg, 
      #f5a623 ${(p.aprovados + p.pendentes) * 3.6}deg 360deg
    )`
  }
})

// Auxiliar de cores para as colunas do gráfico de barras
function obterClasseCor(porcentagem) {
  if (porcentagem >= 100) return 'teal-bg'
  if (porcentagem >= 50) return 'orange-bg'
  return 'yellow-bg'
}

// 6. Lista de principais problemas de qualidade filtrados
const topQualityIssues = computed(() => {
  if (!Array.isArray(qualityRows.value)) return []
  return [...qualityRows.value]
    .filter(r => r && r.nokCount > 0)
    .sort((a, b) => (b.nokRate || 0) - (a.nokRate || 0))
    .slice(0, 5)
})

// Ciclo de vida: Carregamento assíncrono blindado contra respostas sem o wrapper '.data'
onMounted(async () => {
  try {
    const [b, a, u] = await Promise.allSettled([getBuildings(), getApartments(), getUsers()])
    
    if (b.status === 'fulfilled' && b.value) {
      buildings.value = Array.isArray(b.value) ? b.value : (b.value.data || [])
    }
    if (a.status === 'fulfilled' && a.value) {
      apartments.value = Array.isArray(a.value) ? a.value : (a.value.data || [])
    }
    if (u.status === 'fulfilled' && u.value) {
      users.value = Array.isArray(u.value) ? u.value : (u.value.data || [])
    }

    try {
      const [ov, q] = await Promise.all([getOverview(), getQuality()])
      if (ov && ov.data) overview.value = ov.data
      if (q && q.data) qualityRows.value = q.data
      isRich.value = true
    } catch (analyticsError) {
      console.warn('Serviço de análise avançada offline ou restrito. Usando fallback reativo local.', analyticsError)
      isRich.value = false
    }
  } catch (e) {
    console.error('Erro geral ao montar a estrutura da dashboard:', e)
    error.value = 'Houve um problema de comunicação com as APIs de vistorias.'
  } finally {
    loading.value = false
  }
})
</script>
