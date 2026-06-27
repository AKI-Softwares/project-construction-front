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
        <div v-if="buildingSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Empreendimento cadastrado!</div>
        <div v-if="buildingError" class="alert error"><FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ buildingError }}</div>
        
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

    <div v-if="activeTab === 'apartments'">
      <div v-if="!aptMode">
        <div v-if="selectedBuildingId" class="filter-active">
          <FontAwesomeIcon :icon="['fas', 'filter']" />
          Filtrando por: <strong>{{ buildings.find(b => b.id === selectedBuildingId)?.name }}</strong>
          <button class="btn-clear-filter" @click="selectedBuildingId = null">✕ Ver todos</button>
        </div>

        <div class="apt-table-header">
          <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador Atribuído</span>
        </div>

        <div class="item-list">
          <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
            <div class="apt-click-area" @click="openChecklist(apt)">
              <span>{{ getBuildingName(apt.buildingId) }}</span>
              <span>{{ apt.identifier }}</span>
              <span>{{ apt.block || '—' }}</span>
              <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
            </div>

            <div class="apt-assign-inline">
              <select :value="apt.currentInspectorId || ''" @change="assignInline(apt, $event.target.value)">
                <option value="">Não atribuído</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

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

const selectedChecklist = ref(null)

// Função de Atribuição Direta/Rápida pela linha da tabela
async function assignInline(apt, userId) {
  if (!userId) return
  try {
    // Busca o checklist do apartamento para ter o ID do checklist
    const chk = await getChecklistByApartment(apt.id)
    if (chk && chk.id) {
      await createVisit(chk.id, userId)
      apt.currentInspectorId = userId // atualiza o estado visual
      alert('Vistoriador atribuído com sucesso para este apartamento!')
    }
  } catch (e) {
    alert('Erro ao atribuir vistoriador: ' + (e.response?.data?.message || e.message))
  }
}

async function openChecklist(apt) {
  try {
    let detail = await getChecklistByApartment(apt.id)
    if (!detail) return
    // Injeta referências extras para o modal controlar o estado interno
    detail.apartmentId = apt.id 
    selectedChecklist.value = groupChecklistByRoom(detail)
  } catch (e) {
    console.error(e)
  }
}

// ... Mantidas as lógicas de validação, filtros, cadastros individuais e em lote ...

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
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 8px 24px; font-size: 0.85rem; color: #555; font-weight: 600; margin-bottom: 8px; }
.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; background: #6b6b6b; border-radius: 10px; padding: 16px 24px; color: #fff; font-size: 0.9rem; margin-bottom: 8px; }
.apt-row-clickable { cursor: pointer; transition: background 0.2s; }
.apt-row-clickable:hover { background: #555; }
.checklist-overlay-state { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; color: #fff; font-size: 1rem; flex-direction: column; gap: 16px; }
.checklist-overlay-state.error { color: #fff; }
.checklist-overlay-state.error .btn-cancel { padding: 10px 28px; }
.empty { text-align: center; padding: 40px; color: #888; }
</style>
