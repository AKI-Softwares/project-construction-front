<template>
  <MainLayout titulo="Tipos de Apartamento">

    <div :class="['layout', { 'layout-split': selectedType }]">

      <div class="col-list">
        <div class="col-header">
          <h2 class="col-title">Tipos cadastrados</h2>
          <button class="btn-primary" @click="openCreateForm">
            <FontAwesomeIcon :icon="['fas', 'plus']" /> Novo tipo
          </button>
        </div>

        <div v-if="showForm" class="form-card">
          <h3 class="form-title">{{ editingType ? 'Editar tipo' : 'Novo tipo de apartamento' }}</h3>
          <div v-if="formSuccess" class="alert success">
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
            {{ editingType ? 'Tipo atualizado!' : 'Tipo criado com sucesso!' }}
          </div>
          <div v-if="formError" class="alert error">
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ formError }}
          </div>
          <input v-model="form.name" type="text" placeholder="Nome (ex: Studio, 2 Quartos, Cobertura...)" :class="{ invalid: formErrors.name }" />
          <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
          <textarea v-model="form.description" placeholder="Descrição (opcional)" rows="2"></textarea>
          <div class="form-actions">
            <button class="btn-save" :disabled="saving" @click="submitForm">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
            <button class="btn-cancel" @click="closeForm">Cancelar</button>
          </div>
        </div>

        <div v-if="loading" class="state">Carregando...</div>
        <div v-if="loadError" class="state error">{{ loadError }}</div>

        <div v-if="!loading" class="type-list">
          <div
            v-for="t in types"
            :key="t.id"
            :class="['type-card', { active: selectedType?.id === t.id }]"
            @click="selectType(t)"
          >
            <div class="type-card-info">
              <span class="type-name">{{ t.name }}</span>
              <span class="type-meta">
                {{ t.rooms?.length || 0 }} cômodo{{ t.rooms?.length !== 1 ? 's' : '' }}
                · {{ t._count?.apartments || 0 }} apt{{ t._count?.apartments !== 1 ? 's' : '' }}
              </span>
              <span v-if="t.description" class="type-desc">{{ t.description }}</span>
            </div>
            <div class="type-card-actions">
              <button class="btn-icon" @click.stop="openEditForm(t)" title="Editar">
                <FontAwesomeIcon :icon="['fas', 'pen']" />
              </button>
              <button
                v-if="t._count?.apartments === 0"
                class="btn-icon danger"
                @click.stop="confirmDelete(t)"
                title="Excluir"
              >
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
          <div v-if="types.length === 0" class="state">Nenhum tipo cadastrado.</div>
        </div>
      </div>

      <div v-if="selectedType" class="col-detail">
        <div class="col-header">
          <h2 class="col-title">{{ selectedType.name }}</h2>
          <button class="btn-close" @click="selectedType = null">✕ Fechar</button>
        </div>

        <div class="room-add">
          <input v-model="newRoomName" type="text" placeholder="Nome do cômodo (ex: Sala, Quarto, Banheiro...)" @keyup.enter="addRoom" />
          <button class="btn-save room-btn" :disabled="addingRoom" @click="addRoom">
            {{ addingRoom ? '...' : '+ Cômodo' }}
          </button>
        </div>
        <div v-if="roomError" class="alert error small">{{ roomError }}</div>

        <div v-if="loadingRooms" class="state">Carregando cômodos e mapeando serviços...</div>
        <div v-else class="rooms-list">
          <div v-for="room in selectedType.rooms" :key="room.id" class="room-card">
            <div class="room-header">
              <FontAwesomeIcon :icon="['fas', 'door-open']" class="room-icon" />
              <div class="room-title-group">
                <span class="room-name">{{ room.name }}</span>
                <span class="room-suggested-label">Serviços sugeridos pelo catálogo:</span>
              </div>
              <button class="btn-icon danger small" @click="removeRoom(room)" title="Remover cômodo">
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
            
            <div class="services-section">
              <div class="services-list">
                <span v-for="svc in obterServicosSugeridos(room.name)" :key="svc.id" class="service-tag">
                  {{ svc.name }}
                  <span class="category-badge">{{ svc.category }}</span>
                </span>
                <span v-if="obterServicosSugeridos(room.name).length === 0" class="no-services">
                  Nenhum serviço correspondente encontrado no catálogo para este cômodo.
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedType.rooms?.length === 0" class="state small">
            Nenhum cômodo cadastrado. Adicione acima.
          </div>
        </div>
      </div>

    </div>

    <div v-if="typeToDelete" class="modal-overlay" @click.self="typeToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir tipo</h3>
        <p>Excluir <strong>{{ typeToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deleting" @click="doDelete">
            {{ deleting ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="typeToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import {
  getApartmentTypes, createApartmentType, updateApartmentType, deleteApartmentType,
  addRoom as apiAddRoom, deleteRoom as apiDeleteRoom,
} from '../../services/apartmentTypes.js'
import { getServices } from '../../services/services.js'

const types = ref([])
const catalogServices = ref([])
const loading = ref(true)
const loadError = ref('')
const selectedType = ref(null)
const loadingRooms = ref(false)

const showForm = ref(false)
const editingType = ref(null)
const saving = ref(false)
const formSuccess = ref(false)
const formError = ref('')
const form = reactive({ name: '', description: '' })
const formErrors = reactive({ name: '' })

function openCreateForm() {
  editingType.value = null
  form.name = ''; form.description = ''
  formErrors.name = ''; formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function openEditForm(t) {
  editingType.value = t
  form.name = t.name; form.description = t.description || ''
  formErrors.name = ''; formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false; editingType.value = null
  form.name = ''; form.description = ''
}

function validateForm() {
  formErrors.name = ''
  if (!form.name || form.name.length < 2) { formErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; return false }
  return true
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true; formError.value = ''; formSuccess.value = false
  try {
    const data = { name: form.name, ...(form.description ? { description: form.description } : {}) }
    if (editingType.value) {
      const updated = await updateApartmentType(editingType.value.id, data)
      const idx = types.value.findIndex(t => t.id === editingType.value.id)
      if (idx !== -1) types.value[idx] = updated
      if (selectedType.value?.id === editingType.value.id) selectedType.value = updated
    } else {
      const created = await createApartmentType(data)
      types.value.push(created)
    }
    formSuccess.value = true
    form.name = ''; form.description = ''
    if (!editingType.value) showForm.value = false
  } catch (e) {
    if (e.response?.status === 409) formErrors.name = 'Já existe um tipo com esse nome.'
    else formError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

const typeToDelete = ref(null)
const deleting = ref(false)

function confirmDelete(t) { typeToDelete.value = t }

async function doDelete() {
  if (!typeToDelete.value) return
  deleting.value = true
  try {
    await deleteApartmentType(typeToDelete.value.id)
    types.value = types.value.filter(t => t.id !== typeToDelete.value.id)
    if (selectedType.value?.id === typeToDelete.value.id) selectedType.value = null
    typeToDelete.value = null
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao excluir.'
    typeToDelete.value = null
  } finally {
    deleting.value = false
  }
}

function selectType(t) {
  selectedType.value = t
}

// Nome da função rigorosamente alinhado com o Template do Vue
function obterServicosSugeridos(roomName) {
  if (!roomName || !Array.isArray(catalogServices.value)) return []
  
  const nameLower = roomName.toLowerCase()

  if (nameLower.includes('banheiro') || nameLower.includes('wc') || nameLower.includes('bwc') || nameLower.includes('lavabo')) {
    return catalogServices.value.filter(s => {
      const cat = String(s.category || '').toLowerCase()
      return cat.includes('hidráulica') || cat.includes('pintura') || cat.includes('revestimento') || cat.includes('banheiro')
    })
  }
  
  if (nameLower.includes('cozinha') || nameLower.includes('serviço') || nameLower.includes('lavanderia') || nameLower.includes('gourmet')) {
    return catalogServices.value.filter(s => {
      const cat = String(s.category || '').toLowerCase()
      return cat.includes('hidráulica') || cat.includes('revestimento') || cat.includes('elétrica') || cat.includes('cozinha')
    })
  }

  if (nameLower.includes('quarto') || nameLower.includes('sala') || nameLower.includes('circulação') || nameLower.includes('corredor') || nameLower.includes('suíte') || nameLower.includes('dormitório')) {
    return catalogServices.value.filter(s => {
      const cat = String(s.category || '').toLowerCase()
      return cat.includes('pintura') || cat.includes('elétrica') || cat.includes('esquadria') || cat.includes('marcenaria') || cat.includes('acabamento')
    })
  }

  return catalogServices.value.filter(s => {
    const cat = String(s.category || '').toLowerCase()
    return cat.includes('pintura') || cat.includes('geral') || cat.includes('acabamento')
  })
}

const newRoomName = ref('')
const addingRoom = ref(false)
const roomError = ref('')

async function addRoom() {
  if (!newRoomName.value.trim()) return
  roomError.value = ''
  addingRoom.value = true
  try {
    const room = await apiAddRoom(selectedType.value.id, newRoomName.value.trim())
    if (!selectedType.value.rooms) selectedType.value.rooms = []
    selectedType.value.rooms.push(room)
    const idx = types.value.findIndex(t => t.id === selectedType.value.id)
    if (idx !== -1) types.value[idx].rooms = selectedType.value.rooms
    newRoomName.value = ''
  } catch (e) {
    roomError.value = e.response?.data?.message || 'Erro ao adicionar cômodo.'
  } finally {
    addingRoom.value = false
  }
}

async function removeRoom(room) {
  try {
    await apiDeleteRoom(selectedType.value.id, room.id)
    selectedType.value.rooms = selectedType.value.rooms.filter(r => r.id !== room.id)
    const idx = types.value.findIndex(t => t.id === selectedType.value.id)
    if (idx !== -1) types.value[idx].rooms = selectedType.value.rooms
  } catch (
