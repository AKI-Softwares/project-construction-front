<template>
  <MainLayout titulo="Vistorias">

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'list' }]" @click="activeTab = 'list'">
        Vistorias
      </button>
      <button :class="['tab-btn', { active: activeTab === 'assign' }]" @click="activeTab = 'assign'">
        Abrir Vistoria
      </button>
    </div>
    <hr class="divider" />

    <!-- ===== TAB: LISTA DE VISTORIAS ===== -->
    <div v-if="activeTab === 'list'">

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
              <option value="NOT_STARTED">Não iniciadas</option>
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
            <div class="card-header"><span>Não iniciadas</span></div>
            <div class="card-number">{{ countByStatus('NOT_STARTED') }}</div>
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
    </div>

    <!-- ===== TAB: ABRIR VISTORIA (atribuir inspetor a um apartamento) ===== -->
    <div v-if="activeTab === 'assign'">

      <div class="assign-filters">
        <div class="control-group">
          <label>Empreendimento</label>
          <select v-model="assignBuildingId" @change="loadAssignApartments">
            <option value="">Selecione um empreendimento</option>
            <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="assignSuccess" class="alert success" style="margin-bottom:12px;">{{ assignSuccess }}</div>
      <div v-if="assignError" class="alert error" style="margin-bottom:12px;">{{ assignError }}</div>

      <div v-if="!assignBuildingId" class="state">
        Selecione um empreendimento para ver os apartamentos e atribuir vistoriadores.
      </div>

      <div v-else>
        <div class="apt-table-header">
          <span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span>
        </div>
        <div class="item-list">
          <div v-for="apt in assignApartments" :key="apt.id" class="apt-row">
            <span>{{ apt.identifier }}</span>
            <span>{{ apt.block || '—' }}</span>
            <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>

            <div class="apt-assign-inline">
              <span v-if="apartmentVisitInfo(apt).finalized" class="apt-status-badge finalized">
                <FontAwesomeIcon :icon="['fas', 'circle-check']" />
                Vistoria finalizada
              </span>
              <select
                v-else
                v-model="apt.currentInspectorId"
                :class="{ 'is-assigned': apt.currentInspectorId }"
                :disabled="!!apt.currentInspectorId"
                @change="assignInline(apt, apt.currentInspectorId)"
              >
                <option :value="undefined" v-if="!apt.currentInspectorId">+ Atribuir</option>
                <option v-for="u in inspectorCandidates" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
          <div v-if="assignApartments.length === 0 && !loadingAssignApts" class="empty">
            Nenhum apartamento cadastrado neste empreendimento.
          </div>
          <div v-if="loadingAssignApts" class="empty">Carregando...</div>
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
import { useRoute } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import VisitModal from '../../components/Layout/VisitModal.vue'
import { getVisits, getVisit, createVisit, assignInspectorToVisit } from '../../services/visits.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getUsers } from '../../services/users.js'
import { getRoles } from '../../services/roles.js'
import { filterUsersByPermission } from '../../utils/permissions.js'

const route = useRoute()

const selectedVisit = ref(null)
const loadingVisit = ref(false)
const loading = ref(true)
const error = ref('')
const visits = ref([])

// ─── Tab: lista de vistorias ──────────────────────────────────
const activeTab = ref(route.query.tab === 'assign' ? 'assign' : 'list')

const search = ref('')
const activeFilter = ref('ALL')
const selectedBuilding = ref('ALL')
const selectedInspector = ref('ALL')
const dateFrom = ref('')
const dateTo = ref('')

const uniqueBuildings = computed(() => {
  const names = visits.value.map(v => v.apartment?.building?.name).filter(Boolean)
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
      const buildingName = v.apartment?.building?.name || ''
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
  const map = {
    NOT_STARTED: 'Não Iniciada',
    ONGOING: 'Em andamento',
    FINALIZED: 'Finalizada',
  }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

async function openVisit(id) {
  loadingVisit.value = true
  try {
    const raw = await getVisit(id)
    if (raw.checklist) {
      raw.items = raw.checklist.items || []
    } else {
      raw.items = raw.items || []
    }
    selectedVisit.value = raw
  } catch (e) {
    console.error('Erro ao carregar vistoria:', e)
  } finally {
    loadingVisit.value = false
  }
}

async function reloadVisits() {
  try {
    visits.value = await getVisits()
  } catch (e) {
    console.error('Erro ao recarregar vistorias:', e)
  }
}

// ─── Tab: abrir vistoria (atribuição de inspetor) ─────────────
// Movido de Buildings/index.vue: a atribuição de inspetor pertence ao
// domínio de Vistorias, não de Empreendimentos. Buildings continua
// mostrando os apartamentos (visão/edição), mas sem a ação de atribuir.
const buildings = ref([])
const users = ref([])
const roles = ref([])
const assignBuildingId = ref(route.query.buildingId ? Number(route.query.buildingId) : '')
const assignApartments = ref([])
const loadingAssignApts = ref(false)
const assignSuccess = ref('')
const assignError = ref('')

const inspectorCandidates = computed(() =>
  filterUsersByPermission(users.value, roles.value, 'visits:perform')
)

// GET /visits não retorna apartmentId — cruza por (buildingId, identifier),
// que é único no back. Reaproveita a lista já carregada em `visits`.
function lookupVisitInfo(apt) {
  const visitsForApt = visits.value.filter(
    (v) => v.apartment?.building?.id === assignBuildingId.value
      && v.apartment?.identifier === apt.identifier
  )
  const activeVisit = visitsForApt.find((v) => v.status === 'NOT_STARTED' || v.status === 'ONGOING')
  const finalized = !activeVisit && visitsForApt.some((v) => v.status === 'FINALIZED')
  return {
    activeInspectorId: activeVisit?.inspectorId || null,
    finalized,
  }
}

function apartmentVisitInfo(apt) {
  return lookupVisitInfo(apt)
}

async function loadAssignApartments() {
  assignSuccess.value = ''
  assignError.value = ''
  if (!assignBuildingId.value) {
    assignApartments.value = []
    return
  }
  loadingAssignApts.value = true
  try {
    const apts = await getApartments(assignBuildingId.value)
    assignApartments.value = (apts || []).map((apt) => {
      const info = lookupVisitInfo(apt)
      return { ...apt, currentInspectorId: info.activeInspectorId || null }
    })
  } catch (e) {
    assignError.value = 'Erro ao carregar apartamentos deste empreendimento.'
  } finally {
    loadingAssignApts.value = false
  }
}

async function assignInline(apt, userId) {
  if (!userId) return
  assignSuccess.value = ''
  assignError.value = ''
  try {
    const checklist = await getChecklistByApartment(apt.id)
    if (checklist?.status === 'FINALIZED') {
      assignError.value = 'Este apartamento já está com o ciclo de vistorias finalizado.'
      return
    }
    const activeVisit = checklist?.visits?.find(
      (v) => v.status === 'NOT_STARTED' || v.status === 'ONGOING'
    )
    if (activeVisit) {
      apt.currentInspectorId = activeVisit.inspector?.id || apt.currentInspectorId
      assignError.value = activeVisit.inspector
        ? `Já existe uma vistoria em andamento para este apartamento, atribuída a ${activeVisit.inspector.name}.`
        : 'Já existe uma vistoria em andamento para este apartamento.'
      return
    }
    // POST /checklists/:id/visits não aceita mais inspectorId — o back
    // atribui automaticamente (round-robin). Para respeitar a escolha do
    // usuário no dropdown, criamos a vistoria e sobrescrevemos o inspetor
    // via PATCH /visits/:id/inspector.
    const visit = await createVisit(checklist.id)
    await assignInspectorToVisit(visit.id, userId)
    apt.currentInspectorId = Number(userId)
    assignSuccess.value = 'Vistoriador atribuído com sucesso!'
    setTimeout(() => { assignSuccess.value = '' }, 3000)
    await reloadVisits() // mantém a lista/contadores da aba "Vistorias" em dia
  } catch (e) {
    const status = e.response?.status
    if (status === 422) {
      assignError.value = 'Este usuário não possui a permissão para realizar vistorias.'
    } else if (status === 409) {
      assignError.value = e.response?.data?.message?.includes('finaliz')
        ? 'Este checklist já foi finalizado.'
        : 'Já existe uma vistoria em andamento para este apartamento. Atualize a página.'
    } else if (status === 400) {
      assignError.value = 'Esta vistoria já está finalizada e não pode ser reatribuída.'
    } else {
      assignError.value = 'Erro ao atribuir vistoriador.'
    }
  }
}

onMounted(async () => {
  try {
    const [v, b, u, r] = await Promise.all([getVisits(), getBuildings(), getUsers(), getRoles()])
    visits.value = v
    buildings.value = b
    users.value = u
    roles.value = r
    if (assignBuildingId.value) await loadAssignApartments()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar vistorias.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tabs { display: flex; gap: 8px; margin-bottom: 8px; }
.tab-btn { padding: 10px 20px; border: none; background: transparent; color: #888; font-size: 0.92rem; font-weight: 600; cursor: pointer; border-radius: 8px 8px 0 0; }
.tab-btn.active { color: #00897b; border-bottom: 3px solid #00e5cc; }
.divider { border: none; border-top: 1px solid #eee; margin: 0 0 24px; }

.filters-panel {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-size: 0.92rem;
  outline: none;
  box-sizing: border-box;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.control-group select,
.control-group input[type="date"] {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 0.88rem;
  color: #333;
  outline: none;
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
  grid-template-columns: 2fr 1fr 2.5fr 1.2fr 1.2fr 1.2fr;
  padding: 14px 24px;
  background: #f5f5f5;
  font-size: 0.8rem;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2.5fr 1.2fr 1.2fr 1.2fr;
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
.row-title-container { display: flex; flex-direction: column; }
.row-title { color: #333; font-weight: 500; }
.row-inspector { font-size: 0.75rem; color: #777; margin-top: 2px; }
.row-date { color: #888; font-size: 0.82rem; }

.row-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: bold;
  width: fit-content;
}

.badge-not_started { background: #fff3e0; color: #b8860b; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }

.empty {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 0.9rem;
}

.modal-loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-loading-box { background: #fff; padding: 20px 32px; border-radius: 10px; font-size: 0.9rem; color: #333; }

/* ─── Aba "Abrir Vistoria" ─── */
.assign-filters { display: flex; gap: 16px; margin-bottom: 20px; }
.assign-filters select { padding: 10px 14px; border-radius: 8px; border: 1px solid #ddd; background: #f9f9f9; font-size: 0.88rem; color: #333; outline: none; min-width: 260px; }

.alert { padding: 12px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00695c; border: 1px solid #00e5cc; }
.alert.error { background: #fdecea; color: #c0392b; border: 1px solid #f5b7b1; }

.apt-table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  padding: 10px 24px;
  font-size: 0.8rem;
  color: #888;
  font-weight: 700;
}

.apt-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px 24px;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 8px;
  align-items: center;
}

.apt-assign-inline select {
  width: 100%;
  max-width: 200px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
  outline: none;
}
.apt-assign-inline select.is-assigned { background: #00e5cc; border: 1px solid #00e5cc; color: #0d0d2b; font-weight: bold; }
.apt-assign-inline select:disabled { opacity: 1; cursor: default; }
.apt-status-badge.finalized { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; background: #e0faf6; color: #00897b; font-size: 0.82rem; font-weight: 600; white-space: nowrap; }
</style>
