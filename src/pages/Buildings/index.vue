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
        
        <div v-if="selectedBuildingId" class="building-header">
          <div class="building-header-top">
            <button class="btn-back" @click="goBackToBuildings">← Voltar para Empreendimentos</button>
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
import { createVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const authStore = useAuthStore()
const selectedChecklist = ref(null)
const loadingChecklist = ref(false)
const checklistError = ref('')
const users = ref([])

async function assignInline(apt, userId) {
  if (!userId) return

  try {
    const checklist = await getChecklistByApartment(apt.id)
    
    if (checklist?.status === 'FINALIZED') {
      alert('Este apartamento já está com o ciclo de vistorias finalizado.')
      return
    }

    await createVisit(checklist.id, userId)
    
    apt.currentInspectorId = Number(userId) 
    alert('Vistoriador atribuído com sucesso!')
  } catch (e) {
    console.error(e)
    alert('Erro ao atribuir vistoriador.')
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
