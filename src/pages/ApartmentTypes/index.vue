<template>
  <MainLayout titulo="Tipos de Apartamento">

    <div :class="['layout', { 'layout-split': selectedType }]">

      <!-- COLUNA ESQUERDA: lista de tipos -->
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
                {{ t.rooms.length }} cômodo{{ t.rooms.length !== 1 ? 's' : '' }}
                · {{ t._count.apartments }} apt{{ t._count.apartments !== 1 ? 's' : '' }}
              </span>
              <span v-if="t.description" class="type-desc">{{ t.description }}</span>
            </div>
            <div class="type-card-actions">
              <button class="btn-icon" @click.stop="openEditForm(t)" title="Editar">
                <FontAwesomeIcon :icon="['fas', 'pen']" />
              </button>
              <button
                v-if="t._count.apartments === 0"
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

      <!-- COLUNA DIREITA: detalhe do tipo selecionado -->
      <div v-if="selectedType" class="col-detail">
        <div class="col-header">
          <h2 class="col-title">{{ selectedType.name }}</h2>
          <button class="btn-close" @click="selectedType = null">✕ Fechar</button>
        </div>

        <div class="room-add">
          <input v-model="newRoomName" type="text" placeholder="Nome do cômodo (ex: Sala, Quarto 1, Banheiro...)" @keyup.enter="addRoom" />
          <button class="btn-save room-btn" :disabled="addingRoom" @click="addRoom">
            {{ addingRoom ? '...' : '+ Cômodo' }}
          </button>
        </div>
        <div v-if="roomError" class="alert error small">{{ roomError }}</div>

        <div v-if="loadingRooms" class="state">Carregando cômodos...</div>
        <div v-else class="rooms-list">
          <div v-for="room in selectedType.rooms" :key="room.id" class="room-card">
            <div class="room-header">
              <FontAwesomeIcon :icon="['fas', 'door-open']" class="room-icon" />
              <span class="room-name">{{ room.name }}</span>
              <button class="btn-icon danger small" @click="removeRoom(room)" title="Remover cômodo">
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
            <div class="services-section">
              <div class="services-list">
                <span v-for="svc in roomServices[room.id] || []" :key="svc.service.id" class="service-tag">
                  {{ svc.service.name }}
                  <button class="tag-remove" @click="removeService(room, svc.service.id)">✕</button>
                </span>
                <span v-if="!roomServices[room.id]?.length" class="no-services">Nenhum serviço padrão</span>
              </div>
            </div>
          </div>
          <div v-if="selectedType.rooms.length === 0" class="state small">
            Nenhum cômodo cadastrado. Adicione acima.
          </div>
        </div>
      </div>

    </div>

    <!-- Modal excluir tipo -->
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
  getRoomServices, deleteRoomService,
} from '../../services/apartmentTypes.js'

const types = ref([])
const loading = ref(true)
const loadError = ref('')
const selectedType = ref(null)
const loadingRooms = ref(false)
const roomServices = ref({})

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

async function selectType(t) {
  selectedType.value = t
  loadingRooms.value = true
  try {
    const results = await Promise.allSettled(
      t.rooms.map(room =>
        getRoomServices(t.id, room.id).then(svcs => ({ roomId: room.id, svcs }))
      )
    )
    const map = {}
    for (const r of results) {
      if (r.status === 'fulfilled') map[r.value.roomId] = r.value.svcs
    }
    roomServices.value = map
  } finally {
    loadingRooms.value = false
  }
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
    selectedType.value.rooms.push(room)
    const idx = types.value.findIndex(t => t.id === selectedType.value.id)
    if (idx !== -1) types.value[idx].rooms = selectedType.value.rooms
    roomServices.value[room.id] = []
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
    delete roomServices.value[room.id]
  } catch (e) {
    roomError.value = e.response?.data?.message || 'Erro ao remover cômodo.'
  }
}

async function removeService(room, serviceId) {
  try {
    await deleteRoomService(selectedType.value.id, room.id, serviceId)
    roomServices.value[room.id] = roomServices.value[room.id].filter(s => s.service.id !== serviceId)
  } catch (e) {
    roomError.value = e.response?.data?.message || 'Erro ao remover serviço.'
  }
}

onMounted(async () => {
  try {
    types.value = await getApartmentTypes()
  } catch (e) {
    loadError.value = 'Erro ao carregar tipos de apartamento.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.layout { display: flex; flex-direction: column; gap: 24px; }
.layout-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
.col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.col-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.btn-close { background: none; border: 1px solid #ccc; border-radius: 30px; padding: 8px 16px; font-size: 0.85rem; color: #555; cursor: pointer; }
.form-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.form-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0; }
input[type="text"] { width: 100%; padding: 12px 18px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; box-sizing: border-box; }
input[type="text"].invalid { border: 2px solid #c0392b; background: #fff3f0; }
textarea { width: 100%; padding: 12px 18px; border: none; border-radius: 12px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; resize: vertical; box-sizing: border-box; font-family: inherit; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 4px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-save { padding: 10px 28px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 28px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: bold; color: #333; cursor: pointer; }
.state { text-align: center; padding: 32px; color: #888; }
.state.small { padding: 12px; font-size: 0.85rem; }
.error { color: red; }
.type-list { display: flex; flex-direction: column; gap: 10px; }
.type-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 2px solid #eee; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; transition: border-color 0.2s; }
.type-card:hover { border-color: #00e5cc; }
.type-card.active { border-color: #00e5cc; background: #f0fdfb; }
.type-card-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.type-name { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
.type-meta { font-size: 0.8rem; color: #888; }
.type-desc { font-size: 0.82rem; color: #555; }
.type-card-actions { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; color: #bbb; cursor: pointer; font-size: 0.9rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-icon:hover { color: #555; }
.btn-icon.danger:hover { color: #c0392b; }
.btn-icon.small { font-size: 0.8rem; padding: 4px; }
.col-detail { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.room-add { display: flex; gap: 10px; margin-bottom: 8px; }
.room-btn { padding: 10px 20px; white-space: nowrap; flex-shrink: 0; }
.alert { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; margin-bottom: 12px; }
.alert.small { padding: 8px 14px; font-size: 0.82rem; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.rooms-list { display: flex; flex-direction: column; gap: 12px; }
.room-card { background: #f8f8f8; border-radius: 10px; padding: 14px 16px; }
.room-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.room-icon { color: #00e5cc; }
.room-name { font-size: 0.95rem; font-weight: 600; color: #1a1a2e; flex: 1; }
.services-section { padding-left: 4px; }
.services-list { display: flex; flex-wrap: wrap; gap: 6px; }
.service-tag { display: flex; align-items: center; gap: 6px; background: #0d0d2b; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
.tag-remove { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 0.75rem; padding: 0; line-height: 1; }
.tag-remove:hover { color: #fff; }
.no-services { font-size: 0.8rem; color: #aaa; font-style: italic; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.1rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.88rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; }
.btn-confirm-delete { padding: 10px 24px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
