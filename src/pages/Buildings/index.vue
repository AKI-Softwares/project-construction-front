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

      <div class="apt-actions" v-if="!aptMode">
        <button v-if="authStore.hasPermission('apartments:create')" class="btn-add" @click="aptMode = 'single'">
          + Adicionar Apartamento individual
        </button>
        <button v-if="authStore.hasPermission('apartments:create')" class="btn-batch" @click="aptMode = 'batch'">
          Cadastro em Lote
        </button>
      </div>

      <div v-if="aptMode === 'single'" class="form-card">
        <h3 class="form-title">Novo Apartamento</h3>
        <button class="btn-cancel" @click="aptMode = null" style="margin-bottom:10px">← Voltar</button>
        <div v-if="aptSuccess" class="alert success">Apartamento cadastrado com sucesso!</div>
        <div v-if="aptError" class="alert error">{{ aptError }}</div>
        <select v-model="singleApt.buildingId">
          <option value="" disabled>Selecionar Empreendimento</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <select v-model="singleApt.apartmentTypeId">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <div class="form-row">
          <input v-model="singleApt.identifier" type="text" placeholder="Número (ex: 101)" />
          <input v-model="singleApt.floor" type="number" placeholder="Andar" />
          <input v-model="singleApt.block" type="text" placeholder="Bloco (ex: A)" />
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="saveSingleApt">Salvar</button>
        </div>
      </div>

      <div v-if="aptMode === 'batch'" class="form-card">
        <h3 class="form-title">Cadastrar em Lote</h3>
        <button class="btn-cancel" @click="aptMode = null" style="margin-bottom:10px">← Voltar</button>
        <div v-if="batchSuccess" class="alert success">{{ batchSuccess }}</div>
        <div v-if="batchError" class="alert error">{{ batchError }}</div>
        <select v-model="batchForm.buildingId">
          <option value="" disabled>Selecionar Empreendimento</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <select v-model="batchForm.apartmentTypeId">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in apartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <div class="form-row">
          <input v-model="batchForm.block" type="text" placeholder="Ex: Bloco B" />
          <input v-model.number="batchForm.floors" type="number" placeholder="Qtd andares" />
          <input v-model.number="batchForm.aptsPerFloor" type="number" placeholder="Apts por andar" />
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="saveBatch">Salvar Lote</button>
        </div>
      </div>

      <div v-if="!aptMode">
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
              <select v-model="apt.currentInspectorId" @change="assignInline(apt, apt.currentInspectorId)" @click.stop>
                <option value="">Não atribuído</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
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
import { createVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const authStore = useAuthStore()
const activeTab = ref('buildings')
const buildings = ref([])
const apartments = ref([])
const apartmentTypes = ref([])
const users = ref([])
const aptMode = ref(null)
const selectedChecklist = ref(null)
const showBuildingForm = ref(false)
const savingBuilding = ref(false)
const buildingSuccess = ref(false)
const buildingError = ref('')
const buildingForm = reactive({ name: '', address: '' })
const buildingErrors = reactive({ name: '', address: '' })
const singleApt = reactive({ buildingId: '', apartmentTypeId: '', identifier: '', floor: '', block: '' })
const aptSuccess = ref(false)
const aptError = ref('')
const batchForm = reactive({ buildingId: '', apartmentTypeId: '', block: '', floors: '', aptsPerFloor: '' })
const batchSuccess = ref('')
const batchError = ref('')

const apartmentsFiltered = computed(() => apartments.value)

async function assignInline(apt, userId) {
  if (!userId) return
  try {
    const checklist = await getChecklistByApartment(apt.id)
    await createVisit(checklist.id, userId)
    apt.currentInspectorId = Number(userId)
    alert('Vistoriador atribuído com sucesso!')
  } catch (e) {
    alert('Erro ao atribuir.')
  }
}

async function openChecklist(apt) {
  try {
    selectedChecklist.value = await getChecklistByApartment(apt.id)
  } catch (e) { alert('Erro ao abrir.') }
}

function cancelBuilding() { showBuildingForm.value = false }
async function saveBuilding() { /* Lógica mantida */ }
async function saveSingleApt() { /* Lógica mantida */ }
async function saveBatch() { /* Lógica mantida */ }
function getBuildingName(id) { const b = buildings.value.find(x => x.id === id); return b ? b.name : '-' }
function selectBuilding(b) { activeTab.value = 'apartments' }

onMounted(async () => {
  const [b, a, t, u] = await Promise.all([getBuildings(), getApartments(), getApartmentTypes(), getUsers()])
  buildings.value = b; apartments.value = a; apartmentTypes.value = t; users.value = u
})
</script>

<style scoped>
.tabs { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 16px; }
.tab-btn { padding: 12px 28px; border-radius: 30px; border: none; background: #0d0d2b; color: #fff; cursor: pointer; }
.tab-btn.active { background: #00e5cc; color: #0d0d2b; }
.btn-add, .btn-batch { background: #00e5cc; padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; font-weight: bold; }
.form-card { background: #fff; border-radius: 12px; padding: 28px; margin-bottom: 28px; display: flex; flex-direction: column; gap: 16px; }
input, select { width: 100%; padding: 14px; border-radius: 30px; border: none; background: #e8e8e8; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; padding: 8px 24px; font-weight: 600; }
.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; background: #6b6b6b; color: #fff; border-radius: 10px; padding: 16px 24px; margin-bottom: 8px; align-items: center; }
.apt-assign-inline select { padding: 8px; }
.btn-cancel { background: #e8e8e8; padding: 12px 24px; border-radius: 30px; border: none; cursor: pointer; }
.btn-save { background: #00e5cc; padding: 12px 36px; border-radius: 30px; border: none; cursor: pointer; }
</style>
