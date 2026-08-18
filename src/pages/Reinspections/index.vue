<template>
  <MainLayout titulo="Re-inspeções">

    <div class="filters-row no-print">
      <div class="control-group">
        <label>Empreendimento</label>
        <select v-model="selectedBuildingId" @change="loadReinspections">
          <option value="">Todos</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>Status</label>
        <select v-model="selectedStatus" @change="loadReinspections">
          <option value="">Todos</option>
          <option value="NOT_STARTED">Não Iniciada</option>
          <option value="ONGOING">Em andamento</option>
          <option value="FINALIZED">Finalizada</option>
        </select>
      </div>

      <div class="control-group">
        <label>Inspetor</label>
        <select v-model="selectedInspectorId" @change="loadReinspections">
          <option value="">Todos</option>
          <option v-for="u in inspectorCandidates" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>De</label>
        <input type="date" v-model="dateFrom" @change="loadReinspections" />
      </div>

      <div class="control-group">
        <label>Até</label>
        <input type="date" v-model="dateTo" @change="loadReinspections" />
      </div>
    </div>

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>
    <div v-if="assignError" class="state error">{{ assignError }}</div>

    <div v-if="!loading && !loadError">
      <div class="table-header">
        <span>Empreendimento</span>
        <span>Apartamento</span>
        <span>Bloco / Andar</span>
        <span>Status</span>
        <span>Agendada para</span>
        <span>Criada em</span>
        <span>Inspetor</span>
      </div>

      <div v-for="visit in reinspections" :key="visit.id" class="table-row">
        <span class="building-name">{{ visit.apartment?.building?.name || '—' }}</span>
        <span>{{ visit.apartment?.identifier || '—' }}</span>
        <span>{{ formatBlockFloor(visit.apartment) }}</span>
        <span>
          <span :class="['row-badge', `badge-${visit.status?.toLowerCase()}`]">
            {{ translateStatus(visit.status) }}
          </span>
        </span>
        <span>
          <span v-if="visit.scheduledFor" :class="{ 'overdue': isOverdue(visit) }">
            {{ formatDate(visit.scheduledFor) }}
            <span v-if="isOverdue(visit)" class="overdue-tag">Atrasada</span>
          </span>
          <span v-else class="no-date">Sem data definida</span>
        </span>
        <span class="created-at">{{ formatDate(visit.createdAt) }}</span>

        <div class="reassign-inline">
          <select
            :value="visit.inspectorId || ''"
            :disabled="visit.status === 'FINALIZED'"
            :title="visit.status === 'FINALIZED' ? 'Vistoria finalizada — inspetor não pode mais ser trocado' : ''"
            @change="assignReinspection(visit, $event.target.value)"
          >
            <option value="">Selecionar...</option>
            <option v-for="u in inspectorCandidates" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="reinspections.length === 0" class="state">
        Nenhuma re-inspeção encontrada para os filtros selecionados.
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getReinspections, assignInspectorToVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { getRoles } from '../../services/roles.js'
import { getBuildings } from '../../services/buildings.js'
import { filterUsersByPermission } from '../../utils/permissions.js'

const reinspections = ref([])
const users = ref([])
const roles = ref([])
const buildings = ref([])

const loading = ref(true)
const loadError = ref('')
const assignError = ref('')

const selectedBuildingId = ref('')
const selectedStatus = ref('')
const selectedInspectorId = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Só usuários cujo cargo tem a permissão 'visits:perform' podem ser
// designados como inspetor (mesma regra validada pelo back no PATCH).
const inspectorCandidates = computed(() =>
  filterUsersByPermission(users.value, roles.value, 'visits:perform')
)

function translateStatus(status) {
  const map = { NOT_STARTED: 'Não Iniciada', ONGOING: 'Em andamento', FINALIZED: 'Finalizada' }
  return map[status] || status
}

function formatBlockFloor(apt) {
  if (!apt) return '—'
  const parts = []
  if (apt.block) parts.push(`Bloco ${apt.block}`)
  if (apt.floor) parts.push(`${apt.floor}º andar`)
  return parts.length ? parts.join(' · ') : '—'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function isOverdue(visit) {
  if (!visit.scheduledFor || visit.status === 'FINALIZED') return false
  return new Date(visit.scheduledFor) < new Date()
}

function buildFilters() {
  const filters = {}
  if (selectedBuildingId.value) filters.buildingId = Number(selectedBuildingId.value)
  if (selectedStatus.value) filters.status = selectedStatus.value
  if (selectedInspectorId.value) filters.inspectorId = Number(selectedInspectorId.value)
  if (dateFrom.value) filters.from = dateFrom.value
  if (dateTo.value) filters.to = dateTo.value
  return filters
}

async function loadReinspections() {
  loading.value = true
  loadError.value = ''
  try {
    reinspections.value = await getReinspections(buildFilters())
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao carregar re-inspeções.'
  } finally {
    loading.value = false
  }
}

async function assignReinspection(visit, userId) {
  if (!userId) return
  if (visit.status === 'FINALIZED') return
  assignError.value = ''
  try {
    await assignInspectorToVisit(visit.id, Number(userId))
    visit.inspectorId = Number(userId)
  } catch (e) {
    const status = e.response?.status
    if (status === 422) {
      assignError.value = 'Este usuário não possui a permissão para realizar vistorias.'
    } else if (status === 400) {
      assignError.value = 'Esta vistoria já está finalizada e não pode ser reatribuída.'
    } else {
      assignError.value = e.response?.data?.message || 'Erro ao atribuir inspetor.'
    }
    console.error('Erro ao atribuir inspetor:', e)
  }
}

onMounted(async () => {
  try {
    const [reinsps, listaUsers, listaRoles, listaBuildings] = await Promise.all([
      getReinspections(),
      getUsers(),
      getRoles(),
      getBuildings(),
    ])
    reinspections.value = reinsps
    users.value = listaUsers
    roles.value = listaRoles
    buildings.value = listaBuildings
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao carregar dados de re-inspeção.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.filters-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.control-group { display: flex; flex-direction: column; gap: 6px; }
.control-group label { font-size: 0.78rem; font-weight: 600; color: #666; text-transform: uppercase; }
.control-group select,
.control-group input[type="date"] { padding: 10px 14px; border-radius: 8px; border: 1px solid #ddd; background: #f9f9f9; font-size: 0.88rem; color: #333; outline: none; min-width: 160px; }

.state { text-align: center; padding: 40px; color: #888; }
.error { color: red; }
.table-header { display: grid; grid-template-columns: 1.8fr 1fr 1.3fr 1.1fr 1.4fr 1.1fr 1.6fr; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 2px solid #eee; margin-bottom: 4px; }
.table-row { display: grid; grid-template-columns: 1.8fr 1fr 1.3fr 1.1fr 1.4fr 1.1fr 1.6fr; padding: 14px 20px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; background: #fff; border-radius: 8px; margin-bottom: 4px; }
.building-name { font-weight: 600; color: #1a1a2e; }
.created-at { color: #888; font-size: 0.82rem; }
.no-date { color: #bbb; font-style: italic; }
.overdue { color: #c0392b; font-weight: 600; }
.overdue-tag { background: #fff3f0; color: #c0392b; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; margin-left: 6px; font-weight: 700; }

.row-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; white-space: nowrap; }
.badge-not_started { background: #fff3e0; color: #b8860b; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }

.reassign-inline select {
  width: 100%;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  font-size: 0.82rem;
  color: #333;
  cursor: pointer;
  outline: none;
}
.reassign-inline select:disabled { background: #f0f0f0; color: #aaa; cursor: not-allowed; }
</style>
