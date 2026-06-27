<template>
  <MainLayout titulo="Vistorias">

    <div class="filters-panel">
      <div class="search-box">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por apartamento, título..."
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <div class="control-group">
          <label>Empreendimento</label>
          <select v-model="selectedBuilding">
            <option value="ALL">Todos os edifícios</option>
            <option v-for="b in uniqueBuildings" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Status</label>
          <select v-model="activeFilter">
            <option value="ALL">Todos os status</option>
            <option value="PENDING">Pendentes</option>
            <option value="ONGOING">Em andamento</option>
            <option value="FINALIZED">Finalizadas</option>
          </select>
        </div>

        <div class="control-group">
          <label>Inspetor</label>
          <select v-model="selectedInspector">
            <option value="ALL">Todos os inspetores</option>
            <option v-for="ins in uniqueInspectors" :key="ins" :value="ins">{{ ins }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>De (Criação)</label>
          <input type="date" v-model="dateFrom" />
        </div>

        <div class="control-group">
          <label>Até (Criação)</label>
          <input type="date" v-model="dateTo" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="state">Carregando vistorias do servidor...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <div class="cards">
        <div class="card card-dark">
          <div class="card-header"><span>Total</span></div>
          <div class="card-number">{{ visits.length }}</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header"><span>Pendentes</span></div>
          <div class="card-number">{{ countByStatus('PENDING') }}</div>
        </div>
        <div class="card card-orange">
          <div class="card-header"><span>Em andamento</span></div>
          <div class="card-number">{{ countByStatus('ONGOING') }}</div>
        </div>
        <div class="card card-teal">
          <div class="card-header"><span>Finalizadas</span></div>
          <div class="card-number">{{ countByStatus('FINALIZED') }}</div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <span>Empreendimento</span>
          <span>Apartamento</span>
          <span>Título / Inspetor</span>
          <span>Status</span>
          <span>Data criação</span>
          <span>Finalizada em</span>
        </div>

        <div
          v-for="visit in filteredVisits"
          :key="visit.id"
          class="table-row"
          @click="openVisit(visit.id)"
        >
          <span class="row-building">{{ visit.apartment?.building?.name || '—' }}</span>
          <span class="row-apt">{{ visit.apartment?.identifier || '—' }}</span>
          <span class="row-title-container">
            <span class="row-title">{{ visit.title || '—' }}</span>
            <span class="row-inspector" v-if="visit.user?.name">
              Por: {{ visit.user.name }}
            </span>
          </span>
          <span :class="['row-badge', `badge-${visit.status.toLowerCase()}`]">
            {{ translateStatus(visit.status) }}
          </span>
          <span class="row-date">{{ formatDate(visit.createdAt) }}</span>
          <span class="row-date">{{ visit.finalizedAt ? formatDate(visit.finalizedAt) : '—' }}</span>
        </div>

        <div v-if="filteredVisits.length === 0" class="empty">
          Nenhuma vistoria corresponde aos filtros aplicados.
        </div>
      </div>

    </div>

    <div v-if="loadingVisit" class="modal-loading-overlay">
      <div class="modal-loading-box">Carregando vistoria...</div>
    </div>
    <VisitModal v-if="selectedVisit" :visit="selectedVisit" @fechar="selectedVisit = null" />

  </MainLayout>
</template>

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

<style scoped>
.filters-panel { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 24px; }
.search-box { margin-bottom: 16px; }
.search-input { width: 100%; padding: 12px 20px; border: 1px solid #ddd; border-radius: 30px; font-size: 0.92rem; outline: none; box-sizing: border-box; }
.filter-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.control-group { display: flex; flex-direction: column; gap: 6px; }
.control-group label { font-size: 0.78rem; font-weight: 600; color: #666; text-transform: uppercase; }
.control-group select, .control-group input[type="date"] { padding: 10px 14px; border-radius: 8px; border: 1px solid #ddd; background: #f9f9f9; font-size: 0.88rem; color: #333; outline: none; }
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.card { border-radius: 12px; padding: 20px; background: #fff; border-left: 6px solid transparent; }
.card-dark { border-left-color: #1a1a2e; }
.card-yellow { border-left-color: #f5a623; }
.card-orange { border-left-color: #f99f56; }
.card-teal { border-left-color: #00e5cc; }
.card-header { font-size: 0.85rem; color: #555; margin-bottom: 8px; }
.card-number { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.table-card { background: #fff; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 2fr 1fr 2.5fr 1.2fr 1.2fr 1.2fr; padding: 14px 24px; background: #f5f5f5; font-size: 0.8rem; color: #555; font-weight: 600; border-bottom: 1px solid #eee; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 2.5fr 1.2fr 1.2fr 1.2fr; padding: 16px 24px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.15s; align-items: center; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #f9f9f9; }
.row-building { font-weight: 500; color: #1a1a2e; }
.row-apt { font-weight: bold; color: #00e5cc; }
.row-title-container { display: flex; flex-direction: column; }
.row-title { color: #333; font-weight: 500; }
.row-inspector { font-size: 0.75rem; color: #777; margin-top: 2px; }
.row-date { color: #888; font-size: 0.82rem; }
.row-badge { display: inline-flex; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: bold; width: fit-content; }
.badge-pending { background: #fff3e0; color: #f99f56; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }
.empty { text-align: center; padding: 40px; color: #aaa; font-size: 0.9rem; }
.modal-loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-loading-box { background: #fff; padding: 20px 32px; border-radius: 10px; font-size: 0.9rem; color: #333; }
</style>
