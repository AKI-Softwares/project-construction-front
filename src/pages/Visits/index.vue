
<template>
  <MainLayout titulo="Vistorias">

    <!-- Filtros -->
    <div class="filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="['filter-btn', { active: activeFilter === filter.value }]"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>

      <input
        v-model="search"
        type="text"
        placeholder="Buscar por apartamento ou empreendimento..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="state">Carregando vistorias...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Resumo -->
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

      <!-- Tabela -->
      <div class="table-card">
        <div class="table-header">
          <span>Empreendimento</span>
          <span>Apartamento</span>
          <span>Título</span>
          <span>Status</span>
          <span>Data criação</span>
          <span>Finalizada em</span>
        </div>

        <div
          v-for="visit in filteredVisits"
          :key="visit.id"
          class="table-row"
          @click="goToDetail(visit.id)"
        >
          <span class="row-building">{{ visit.apartment?.building?.name || '—' }}</span>
          <span class="row-apt">{{ visit.apartment?.identifier || '—' }}</span>
          <span class="row-title">{{ visit.title || '—' }}</span>
          <span :class="['row-badge', `badge-${visit.status.toLowerCase()}`]">
            {{ translateStatus(visit.status) }}
          </span>
          <span class="row-date">{{ formatDate(visit.createdAt) }}</span>
          <span class="row-date">{{ visit.finalizedAt ? formatDate(visit.finalizedAt) : '—' }}</span>
        </div>

        <div v-if="filteredVisits.length === 0" class="empty">
          Nenhuma vistoria encontrada.
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getVisits } from '../../services/visits.js'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const visits = ref([])
const activeFilter = ref('ALL')
const search = ref('')

const filters = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Em andamento', value: 'ONGOING' },
  { label: 'Finalizadas', value: 'FINALIZED' },
]

const filteredVisits = computed(() => {
  let result = visits.value

  if (activeFilter.value !== 'ALL') {
    result = result.filter(v => v.status === activeFilter.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(v =>
      v.apartment?.identifier?.toLowerCase().includes(q) ||
      v.apartment?.building?.name?.toLowerCase().includes(q) ||
      v.title?.toLowerCase().includes(q)
    )
  }

  return result
})

function countByStatus(status) {
  return visits.value.filter(v => v.status === status).length
}

function translateStatus(status) {
  const map = {
    PENDING: 'Pendente',
    ONGOING: 'Em andamento',
    FINALIZED: 'Finalizada',
  }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

function goToDetail(id) {
  router.push(`/visits/${id}`)
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
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: #1a1a2e;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.filter-btn.active {
  background: #00e5cc;
  color: #1a1a2e;
  font-weight: bold;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  background: #fff;
  font-size: 0.9rem;
  outline: none;
  border: 1px solid #eee;
}

.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  border-left: 6px solid transparent;
}
.card-dark { border-left-color: #1a1a2e; }
.card-yellow { border-left-color: #f5a623; }
.card-orange { border-left-color: #f99f56; }
.card-teal { border-left-color: #00e5cc; }

.card-header {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}

.card-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a1a2e;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1.2fr 1.2fr 1.2fr;
  padding: 14px 24px;
  background: #f5f5f5;
  font-size: 0.8rem;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1.2fr 1.2fr 1.2fr;
  padding: 16px 24px;
  font-size: 0.88rem;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
  align-items: center;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #f9f9f9; }

.row-building { font-weight: 500; color: #1a1a2e; }
.row-apt { font-weight: bold; color: #00e5cc; }
.row-title { color: #555; }
.row-date { color: #888; font-size: 0.82rem; }

.row-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: bold;
  width: fit-content;
}

.badge-pending { background: #fff3e0; color: #f99f56; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }

.empty {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 0.9rem;
}
</style>
