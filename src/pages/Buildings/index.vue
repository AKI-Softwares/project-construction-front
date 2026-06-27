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

    <!-- ===================== TAB: BUILDINGS ===================== -->
    <div v-if="activeTab === 'buildings'">
      <button v-if="authStore.hasPermission('buildings:create')" class="btn-add" @click="showBuildingForm = !showBuildingForm">
        + Adicionar empreendimento
      </button>

      <div v-if="showBuildingForm" class="form-card">
        <h3 class="form-title">Novo Empreendimento</h3>
        <div v-if="buildingSuccess" class="alert success">Empreendimento cadastrado!</div>
        <div v-if="buildingError" class="alert error">{{ buildingError }}</div>
        
        <input v-model="buildingForm.name" type="text" placeholder="Nome do Empreendimento" :class="{ invalid: buildingErrors.name }" />
        <span v-if="buildingErrors.name" class="field-error">{{ buildingErrors.name }}</span>
        
        <input v-model="buildingForm.address" type="text" placeholder="Endereço" :class="{ invalid: buildingErrors.address }" />
        <span v-if="buildingErrors.address" class="field-error">{{ buildingErrors.address }}</span>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingBuilding" @click="saveBuilding">Salvar</button>
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
      </div>
    </div>

    <!-- ===================== TAB: APARTMENTS ===================== -->
    <div v-if="activeTab === 'apartments'">
      <div class="apt-actions">
        <button v-if="authStore.hasPermission('apartments:create')" :class="['btn-add', { active: aptMode === 'single' }]" @click="toggleAptMode('single')">
          + Individual
        </button>
        <button v-if="authStore.hasPermission('apartments:create')" :class="['btn-batch', { active: aptMode === 'batch' }]" @click="toggleAptMode('batch')">
          + Em lote
        </button>
      </div>

      <!-- Formulário Individual -->
      <div v-if="aptMode === 'single'" class="form-card">
        <h3 class="form-title">Novo Apartamento</h3>
        <div v-if="aptSuccess" class="alert success">Apartamento cadastrado!</div>
        <div v-if="aptError" class="alert error">{{ aptError }}</div>

        <div class="form-row">
          <div class="form-col">
            <select v-model="aptForm.buildingId" :class="{ invalid: aptErrors.buildingId }">
              <option value="">Selecione o Empreendimento</option>
              <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <span v-if="aptErrors.buildingId" class="field-error">{{ aptErrors.buildingId }}</span>
          </div>

          <div class="form-col">
            <select v-model="aptForm.apartmentTypeId" :class="{ invalid: aptErrors.apartmentTypeId }">
              <option value="">Selecione o Modelo/Planta</option>
              <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <span v-if="aptErrors.apartmentTypeId" class="field-error">{{ aptErrors.apartmentTypeId }}</span>
          </div>

          <div class="form-col">
            <input v-model="aptForm.identifier" type="text" placeholder="Número/Identificador (ex: 101)" :class="{ invalid: aptErrors.identifier }" />
            <span v-if="aptErrors.identifier" class="field-error">{{ aptErrors.identifier }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <input v-model="aptForm.block" type="text" placeholder="Bloco/Torre (Opcional)" />
          </div>
          <div class="form-col">
            <input v-model="aptForm.floor" type="number" placeholder="Andar (Opcional)" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingApt" @click="saveAptSingle">Salvar</button>
          <button class="btn-cancel" @click="cancelApt">Cancelar</button>
        </div>
      </div>

      <!-- Formulário em Lote -->
      <div v-if="aptMode === 'batch'" class="form-card">
        <h3 class="form-title">Gerar Apartamentos em Lote</h3>
        <div v-if="aptSuccess" class="alert success">Apartamentos gerados com sucesso!</div>
        <div v-if="aptError" class="alert error">{{ aptError }}</div>

        <div class="form-row">
          <div class="form-col">
            <select v-model="batchForm.buildingId" :class="{ invalid: batchErrors.buildingId }">
              <option value="">Selecione o Empreendimento</option>
              <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <span v-if="batchErrors.buildingId" class="field-error">{{ batchErrors.buildingId }}</span>
          </div>

          <div class="form-col">
            <select v-model="batchForm.apartmentTypeId" :class="{ invalid: batchErrors.apartmentTypeId }">
              <option value="">Selecione o Modelo/Planta padrão</option>
              <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <span v-if="batchErrors.apartmentTypeId" class="field-error">{{ batchErrors.apartmentTypeId }}</span>
          </div>
        </div>

        <div class="info-box">
          <span>Defina os blocos, andares e a quantidade de apartamentos por andar. Exemplo: Bloco A, andares de 1 a 4, com 4 apartamentos por andar, vai gerar 101, 102, 103, 104, 201...</span>
        </div>

        <div class="form-row">
          <div class="form-col">
            <input v-model="batchForm.block" type="text" placeholder="Bloco (ex: A)" />
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.startFloor" type="number" placeholder="Andar Inicial" :class="{ invalid: batchErrors.startFloor }" />
            <span v-if="batchErrors.startFloor" class="field-error">{{ batchErrors.startFloor }}</span>
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.endFloor" type="number" placeholder="Andar Final" :class="{ invalid: batchErrors.endFloor }" />
            <span v-if="batchErrors.endFloor" class="field-error">{{ batchErrors.endFloor }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <input v-model.number="batchForm.qtyPerFloor" type="number" placeholder="Quantidade por andar" :class="{ invalid: batchErrors.qtyPerFloor }" />
            <span v-if="batchErrors.qtyPerFloor" class="field-error">{{ batchErrors.qtyPerFloor }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingApt" @click="saveAptBatch">Gerar Lote</button>
          <button class="btn-cancel" @click="cancelApt">Cancelar</button>
        </div>
      </div>

      <!-- Listagem de Apartamentos -->
      <div v-if="!aptMode">
        <div v-if="selectedBuildingId" class="filter-active">
          Filtrando por: <strong>{{ buildings.find(b => b.id === selectedBuildingId)?.name }}</strong>
          <button class="btn-clear-filter" @click="selectedBuildingId = null">✕ Ver todos</button>
        </div>

        <div class="item-list">
          <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
            
            <!-- Clique original intocado para abrir o checklist -->
            <div class="apt-row-clickable" @click="openChecklist(apt)">
              <span class="apt-info-text">
                {{ getBuildingName(apt.buildingId) }} — Unidade {{ apt.identifier }} 
                <span v-if="apt.block" class="apt-tag-info"> (Bloco {{ apt.block }})</span>
                <span v-if="apt.floor" class="apt-tag-info"> — {{ apt.floor }}º Andar</span>
              </span>
            </div>

            <!-- Inclusão cirúrgica: Atribuição inline protegida contra propagação de clique -->
            <div class="apt-assign-inline">
              <select :value="apt.currentInspectorId || ''" @change="assignInline(apt, $event.target.value)" @click.stop>
                <option value="">Sem vistoriador</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>

          </div>
          <div v-if="apartmentsFiltered.length === 0" class="empty">
            Nenhum apartamento encontrado.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Checklist -->
    <ChecklistModal 
      v-if="selectedChecklist" 
      :checklist="selectedChecklist" 
      :available-users="users"
      @fechar="selectedChecklist = null" 
    />

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { getBuildings, createBuilding } from '../../services/buildings.js'
import { getApartments, createApartment, createApartmentsBatch } from '../../services/apartments.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { createVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'

const authStore = useAuthStore()
const activeTab = ref('buildings')
const buildings = ref([])
const apartments = ref([])
const apartmentTypes = ref([])
const users = ref([])

// Controle de filtros e modais
const selectedBuildingId = ref(null)
const selectedChecklist = ref(null)

// Estados de formulários
const showBuildingForm = ref(false)
const savingBuilding = ref(false)
const buildingSuccess = ref(false)
const buildingError = ref(false)
const buildingForm = reactive({ name: '', address: '' })
const buildingErrors = reactive({ name: '', address: '' })

const aptMode = ref(null)
const savingApt = ref(false)
const aptSuccess = ref(false)
const aptError = ref(false)

const aptForm = reactive({ buildingId: '', apartmentTypeId: '', identifier: '', block: '', floor: null })
const aptErrors = reactive({ buildingId: '', apartmentTypeId: '', identifier: '' })

const batchForm = reactive({ buildingId: '', apartmentTypeId: '', block: '', startFloor: null, endFloor: null, qtyPerFloor: null })
const batchErrors = reactive({ buildingId: '', apartmentTypeId: '', startFloor: null, endFloor: null, qtyPerFloor: null })

// Computeds originais de filtragem
const apartmentsFiltered = computed(() => {
  if (!selectedBuildingId.value) return apartments.value
  return apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
})

function getBuildingName(id) {
  const b = buildings.value.find(x => x.id === id)
  return b ? b.name : 'Desconhecido'
}

function selectBuilding(building) {
  selectedBuildingId.value = building.id
  activeTab.value = 'apartments'
}

function toggleAptMode(mode) {
  aptMode.value = aptMode.value === mode ? null : mode
  clearAptForms()
}

// Ação Rápida de Atribuição sem interferir no clique do modal
async function assignInline(apt, userId) {
  if (!userId) return
  try {
    const chk = await getChecklistByApartment(apt.id)
    if (chk && chk.id) {
      await createVisit(chk.id, userId)
      apt.currentInspectorId = userId
      alert('Vistoriador atribuído com sucesso!')
    }
  } catch (e) {
    alert('Erro ao atribuir: ' + (e.response?.data?.message || e.message))
  }
}

async function openChecklist(apt) {
  try {
    let detail = await getChecklistByApartment(apt.id)
    if (!detail) return
    detail.apartmentId = apt.id 
    selectedChecklist.value = groupChecklistByRoom(detail)
  } catch (e) {
    console.error(e)
  }
}

// Funções de salvamento originais mantidas
async function saveBuilding() {
  buildingErrors.name = !buildingForm.name ? 'Nome é obrigatório' : ''
  buildingErrors.address = !buildingForm.address ? 'Endereço é obrigatório' : ''
  if (buildingErrors.name || buildingErrors.address) return

  savingBuilding.value = true
  buildingSuccess.value = false
  buildingError.value = false
  try {
    const res = await createBuilding(buildingForm)
    buildings.value.push(res)
    buildingSuccess.value = true
    buildingForm.name = ''
    buildingForm.address = ''
    setTimeout(() => { showBuildingForm.value = false; buildingSuccess.value = false }, 1500)
  } catch (e) {
    buildingError.value = e.response?.data?.message || 'Erro ao salvar'
  } finally {
    savingBuilding.value = false
  }
}

function cancelBuilding() {
  showBuildingForm.value = false
  buildingForm.name = ''
  buildingForm.address = ''
}

async function saveAptSingle() {
  aptErrors.buildingId = !aptForm.buildingId ? 'Selecione o empreendimento' : ''
  aptErrors.apartmentTypeId = !aptForm.apartmentTypeId ? 'Selecione a planta' : ''
  aptErrors.identifier = !aptForm.identifier ? 'Identificador é obrigatório' : ''
  if (aptErrors.buildingId || aptErrors.apartmentTypeId || aptErrors.identifier) return

  savingApt.value = true
  try {
    const res = await createApartment(aptForm)
    apartments.value.push(res)
    aptSuccess.value = true
    setTimeout(() => { aptMode.value = null; aptSuccess.value = false }, 1500)
  } catch (e) {
    aptError.value = e.response?.data?.message || 'Erro ao criar'
  } finally {
    savingApt.value = false
  }
}

async function saveAptBatch() {
  batchErrors.buildingId = !batchForm.buildingId ? 'Obrigatório' : ''
  batchErrors.apartmentTypeId = !batchForm.apartmentTypeId ? 'Obrigatório' : ''
  batchErrors.startFloor = batchForm.startFloor === null ? 'Obrigatório' : ''
  batchErrors.endFloor = batchForm.endFloor === null ? 'Obrigatório' : ''
  batchErrors.qtyPerFloor = !batchForm.qtyPerFloor ? 'Obrigatório' : ''
  if (Object.values(batchErrors).some(x => x)) return

  savingApt.value = true
  try {
    const res = await createApartmentsBatch(batchForm)
    if (Array.isArray(res)) apartments.value.push(...res)
    aptSuccess.value = true
    setTimeout(() => { aptMode.value = null; aptSuccess.value = false }, 1500)
  } catch (e) {
    aptError.value = e.response?.data?.message || 'Erro no lote'
  } finally {
    savingApt.value = false
  }
}

function cancelApt() {
  aptMode.value = null
  clearAptForms()
}

function clearAptForms() {
  aptError.value = false
  aptForm.buildingId = ''; aptForm.apartmentTypeId = ''; aptForm.identifier = ''; aptForm.block = ''; aptForm.floor = null
  batchForm.buildingId = ''; batchForm.apartmentTypeId = ''; batchForm.block = ''; batchForm.startFloor = null; batchForm.endFloor = null; batchForm.qtyPerFloor = null
}

onMounted(async () => {
  try {
    const [b, a, t, u] = await Promise.all([getBuildings(), getApartments(), getApartmentTypes(), getUsers()])
    buildings.value = b
    apartments.value = a
    apartmentTypes.value = t
    users.value = u
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
/* Estilo Base Idêntico à imagem de referência */
.tabs { display: flex; gap: 12px; justify-content: flex-start; margin-bottom: 16px; }
.tab-btn { padding: 6px 12px; border: 1px solid #767676; background: #efefef; color: #000; font-size: 0.85rem; cursor: pointer; border-radius: 2px; }
.tab-btn.active { background: #fff; border-bottom: 1px solid transparent; }
.divider { border: none; border-top: 1px solid #ccc; margin-bottom: 20px; }
.btn-add, .btn-batch { background: #efefef; border: 1px solid #767676; padding: 4px 10px; font-size: 0.85rem; cursor: pointer; border-radius: 2px; }
.btn-add.active, .btn-batch.active { background: #ddd; }
.form-card { background: #fff; border: 1px solid #ccc; padding: 20px; max-width: 600px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; color: #000; }
.form-title { font-size: 1rem; font-weight: bold; margin: 0; }
input, select { padding: 6px; border: 1px solid #767676; font-size: 0.9rem; background: #fff; color: #000; }
input.invalid, select.invalid { border: 1px solid red; }
.form-row { display: flex; gap: 12px; }
.form-col { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.field-error { font-size: 0.75rem; color: red; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
.btn-save { padding: 6px 16px; background: #efefef; border: 1px solid #767676; cursor: pointer; font-weight: bold; }
.btn-cancel { padding: 6px 16px; background: #efefef; border: 1px solid #767676; cursor: pointer; }
.alert { padding: 8px; font-size: 0.85rem; border-radius: 2px; }
.alert.success { background: #e2f0d9; color: #385723; border: 1px solid #385723; }
.alert.error { background: #fce4d6; color: #c65911; border: 1px solid #c65911; }
.info-box { background: #fff2cc; border: 1px solid #d6b656; padding: 10px; font-size: 0.8rem; color: #000; }

/* Estrutura das Listagens e Linhas */
.item-list { display: flex; flex-direction: column; gap: 4px; }
.item-card { font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: flex-start; gap: 8px; padding: 4px 0; color: #000; }
.building-card-info { display: flex; gap: 6px; }
.building-card-name { font-weight: normal; }
.building-card-count { color: #555; }
.building-card-arrow { display: none; }
.filter-active { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #000; margin-bottom: 12px; }
.btn-clear-filter { background: none; border: 1px solid #767676; padding: 2px 8px; font-size: 0.75rem; cursor: pointer; margin-left: 8px; }

/* Estilização da linha de apartamento flexível */
.apt-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 6px 0;
  border-bottom: 1px id #eee;
}
.apt-row-clickable { 
  flex: 1; 
  cursor: pointer; 
  color: #000;
}
.apt-row-clickable:hover .apt-info-text { 
  text-decoration: underline; 
}
.apt-tag-info { 
  color: #666; 
  font-size: 0.85rem; 
}
.apt-assign-inline select { 
  padding: 3px 6px; 
  font-size: 0.8rem; 
  border: 1px solid #767676; 
  background: #fff;
  cursor: pointer;
}
.empty { padding: 20px 0; color: #666; font-size: 0.9rem; }
</style>
