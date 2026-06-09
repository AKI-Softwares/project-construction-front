<template>
  <MainLayout titulo="Empreendimentos">
    <div v-if="loading" class="state">Loading...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else>
      <div class="cards">
        <div class="card card-dark">
          <div class="card-header"><span>Total de Apartamentos</span><span>⊞</span></div>
          <div class="card-number">{{ summary.total }}</div>
          <div class="card-sub">{{ totalBlocks }} blocos</div>
        </div>
        <div class="card card-orange">
          <div class="card-header"><span>Pendências</span><span>!</span></div>
          <div class="card-number">{{ summary.pending }}</div>
          <div class="card-sub">Atenção necessária</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header"><span>Aguardando</span><span>🕐</span></div>
          <div class="card-number">{{ summary.waiting }}</div>
          <div class="card-sub">apartamentos</div>
        </div>
        <div class="card card-teal">
          <div class="card-header"><span>Aprovados</span><span>✓</span></div>
          <div class="card-number">{{ summary.approved }}</div>
          <div class="card-sub">{{ summary.approvedPct }}% do total</div>
        </div>
      </div>

      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="apartments-grid">
        <div
          v-for="apt in filteredApartments"
          :key="apt.id"
          :class="['apt-card', `apt-${getApartmentStatus(mockChecklists[apt.id])}`]"
          @click="openModal(apt)"
          style="cursor: pointer"
        >
          <div class="apt-header">
            <div class="apt-id">
              <span>⊞</span>
              <strong>{{ apt.identifier }}</strong>
            </div>
            <span :class="['apt-badge', `badge-${getApartmentStatus(mockChecklists[apt.id])}`]">
              {{ translateStatus(getApartmentStatus(mockChecklists[apt.id])) }}
            </span>
          </div>
          <div class="apt-info">
            <span>Bloco {{ apt.block }} • {{ apt.floor }}º andar • {{ apt.area }}m²</span>
            <span>Inspeção: {{ formatDate(apt.inspectionDate) }}</span>
          </div>
          <div class="apt-checklist">
            <span>CHECKLIST</span>
            <span>{{ getProgress(mockChecklists[apt.id]) }}%</span>
          </div>
          <div class="apt-bar">
            <div class="apt-bar-segment seg-approved" :style="{ width: getApprovedPct(mockChecklists[apt.id]) + '%' }"></div>
            <div class="apt-bar-segment seg-pending" :style="{ width: getPendingPct(mockChecklists[apt.id]) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <ChecklistModal
      v-if="modalOpen && activeChecklist"
      :checklist="activeChecklist"
      @close="closeModal"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuilding } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { mockChecklists } from '../../mocks/buildings.js'
import { getApartmentStatus, getProgress, getApprovedPct, getPendingPct, getApartmentsSummary } from '../../utils/checklist.js'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const building = ref(null)
const apartments = ref([])
const activeFilter = ref('ALL')

const filters = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Aguardando', value: 'waiting' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Pendências', value: 'pending' },
]

const summary = computed(() => getApartmentsSummary(apartments.value, mockChecklists))

const totalBlocks = computed(() => {
  const blocks = new Set(apartments.value.map(a => a.block).filter(Boolean))
  return blocks.size
})

const filteredApartments = computed(() => {
  if (activeFilter.value === 'ALL') return apartments.value
  return apartments.value.filter(apt =>
    getApartmentStatus(mockChecklists[apt.id]) === activeFilter.value
  )
})

const modalOpen = ref(false)
const activeChecklist = ref(null)

function openModal(apt) {
  activeChecklist.value = mockChecklists[apt.id]
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  activeChecklist.value = null
}

function translateStatus(status) {
  const map = { pending: 'Pendências', waiting: 'Aguardando', approved: 'Aprovado' }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  try {
    const buildingId = route.params.id
    const [buildingData, apartmentsData] = await Promise.all([
      getBuilding(buildingId),
      getApartments(buildingId)
    ])
    building.value = buildingData
    apartments.value = apartmentsData
  } catch (e) {
    error.value = 'Error loading building data.'
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
.card-header { display: flex; justify-content: space-between; font-size: 0.85rem; color: #555; margin-bottom: 8px; }
.card-number { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.8rem; color: #888; margin-top: 4px; }
.filters { display: flex; gap: 12px; margin-bottom: 24px; }
.filter-btn { padding: 8px 20px; border-radius: 20px; border: none; background: #1a1a2e; color: #fff; cursor: pointer; font-size: 0.9rem; }
.filter-btn.active { background: #00e5cc; color: #1a1a2e; font-weight: bold; }
.apartments-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.apt-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #eee; transition: background 0.2s; }
.apt-pending { background: #f99f56; color: #fff; }
.apt-pending .apt-info, .apt-pending .apt-checklist { color: #fff; }
.apt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.apt-id { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; }
.apt-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.badge-approved { background: #00e5cc; color: #1a1a2e; }
.badge-waiting { background: #f5a623; color: #fff; }
.badge-pending { background: #fff; color: #f99f56; }
.apt-info { display: flex; flex-direction: column; font-size: 0.82rem; color: #666; gap: 2px; margin-bottom: 16px; }
.apt-checklist { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; margin-bottom: 6px; }
.apt-bar { height: 6px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; display: flex; }
.apt-bar-segment { height: 100%; transition: width 0.3s; }
.seg-approved { background: #00e5cc; }
.seg-pending { background: #c0392b; }
</style>