<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import VisitModal from '../../components/Layout/VisitModal.vue'
import { getVisits, getVisit } from '../../services/visits.js'

const selectedVisit = ref(null)
const loadingVisit = ref(false)
const loading = ref(true)
const error = ref('')
const visits = ref([])

const search = ref('')
const activeFilter = ref('ALL')
const selectedBuilding = ref('ALL')
const selectedInspector = ref('ALL')
const dateFrom = ref('')
const dateTo = ref('')

const uniqueBuildings = computed(() => {
  const names = visits.value.map(v => v.apartment?.building?.name || v.apartment?.building?.title).filter(Boolean)
  return [...new Set(names)]
})

const uniqueInspectors = computed(() => {
  const names = visits.value.map(v => v.user?.name).filter(Boolean)
  return [...new Set(names)]
})

const filteredVisits = computed(() => {
  let result = visits.value

  if (search.value) {
    const q = search.value.toLowerCase().trim()
    result = result.filter(v =>
      v.apartment?.identifier?.toLowerCase().includes(q) ||
      v.title?.toLowerCase().includes(q)
    )
  }

  if (activeFilter.value !== 'ALL') {
    result = result.filter(v => v.status === activeFilter.value)
  }

  if (selectedBuilding.value !== 'ALL') {
    const targetBuilding = selectedBuilding.value.toLowerCase().trim()
    result = result.filter(v => {
      const buildingName = v.apartment?.building?.name || v.apartment?.building?.title || ''
      return buildingName.toLowerCase().trim() === targetBuilding
    })
  }

  if (selectedInspector.value !== 'ALL') {
    const targetInspector = selectedInspector.value.toLowerCase().trim()
    result = result.filter(v => {
      const inspectorName = v.user?.name || ''
      return inspectorName.toLowerCase().trim() === targetInspector
    })
  }

  if (dateFrom.value) {
    const from = new Date(dateFrom.value + 'T00:00:00')
    result = result.filter(v => new Date(v.createdAt) >= from)
  }

  if (dateTo.value) {
    const to = new Date(dateTo.value + 'T23:59:59')
    result = result.filter(v => new Date(v.createdAt) <= to)
  }

  return result
})

function countByStatus(status) {
  return visits.value.filter(v => v.status === status).length
}

function translateStatus(status) {
  const map = { PENDING: 'Pendente', ONGOING: 'Em andamento', FINALIZED: 'Finalizada' }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

async function openVisit(id) {
  loadingVisit.value = true
  try {
    selectedVisit.value = await getVisit(id)
  } catch (e) {
    console.error('Erro ao carregar vistoria:', e)
  } finally {
    loadingVisit.value = false
  }
}

onMounted(async () => {
  try {
    visits.value = await getVisits()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar vistorias.'
  } finally {
    loading.value = false
  }
})
</script>
