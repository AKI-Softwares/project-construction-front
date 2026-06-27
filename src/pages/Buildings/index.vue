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

    <div v-if="activeTab === 'buildings'">

      <button v-if="authStore.hasPermission('buildings:create')" class="btn-add" @click="showBuildingForm = !showBuildingForm">
        + Adicionar empreendimento
      </button>

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
        <div v-for="building in buildings" :key="building.id" class="item-card" @click="selectBuilding(building)">
          <div class="building-card-info">
            <span class="building-card-name">{{ building.name }}</span>
            <span class="building-card-count">
              {{ apartments.filter(a => a.buildingId === building.id).length }} apartamento(s)
            </span>
          </div>
          <span class="building-card-arrow">→</span>
        </div>
        <div v-if="buildings.length === 0 && !loadingBuildings" class="empty">Nenhum empreendimento cadastrado.</div>
        <div v-if="loadingBuildings" class="empty">Carregando...</div>
      </div>

    </div>

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
          <button class="btn-cancel" @click="aptMode = null">Cancelar</button>
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
          <button class="btn-cancel" @click="aptMode = null">Cancelar</button>
        </div>
      </div>

      <div v-if="!aptMode">
        <div v-if="selectedBuildingId" class="filter-active">
          <FontAwesomeIcon :icon="['fas', 'filter']" />
          Filtrando por: <strong>{{ buildings.find(b => b.id === selectedBuildingId)?.name }}</strong>
          <button class="btn-clear-filter" @click="selectedBuildingId = null">✕ Ver todos</button>
        </div>
        
        <div class="apt-table-header">
          <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span>
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
              <select :value="apt.currentInspectorId || ''" @change="assignInline(apt, $event.target.value)" @click.stop>
                <option value="">Não atribuído</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
          <div v-if="apartmentsFiltered.length === 0 && !loadingApts" class="empty">Nenhum apartamento cadastrado.</div>
          <div v-if="loadingApts" class="empty">Carregando...</div>
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
import MainLayout from '../../components/Layout/MainLayout.vue'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { getBuildings, createBuilding } from '../../services/buildings.js'
import { getApartments, createApartment } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { createVisit } from '../../services/visits.js' // Mantido o import correto do visit
import { getUsers } from '../../services/users.js'     // Carregamento dos vistoriadores
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const authStore = useAuthStore()

const selectedChecklist = ref(null)
const loadingChecklist = ref(false)
const checklistError = ref('')
const users = ref([])

// Nova ação rápida inline sem quebrar os fluxos originais
async function assignInline(apt, userId) {
  if (!userId) return
  try {
    const chk = await getChecklistByApartment(apt.id)
    if (chk && chk.id) {
      await createVisit(chk.id, userId)
      apt.currentInspectorId = Number(userId)
      alert('Vistoriador atualizado com sucesso!')
    }
  } catch (e) {
    alert('Erro ao atribuir vistoriador: ' + (e.response?.data?.message || e.message))
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
          rooms: tipoDoApt.rooms.map(room => ({
            id: room.id,
            name: room.name,
            items: [] 
          }))
        }
      } else {
        checklistError.value = 'Este apartamento está sem checklist no banco e não encontramos o Tipo dele.'
        return
      }
    }

    selectedChecklist.value = groupChecklistByRoom(detail)
    
  } catch (e) {
    console.error(e)
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

const selectedBuildingId = ref(null)
const apartmentsFiltered = computed(() =>
  selectedBuildingId.value
    ? apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
    : apartments.value
)

function selectBuilding(building) {
  selectedBuildingId.value = building.id
  activeTab.value = 'apartments'
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
    if (e.response?.status === 409) aptError.value = 'Número de apartamento já existe neste empreendimento.'
    else aptError.value = e.response?.data?.message || 'Erro ao cadastrar apartamento.'
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
  if (!batchForm.buildingId) { batchErrors.buildingId = 'Selecione um empreendimento.'; valid = false }
  if (!batchForm.apartmentTypeId) { batchErrors.apartmentTypeId = 'Selecione um tipo.'; valid = false }
  if (!batchForm.block) { batchErrors.block = 'Bloco é obrigatório.'; valid = false }
  if (!batchForm.floors || batchForm.floors < 1) { batchErrors.floors = 'Mínimo 1 andar.'; valid = false }
  if (!batchForm.aptsPerFloor || batchForm.aptsPerFloor < 1) { batchErrors.aptsPerFloor = 'Mínimo 1 apt.'; valid = false }
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
    ? `${created} apartamentos cadastrados com sucesso!`
    : `${created} cadastrados. ${errors} já existiam ou falharam.`
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
.btn-add { display: inline-flex; align-items: center; gap: 8px; background: #00e5cc; color: #0d0d2b; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; margin-bottom: 20px; transition: opacity 0.2s; }
.apt-actions { display: flex; gap: 16px; margin-bottom: 20px; }
.btn-batch { display: inline-flex; align-items: center; gap: 8px; background: #00e5cc; color: #0d0d2b; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-add.active, .btn-batch.active { opacity: 0.7; }
.form-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; max-width: 860px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.form-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
input, select { width: 100%; padding: 14px 20px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.95rem; outline: none; color: #333; appearance: none; }
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
.info-box li { margin-bottom: 4px; }
.preview { background: #f4f4f4; border-radius: 8px; padding: 16px; font-size: 0.85rem; }
.preview-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.preview-tag { background: #0d0d2b; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
.preview-tag.more { background: #00e5cc; color: #0d0d2b; }
.item-list { display: flex; flex-direction: column; gap: 10px; }
.item-card { background: #6b6b6b; border-radius: 12px; padding: 18px 24px; color: #fff; font-size: 1rem; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between; }
.item-card:hover { background: #555; }
.building-card-info { display: flex; flex-direction: column; gap: 4px; }
.building-card-name { font-size: 1rem; font-weight: 600; }
.building-card-count { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
.building-card-arrow { font-size: 1.2rem; color: #00e5cc; }
.filter-active { display: flex; align-items: center; gap: 10px; background: #e0faf6; border: 1px solid #00e5cc; border-radius: 10px; padding: 10px 16px; font-size: 0.88rem; color: #007b6e; margin-bottom: 16px; }
.btn-clear-filter { background: none; border: 1px solid #00897b; border-radius: 20px; color: #00897b; padding: 3px 12px; font-size: 0.8rem; cursor: pointer; margin-left: auto; }

/* RE-ALINHAMENTO DO GRID EM 5 COLUNAS (Perfeitamente funcional) */
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; padding: 8px 24px; font-size: 0.85rem; color: #555; font-weight: 600; margin-bottom: 8px; }
.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; background: #6b6b6b; border-radius: 10px; padding: 16px 24px; color: #fff; font-size: 0.9rem; margin-bottom: 8px; align-items: center; }

/* Wrapper para as 4 primeiras colunas herdarem o clique original de abertura */
.apt-row-clickable-wrapper { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; grid-column: span 4; cursor: pointer; width: 100%; height: 100%; align-items: center; }
.apt-row-clickable-wrapper:hover { opacity: 0.85; }

/* Estilo discreto e arredondado para o select no layout escuro */
.apt-assign-inline select { width: 100%; padding: 8px 16px; border-radius: 30px; border: none; background: #e8e8e8; font-size: 0.85rem; color: #333; cursor: pointer; outline: none; }

.checklist-overlay-state { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; color: #fff; font-size: 1rem; flex-direction: column; gap: 16px; }
.checklist-overlay-state.error { color: #fff; }
.checklist-overlay-state.error .btn-cancel { padding: 10px 28px; }
.empty { text-align: center; padding: 40px; color: #888; }
</style>
