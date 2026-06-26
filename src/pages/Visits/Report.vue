<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import * as reportsService from '../../services/reports.js' // Ajuste o caminho do seu serviço se necessário

const router = useRouter()
const loading = ref(true)
const error = ref('')
const reports = ref([])

// Estados dos filtros reativos normalizados
const search = ref('')
const selectedBuilding = ref('ALL')
const selectedInspector = ref('ALL')
const dateFrom = ref('')
const dateTo = ref('')

// Extrai dinamicamente a lista de edifícios únicos tratando chaves alternativas
const uniqueBuildings = computed(() => {
  const names = reports.value.map(r => r.apartment?.building?.name || r.apartment?.building?.title || r.building?.name).filter(Boolean)
  return [...new Set(names)]
})

// Extrai dinamicamente a lista de inspetores únicos
const uniqueInspectors = computed(() => {
  const names = reports.value.map(r => r.user?.name || r.inspector?.name).filter(Boolean)
  return [...new Set(names)]
})

// Processamento cumulativo dos filtros (CORRIGIDO: Sem fórmulas e com tratamento estrito de string)
const filteredReports = computed(() => {
  let result = reports.value

  // 1. Filtro por texto global
  if (search.value) {
    const q = search.value.toLowerCase().trim()
    result = result.filter(r =>
      r.apartment?.identifier?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    )
  }

  // 2. Filtro por Empreendimento (Comparações normalizadas e seguras)
  if (selectedBuilding.value !== 'ALL') {
    const targetBuilding = selectedBuilding.value.toLowerCase().trim()
    result = result.filter(r => {
      const buildingName = r.apartment?.building?.name || r.apartment?.building?.title || r.building?.name || ''
      return buildingName.toLowerCase().trim() === targetBuilding
    })
  }

  // 3. Filtro por Inspetor
  if (selectedInspector.value !== 'ALL') {
    const targetInspector = selectedInspector.value.toLowerCase().trim()
    result = result.filter(r => {
      const inspectorName = r.user?.name || r.inspector?.name || ''
      return inspectorName.toLowerCase().trim() === targetInspector
    })
  }

  // 4. Filtro por Período (Data Inicial)
  if (dateFrom.value) {
    const from = new Date(dateFrom.value + 'T00:00:00')
    result = result.filter(r => new Date(r.createdAt || r.date) >= from)
  }

  // 5. Filtro por Período (Data Final)
  if (dateTo.value) {
    const to = new Date(dateTo.value + 'T23:59:59')
    result = result.filter(r => new Date(r.createdAt || r.date) <= to)
  }

  return result
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  try {
    // Tenta carregar os relatórios da API real
    const fetchReportsFn = reportsService.getReports || reportsService.default?.getReports
    if (typeof fetchReportsFn === 'function') {
      reports.value = await fetchReportsFn()
    } else {
      console.warn('Método de listagem de relatórios não encontrado. Usando array vazio.')
      reports.value = []
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar relatórios.'
  } finally {
    loading.value = false
  }
})
</script>
