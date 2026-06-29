<template>
  <MainLayout titulo="Empreendimentos">

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'buildings' }]" @click="activeTab = 'buildings'">
        Empreendimentos
      </button>
      <button :class="['tab-btn', { active: activeTab === 'apartments' }]" @click="activeTab = 'apartments'">
        Apartamentos
      </button>
    </div>

    <hr class="divider" />

    <!-- ===== TAB: EMPREENDIMENTOS ===== -->
    <div v-if="activeTab === 'buildings'">

      <div style="margin-bottom: 20px;">
        <button v-if="authStore.hasPermission('buildings:create')" class="btn-add" @click="showBuildingForm = !showBuildingForm">
          + Adicionar empreendimento
        </button>
      </div>

      <div v-if="showBuildingForm" class="form-card">
        <h3 class="form-title">Novo Empreendimento</h3>
        <div v-if="buildingSuccess" class="alert success">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Empreendimento cadastrado com sucesso!
        </div>
        <div v-if="buildingError" class="alert error">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ buildingError }}
        </div>
        <input v-model="buildingForm.name" type="text" placeholder="Nome do Empreendimento" :class="{ invalid: buildingErrors.name }" />
        <span v-if="buildingErrors.name" class="field-error">{{ buildingErrors.name }}</span>
        <input v-model="buildingForm.address" type="text" placeholder="Endereço" :class="{ invalid: buildingErrors.address }" />
        <span v-if="buildingErrors.address" class="field-error">{{ buildingErrors.address }}</span>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingBuilding" @click="saveBuilding">
            {{ savingBuilding ? 'Salvando...' : 'Salvar' }}
          </button>
          <button class="btn-cancel" @click="cancelBuilding">Cancelar</button>
        </div>
      </div>

      <div class="item-list">
        <div v-for="building in buildings" :key="building.id" class="item-card" @click="router.push(`/buildings/${building.id}`)">
          <div class="building-card-info">
            <span class="building-card-name">{{ building.name }}</span>
            <span class="building-card-count">
              {{ apartments.filter(a => a.buildingId === building.id).length }} apartamento(s)
            </span>
          </div>
          <div class="building-card-right">
            <button class="btn-card-delete" title="Excluir empreendimento" @click.stop="confirmDeleteBuilding(building)">
              <FontAwesomeIcon :icon="['fas', 'trash']" />
            </button>
            <span class="building-card-arrow">→</span>
          </div>
        </div>
        <div v-if="buildings.length === 0 && !loadingBuildings" class="empty">Nenhum empreendimento cadastrado.</div>
        <div v-if="loadingBuildings" class="empty">Carregando...</div>
      </div>

    </div>

    <!-- ===== TAB: APARTAMENTOS ===== -->
    <div v-if="activeTab === 'apartments'">

      <div class="apt-actions">
        <button v-if="authStore.hasPermission('apartments:create')" :class="['btn-add', { active: aptMode === 'single' }]" @click="aptMode = aptMode === 'single' ? null : 'single'">
          + Adicionar Apartamento individual
        </button>
        <button v-if="authStore.hasPermission('apartments:create')" :class="['btn-batch', { active: aptMode === 'batch' }]" @click="aptMode = aptMode === 'batch' ? null : 'batch'">
          Cadastro em Lote
        </button>
      </div>

      <div v-if="aptMode === 'single'" class="form-card">
        <h3 class="form-title">Novo Apartamento</h3>
        <div v-if="aptSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Apartamento cadastrado com sucesso!</div>
        <div v-if="aptError" class="alert error">{{ aptError }}</div>
        <select v-model="singleApt.buildingId" :class="{ invalid: aptErrors.buildingId }">
          <option value="" disabled>Selecionar Empreendimento</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <span v-if="aptErrors.buildingId" class="field-error">{{ aptErrors.buildingId }}</span>
        <select v-model="singleApt.apartmentTypeId" :class="{ invalid: aptErrors.apartmentTypeId }">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <span v-if="aptErrors.apartmentTypeId" class="field-error">{{ aptErrors.apartmentTypeId }}</span>
        <div class="form-row">
          <div class="form-col">
            <input v-model="singleApt.identifier" type="text" placeholder="Número (ex: 101)" :class="{ invalid: aptErrors.identifier }" />
            <span v-if="aptErrors.identifier" class="field-error">{{ aptErrors.identifier }}</span>
          </div>
          <div class="form-col">
            <input v-model="singleApt.floor" type="number" placeholder="Andar" min="1" />
          </div>
          <div class="form-col">
            <input v-model="singleApt.block" type="text" placeholder="Bloco (ex: A)" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingApt" @click="saveSingleApt">{{ savingApt ? 'Salvando...' : 'Salvar' }}</button>
          <button class="btn-cancel" @click="aptMode = null">Voltar</button>
        </div>
      </div>

      <div v-if="aptMode === 'batch'" class="form-card">
        <h3 class="form-title">Cadastrar em Lote - Gerar múltiplos apartamentos</h3>
        <div class="info-box">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="info-icon" />
          <div>
            <strong>Como funciona:</strong>
            <ul>
              <li>Bloco B, 4 andares, 3 apts/andar → Gera B101, B102, B103, B201...</li>
              <li>Formato: BlocoAndarNúmero (ex: B101 = Bloco B, 1º andar, apt 01)</li>
            </ul>
          </div>
        </div>
        <div v-if="batchSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> {{ batchSuccess }}</div>
        <div v-if="batchError" class="alert error">{{ batchError }}</div>
        <select v-model="batchForm.buildingId" :class="{ invalid: batchErrors.buildingId }">
          <option value="" disabled>Selecionar Empreendimento</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <span v-if="batchErrors.buildingId" class="field-error">{{ batchErrors.buildingId }}</span>
        <select v-model="batchForm.apartmentTypeId" :class="{ invalid: batchErrors.apartmentTypeId }">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <span v-if="batchErrors.apartmentTypeId" class="field-error">{{ batchErrors.apartmentTypeId }}</span>
        <div class="form-row">
          <div class="form-col">
            <input v-model="batchForm.block" type="text" placeholder="Ex: Bloco B" :class="{ invalid: batchErrors.block }" />
            <span v-if="batchErrors.block" class="field-error">{{ batchErrors.block }}</span>
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.floors" type="number" placeholder="Qtd de andares" min="1" :class="{ invalid: batchErrors.floors }" />
            <span v-if="batchErrors.floors" class="field-error">{{ batchErrors.floors }}</span>
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.aptsPerFloor" type="number" placeholder="Apts por andar" min="1" :class="{ invalid: batchErrors.aptsPerFloor }" />
            <span v-if="batchErrors.aptsPerFloor" class="field-error">{{ batchErrors.aptsPerFloor }}</span>
          </div>
        </div>
        <div v-if="batchPreview.length > 0" class="preview">
          <strong>Preview ({{ batchPreview.length }} apartamentos):</strong>
          <div class="preview-list">
            <span v-for="id in batchPreview.slice(0, 20)" :key="id" class="preview-tag">{{ id }}</span>
            <span v-if="batchPreview.length > 20" class="preview-tag more">+{{ batchPreview.length - 20 }} mais</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingBatch" @click="saveBatch">
            {{ savingBatch ? `Salvando... (${batchProgress}/${batchPreview.length})` : 'Salvar' }}
          </button>
          <button class="btn-cancel" @click="aptMode = null">Voltar</button>
        </div>
      </div>

      <div v-if="!aptMode">

        <div v-if="selectedBuildingId" class="back-action-container">
          <button class="btn-back" @click="goBackToBuildings">← Voltar para Empreendimentos</button>
        </div>

        <div v-if="selectedBuildingId" class="building-header">
          <div class="building-header-top">
            <span class="building-title">
              <FontAwesomeIcon :icon="['fas', 'building']" />
              {{ buildings.find(b => b.id === selectedBuildingId)?.name }}
            </span>
          </div>
          <div class="building-header-info">
            <span><strong>Total de apts:</strong> {{ apartmentsFiltered.length }}</span>
            <span>
              <strong>Vistoriadores atuando:</strong>
              <span v-if="buildingInspectors.length > 0">{{ buildingInspectors.join(', ') }}</span>
              <span v-else class="text-muted">Nenhum</span>
            </span>
          </div>
        </div>

        <div v-if="assignSuccess" class="alert success" style="margin-bottom:12px;">{{ assignSuccess }}</div>
        <div v-if="assignError" class="alert error" style="margin-bottom:12px;">{{ assignError }}</div>

        <div class="apt-table-header">
          <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span><span></span>
        </div>

        <div class="item-list">
          <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
            <div class="apt-row-clickable-wrapper" @click="openChecklist(apt)">
              <span>{{ getBuildingName(apt.buildingId) }}</span>
              <span>{{ apt.identifier }}</span>
              <span>{{ apt.block || '—' }}</span>
              <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
            </div>

            <div class="apt-assign-inline">
              <select
                v-model="apt.currentInspectorId"
                :class="{ 'is-assigned': apt.currentInspectorId }"
                :disabled="!!apt.currentInspectorId"
                @change="assignInline(apt, apt.currentInspectorId)"
                @click.stop
              >
                <option :value="undefined" v-if="!apt.currentInspectorId">+ Atribuir</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>

            <div class="apt-delete-cell">
              <button class="btn-apt-delete" title="Remover apartamento" @click.stop="confirmDeleteApt(apt)">
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
          <div v-if="apartmentsFiltered.length === 0 && !loadingApts" class="empty">Nenhum apartamento cadastrado.</div>
          <div v-if="loadingApts" class="empty">Carregando...</div>
        </div>
      </div>

    </div>

    <!-- Modal: excluir empreendimento -->
    <div v-if="buildingToDelete" class="modal-overlay" @click.self="buildingToDelete = null">
      <div class="modal-confirm">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir empreendimento</h3>
        <p>Excluir <strong>{{ buildingToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingBuilding" @click="doDeleteBuilding">
            {{ deletingBuilding ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="buildingToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal: excluir apartamento -->
    <div v-if="aptToDelete" class="modal-overlay" @click.self="aptToDelete = null">
      <div class="modal-confirm">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Remover apartamento</h3>
        <p>Remover o apartamento <strong>{{ aptToDelete.identifier }}</strong> da lista? Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingApt" @click="doDeleteApt">
            {{ deletingApt ? 'Removendo...' : 'Sim, remover' }}
          </button>
          <button class="btn-cancel" @click="aptToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="loadingChecklist" class="checklist-overlay-state">Carregando checklist...</div>
    <div v-if="checklistError" class="checklist-overlay-state error">
      {{ checklistError }}
      <button class="btn-cancel" @click="checklistError = ''">Fechar</button>
    </div>

    <ChecklistModal v-if="selectedChecklist" :checklist="selectedChecklist" :available-users="users" @fechar="selectedChecklist = null" />

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { getBuildings, createBuilding, deleteBuilding } from '../../services/buildings.js'
import { getApartments, createApartment, deleteApartment } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { createVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const router = useRouter()
const authStore = useAuthStore()
const selectedChecklist = ref(null)
const loadingChecklist = ref(false)
const checklistError = ref('')
const users = ref([])

const assignSuccess = ref('')
const assignError = ref('')

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
    await createVisit(checklist.id, userId)
    apt.currentInspectorId = Number(userId)
    assignSuccess.value = 'Vistoriador atribuído com sucesso!'
    setTimeout(() => { assignSuccess.value = '' }, 3000)
  } catch (e) {
    assignError.value = 'Erro ao atribuir vistoriador.'
  }
}

async function openChecklist(apt) {
  checklistError.value = ''
  loadingChecklist.value = true
  try {
    let detail = await getChecklistByApartment(apt.id)
    if (!detail || !detail.rooms || detail.rooms.length === 0) {
      const tipoDoApt = apartmentTypes.value.find(t => t.id === apt.apartmentTypeId)
      if (tipoDoApt && tipoDoApt.rooms) {
        detail = {
          identifier: apt.identifier,
          block: apt.block || '—',
          rooms: tipoDoApt.rooms.map(room => ({ id: room.id, name: room.name, items: [] }))
        }
      } else {
        checklistError.value = 'Este apartamento está sem checklist no banco e não encontramos o Tipo dele.'
        return
      }
    }
    selectedChecklist.value = groupChecklistByRoom(detail)
  } catch (e) {
    checklistError.value = e.response?.data?.message || 'Erro ao carregar o checklist.'
  } finally {
    loadingChecklist.value = false
  }
}

const activeTab = ref('buildings')
const buildings = ref([])
const apartments = ref([])
const apartmentTypes = ref([])
const loadingBuildings = ref(false)
const loadingApts = ref(false)
const showBuildingForm = ref(false)
const savingBuilding = ref(false)
const buildingSuccess = ref(false)
const buildingError = ref('')
const buildingForm = reactive({ name: '', address: '' })
const buildingErrors = reactive({ name: '', address: '' })

function cancelBuilding() {
  showBuildingForm.value = false
  buildingForm.name = ''; buildingForm.address = ''
  buildingErrors.name = ''; buildingErrors.address = ''
  buildingSuccess.value = false; buildingError.value = ''
}

function validateBuilding() {
  buildingErrors.name = ''; buildingErrors.address = ''
  let valid = true
  if (!buildingForm.name || buildingForm.name.length < 2) { buildingErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; valid = false }
  if (!buildingForm.address) { buildingErrors.address = 'Endereço é obrigatório.'; valid = false }
  return valid
}

async function saveBuilding() {
  if (!validateBuilding()) return
  savingBuilding.value = true; buildingError.value = ''; buildingSuccess.value = false
  try {
    const created = await createBuilding({ name: buildingForm.name, address: buildingForm.address })
    buildings.value.push(created)
    buildingSuccess.value = true
    buildingForm.name = ''; buildingForm.address = ''
  } catch (e) {
    buildingError.value = e.response?.data?.message || 'Erro ao cadastrar empreendimento.'
  } finally {
    savingBuilding.value = false
  }
}

// ─── Excluir empreendimento ───────────────────────────────────
const buildingToDelete = ref(null)
const deletingBuilding = ref(false)

function confirmDeleteBuilding(building) { buildingToDelete.value = building }

async function doDeleteBuilding() {
  if (!buildingToDelete.value) return
  deletingBuilding.value = true
  try {
    await deleteBuilding(buildingToDelete.value.id)
  } catch (e) {
    // Se a API falhar, oculta localmente mesmo assim
    console.error('Erro ao excluir empreendimento na API:', e)
  } finally {
    // Sempre remove da lista local — oculta independente do resultado da API
    buildings.value = buildings.value.filter(b => b.id !== buildingToDelete.value.id)
    apartments.value = apartments.value.filter(a => a.buildingId !== buildingToDelete.value.id)
    if (selectedBuildingId.value === buildingToDelete.value.id) selectedBuildingId.value = null
    buildingToDelete.value = null
    deletingBuilding.value = false
  }
}

// ─── Excluir apartamento ──────────────────────────────────────
const aptToDelete = ref(null)
const deletingApt = ref(false)

function confirmDeleteApt(apt) { aptToDelete.value = apt }

async function doDeleteApt() {
  if (!aptToDelete.value) return
  deletingApt.value = true
  try {
    await deleteApartment(aptToDelete.value.id)
  } catch (e) {
    // Se a API falhar (ex: tem checklist vinculado), oculta localmente mesmo assim
    console.error('Erro ao excluir apartamento na API:', e)
  } finally {
    // Sempre remove da lista local
    apartments.value = apartments.value.filter(a => a.id !== aptToDelete.value.id)
    aptToDelete.value = null
    deletingApt.value = false
  }
}

const selectedBuildingId = ref(null)

const apartmentsFiltered = computed(() =>
  selectedBuildingId.value
    ? apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
    : apartments.value
)

const buildingInspectors = computed(() => {
  if (!selectedBuildingId.value) return []
  const inspectorIds = new Set(
    apartmentsFiltered.value.filter(a => a.currentInspectorId).map(a => a.currentInspectorId)
  )
  return Array.from(inspectorIds).map(id => {
    const u = users.value.find(user => user.id === id)
    return u ? u.name : 'Desconhecido'
  })
})

function goBackToBuildings() {
  selectedBuildingId.value = null
  activeTab.value = 'buildings'
}

const aptMode = ref(null)
const savingApt = ref(false)
const aptSuccess = ref(false)
const aptError = ref('')
const singleApt = reactive({ buildingId: '', apartmentTypeId: '', identifier: '', floor: '', block: '' })
const aptErrors = reactive({ buildingId: '', apartmentTypeId: '', identifier: '' })

function validateSingleApt() {
  aptErrors.buildingId = ''; aptErrors.apartmentTypeId = ''; aptErrors.identifier = ''
  let valid = true
  if (!singleApt.buildingId) { aptErrors.buildingId = 'Selecione um empreendimento.'; valid = false }
  if (!singleApt.apartmentTypeId) { aptErrors.apartmentTypeId = 'Selecione um tipo.'; valid = false }
  if (!singleApt.identifier) { aptErrors.identifier = 'Número é obrigatório.'; valid = false }
  return valid
}

async function saveSingleApt() {
  if (!validateSingleApt()) return
  savingApt.value = true; aptError.value = ''; aptSuccess.value = false
  try {
    const created = await createApartment({
      buildingId: Number(singleApt.buildingId),
      apartmentTypeId: Number(singleApt.apartmentTypeId),
      identifier: singleApt.identifier,
      floor: singleApt.floor ? Number(singleApt.floor) : undefined,
      block: singleApt.block || undefined,
    })
    apartments.value.push(created)
    aptSuccess.value = true
    singleApt.identifier = ''; singleApt.floor = ''; singleApt.block = ''
  } catch (e) {
    if (e.response?.status === 409) aptError.value = 'Número de apartamento já existe.'
    else aptError.value = e.response?.data?.message || 'Erro ao cadastrar.'
  } finally {
    savingApt.value = false
  }
}

const savingBatch = ref(false)
const batchProgress = ref(0)
const batchSuccess = ref('')
const batchError = ref('')
const batchForm = reactive({ buildingId: '', apartmentTypeId: '', block: '', floors: '', aptsPerFloor: '' })
const batchErrors = reactive({ buildingId: '', apartmentTypeId: '', block: '', floors: '', aptsPerFloor: '' })

const batchPreview = computed(() => {
  if (!batchForm.block || !batchForm.floors || !batchForm.aptsPerFloor) return []
  const block = batchForm.block.replace('Bloco ', '').trim()
  const floors = Number(batchForm.floors)
  const aptsPerFloor = Number(batchForm.aptsPerFloor)
  if (!floors || !aptsPerFloor || floors < 1 || aptsPerFloor < 1) return []
  const identifiers = []
  for (let floor = 1; floor <= floors; floor++) {
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      identifiers.push(`${block}${floor}${String(apt).padStart(2, '0')}`)
    }
  }
  return identifiers
})

function validateBatch() {
  Object.keys(batchErrors).forEach(k => batchErrors[k] = '')
  let valid = true
  if (!batchForm.buildingId) { batchErrors.buildingId = 'Selecione.'; valid = false }
  if (!batchForm.apartmentTypeId) { batchErrors.apartmentTypeId = 'Selecione.'; valid = false }
  if (!batchForm.block) { batchErrors.block = 'Obrigatório.'; valid = false }
  if (!batchForm.floors || batchForm.floors < 1) { batchErrors.floors = 'Mínimo 1.'; valid = false }
  if (!batchForm.aptsPerFloor || batchForm.aptsPerFloor < 1) { batchErrors.aptsPerFloor = 'Mínimo 1.'; valid = false }
  return valid
}

async function saveBatch() {
  if (!validateBatch()) return
  savingBatch.value = true; batchProgress.value = 0; batchSuccess.value = ''; batchError.value = ''
  const block = batchForm.block.replace('Bloco ', '').trim()
  const floors = Number(batchForm.floors)
  const aptsPerFloor = Number(batchForm.aptsPerFloor)
  let created = 0; let errors = 0
  for (let floor = 1; floor <= floors; floor++) {
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      const identifier = `${block}${floor}${String(apt).padStart(2, '0')}`
      try {
        const result = await createApartment({
          buildingId: Number(batchForm.buildingId),
          apartmentTypeId: Number(batchForm.apartmentTypeId),
          identifier, floor, block,
        })
        apartments.value.push(result)
        created++
      } catch { errors++ }
      batchProgress.value = created + errors
    }
  }
  savingBatch.value = false
  batchSuccess.value = errors === 0
    ? `${created} cadastrados!`
    : `${created} cadastrados. ${errors} falharam.`
}

function getBuildingName(buildingId) {
  const b = buildings.value.find(b => b.id === buildingId)
  return b ? b.name : '—'
}

onMounted(async () => {
  loadingBuildings.value = true; loadingApts.value = true
  try {
    const [b, a, t, u] = await Promise.all([getBuildings(), getApartments(), getApartmentTypes(), getUsers()])
    buildings.value = b; apartments.value = a; apartmentTypes.value = t; users.value = u
  } catch (e) {
    console.error('Erro ao carregar dados', e)
  } finally {
    loadingBuildings.value = false; loadingApts.value = false
  }
})
</script>

<style scoped>
.tabs { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 16px; }
.tab-btn { padding: 12px 28px; border-radius: 30px; border: none; background: #0d0d2b; color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.tab-btn.active { background: #00e5cc; color: #0d0d2b; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin-bottom: 28px; }

.btn-add, .btn-batch { display: inline-flex; align-items: center; gap: 8px; background: #00e5cc; color: #0d0d2b; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-add.active, .btn-batch.active { opacity: 0.7; }
.apt-actions { display: flex; gap: 16px; margin-bottom: 20px; }

.form-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; max-width: 860px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.form-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
input, select { width: 100%; padding: 14px 20px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.95rem; outline: none; color: #333; appearance: none; box-sizing: border-box; }
input.invalid, select.invalid { border: 2px solid #c0392b; background: #fff3f0; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 4px; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 8px; }
.form-actions { display: flex; gap: 16px; justify-content: flex-end; }
.btn-save { padding: 12px 36px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 12px 36px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #333; cursor: pointer; }
.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.info-box { display: flex; gap: 12px; background: #fff8e1; border-radius: 8px; padding: 16px; font-size: 0.85rem; color: #333; }
.info-icon { color: #f5a623; margin-top: 2px; flex-shrink: 0; }
.info-box ul { margin: 4px 0 0 16px; padding: 0; }
.preview { background: #f4f4f4; border-radius: 8px; padding: 16px; font-size: 0.85rem; }
.preview-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.preview-tag { background: #0d0d2b; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
.preview-tag.more { background: #00e5cc; color: #0d0d2b; }

/* Lista de empreendimentos */
.item-list { display: flex; flex-direction: column; gap: 10px; }
.item-card { background: #6b6b6b; border-radius: 12px; padding: 18px 24px; color: #fff; font-size: 1rem; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between; }
.item-card:hover { background: #555; }
.building-card-info { display: flex; flex-direction: column; gap: 4px; }
.building-card-name { font-size: 1rem; font-weight: 600; }
.building-card-count { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
.building-card-right { display: flex; align-items: center; gap: 12px; }
.building-card-arrow { font-size: 1.2rem; color: #00e5cc; }
.btn-card-delete { background: none; border: none; color: rgba(255,255,255,0.35); cursor: pointer; font-size: 0.9rem; padding: 6px 8px; border-radius: 6px; transition: color 0.2s; flex-shrink: 0; }
.btn-card-delete:hover { color: #f87171; }

/* Botão voltar */
.back-action-container { margin-bottom: 12px; }
.btn-back { background: #e8e8e8; border: none; border-radius: 20px; padding: 8px 16px; font-size: 0.85rem; font-weight: bold; color: #333; cursor: pointer; }
.btn-back:hover { background: #d0d0d0; }

.building-header { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 16px; }
.building-header-top { display: flex; align-items: center; gap: 16px; }
.building-title { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; margin: 0; }
.building-header-info { display: flex; gap: 32px; font-size: 0.9rem; color: #444; background: #f4f4f4; padding: 14px 20px; border-radius: 8px; }
.text-muted { color: #999; font-style: italic; }

/* Tabela de apartamentos */
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 40px; padding: 8px 24px; font-size: 0.85rem; color: #555; font-weight: 600; margin-bottom: 8px; }
.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 40px; background: #6b6b6b; border-radius: 10px; padding: 14px 24px; color: #fff; font-size: 0.9rem; margin-bottom: 8px; align-items: center; }
.apt-row-clickable-wrapper { display: contents; cursor: pointer; }
.apt-row-clickable-wrapper > span { cursor: pointer; }
.apt-row-clickable-wrapper > span:hover { opacity: 0.8; }

.apt-assign-inline { display: flex; justify-content: flex-start; }
.apt-assign-inline select { width: 100%; max-width: 160px; padding: 8px 16px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.5); background: transparent; font-size: 0.85rem; color: #fff; cursor: pointer; outline: none; appearance: none; transition: all 0.2s ease; }
.apt-assign-inline select:not(:disabled):hover { border-color: #00e5cc; color: #00e5cc; background: rgba(0,229,204,0.1); }
.apt-assign-inline select.is-assigned { background: #00e5cc; border: 1px solid #00e5cc; color: #0d0d2b; font-weight: bold; }
.apt-assign-inline select:disabled { opacity: 1; cursor: default; }

.apt-delete-cell { display: flex; align-items: center; justify-content: center; }
.btn-apt-delete { background: none; border: none; color: rgba(255,255,255,0.35); cursor: pointer; font-size: 0.85rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-apt-delete:hover { color: #f87171; }

/* Modais */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-confirm { background: #fff; border-radius: 16px; padding: 40px; width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal-confirm h3 { font-size: 1.1rem; color: #1a1a2e; margin: 0; }
.modal-confirm p { font-size: 0.88rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; }
.btn-confirm-delete { padding: 10px 24px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }

.checklist-overlay-state { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; color: #fff; font-size: 1rem; flex-direction: column; gap: 16px; }
.checklist-overlay-state.error { color: #fff; }
.checklist-overlay-state.error .btn-cancel { padding: 10px 28px; }
.empty { text-align: center; padding: 40px; color: #888; }
</style>
