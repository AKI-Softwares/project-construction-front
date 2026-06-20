
<template>
  <MainLayout titulo="Catálogo de Serviços">

    <div class="top-bar">
      <div class="filter-bar">
        <button
          v-for="cat in ['Todos', ...categories]"
          :key="cat"
          :class="['filter-btn', { active: activeCategory === (cat === 'Todos' ? null : cat) }]"
          @click="setCategory(cat === 'Todos' ? null : cat)"
        >
          {{ cat }}
        </button>
      </div>
      <button class="btn-primary" @click="openCreateForm">
        <FontAwesomeIcon :icon="['fas', 'plus']" /> Novo serviço
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3 class="form-title">{{ editingService ? 'Editar serviço' : 'Novo serviço' }}</h3>
      <div v-if="formSuccess" class="alert success">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" />
        {{ editingService ? 'Serviço atualizado!' : 'Serviço criado com sucesso!' }}
      </div>
      <div v-if="formError" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ formError }}
      </div>

      <div class="form-row">
        <div class="form-col">
          <label>Nome <span class="required">*</span></label>
          <input v-model="form.name" type="text" placeholder="Ex: Pintura, Elétrica, Hidráulica..." :class="{ invalid: formErrors.name }" />
          <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
        </div>
        <div class="form-col">
          <label>Categoria</label>
          <input
            v-model="form.category"
            type="text"
            placeholder="Ex: Elétrica, Hidráulica, Pintura..."
            list="categories-list"
          />
          <datalist id="categories-list">
            <option v-for="cat in categories" :key="cat" :value="cat" />
          </datalist>
        </div>
      </div>

      <div class="form-col">
        <label>Descrição <span class="optional">(opcional)</span></label>
        <textarea v-model="form.description" placeholder="Descrição do serviço..." rows="2"></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-save" :disabled="saving" @click="submitForm">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
        <button class="btn-cancel" @click="closeForm">Cancelar</button>
      </div>
    </div>

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>

    <div v-if="!loading && !loadError">
      <div class="table-header">
        <span>Nome</span>
        <span>Categoria</span>
        <span>Descrição</span>
        <span></span>
      </div>

      <div v-for="svc in filteredServices" :key="svc.id" class="table-row">
        <span class="svc-name">{{ svc.name }}</span>
        <span>
          <span v-if="svc.category" class="category-tag">{{ svc.category }}</span>
          <span v-else class="no-category">—</span>
        </span>
        <span class="svc-desc">{{ svc.description || '—' }}</span>
        <div class="row-actions">
          <button class="btn-icon" @click="openEditForm(svc)" title="Editar">
            <FontAwesomeIcon :icon="['fas', 'pen']" />
          </button>
          <button class="btn-icon danger" @click="confirmDelete(svc)" title="Excluir">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
        </div>
      </div>

      <div v-if="filteredServices.length === 0" class="state">
        {{ activeCategory ? `Nenhum serviço na categoria "${activeCategory}".` : 'Nenhum serviço cadastrado.' }}
      </div>
    </div>

    <div v-if="serviceToDelete" class="modal-overlay" @click.self="serviceToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir serviço</h3>
        <p>Excluir <strong>{{ serviceToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deleting" @click="doDelete">
            {{ deleting ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="serviceToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getServices, createService, updateService, deleteService } from '../../services/services.js'

const services = ref([])
const loading = ref(true)
const loadError = ref('')
const activeCategory = ref(null)

const categories = computed(() => {
  const set = new Set(services.value.map(s => s.category).filter(Boolean))
  return [...set].sort()
})

const filteredServices = computed(() =>
  activeCategory.value
    ? services.value.filter(s => s.category === activeCategory.value)
    : services.value
)

function setCategory(cat) {
  activeCategory.value = cat
}

const showForm = ref(false)
const editingService = ref(null)
const saving = ref(false)
const formSuccess = ref(false)
const formError = ref('')
const form = reactive({ name: '', category: '', description: '' })
const formErrors = reactive({ name: '' })

function openCreateForm() {
  editingService.value = null
  form.name = ''; form.category = ''; form.description = ''
  formErrors.name = ''; formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function openEditForm(svc) {
  editingService.value = svc
  form.name = svc.name
  form.category = svc.category || ''
  form.description = svc.description || ''
  formErrors.name = ''; formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false; editingService.value = null
  form.name = ''; form.category = ''; form.description = ''
}

function validateForm() {
  formErrors.name = ''
  if (!form.name || form.name.length < 2) {
    formErrors.name = 'Nome deve ter pelo menos 2 caracteres.'
    return false
  }
  return true
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true; formError.value = ''; formSuccess.value = false
  try {
    const data = {
      name: form.name,
      ...(form.category ? { category: form.category } : {}),
      ...(form.description ? { description: form.description } : {}),
    }
    if (editingService.value) {
      const updated = await updateService(editingService.value.id, data)
      const idx = services.value.findIndex(s => s.id === editingService.value.id)
      if (idx !== -1) services.value[idx] = updated
    } else {
      const created = await createService(data)
      services.value.push(created)
      services.value.sort((a, b) => a.name.localeCompare(b.name))
    }
    formSuccess.value = true
    form.name = ''; form.category = ''; form.description = ''
    if (!editingService.value) showForm.value = false
  } catch (e) {
    if (e.response?.status === 409) formErrors.name = 'Já existe um serviço com esse nome.'
    else formError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

const serviceToDelete = ref(null)
const deleting = ref(false)

function confirmDelete(svc) { serviceToDelete.value = svc }

async function doDelete() {
  if (!serviceToDelete.value) return
  deleting.value = true
  try {
    await deleteService(serviceToDelete.value.id)
    services.value = services.value.filter(s => s.id !== serviceToDelete.value.id)
    serviceToDelete.value = null
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao excluir.'
    serviceToDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    services.value = await getServices()
  } catch (e) {
    loadError.value = 'Erro ao carregar serviços.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.top-bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-btn { padding: 8px 18px; border-radius: 30px; border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.filter-btn:hover { border-color: #00e5cc; color: #00897b; }
.filter-btn.active { background: #00e5cc; border-color: #00e5cc; color: #0d0d2b; font-weight: 700; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.form-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.form-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.85rem; font-weight: 600; color: #333; }
.required { color: #c0392b; }
.optional { font-weight: 400; color: #aaa; }
input[type="text"] { width: 100%; padding: 11px 18px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; box-sizing: border-box; }
input[type="text"].invalid { border: 2px solid #c0392b; background: #fff3f0; }
textarea { width: 100%; padding: 11px 18px; border: none; border-radius: 12px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; resize: vertical; box-sizing: border-box; font-family: inherit; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 4px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-save { padding: 10px 28px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 10px 28px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: bold; color: #333; cursor: pointer; }
.alert { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.table-header { display: grid; grid-template-columns: 2fr 1.2fr 2fr auto; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 2px solid #eee; margin-bottom: 4px; }
.table-row { display: grid; grid-template-columns: 2fr 1.2fr 2fr auto; padding: 14px 20px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; background: #fff; border-radius: 8px; margin-bottom: 4px; }
.table-row:hover { background: #f9f9f9; }
.svc-name { font-weight: 600; color: #1a1a2e; }
.svc-desc { color: #777; font-size: 0.83rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.category-tag { background: #e8e8e8; color: #333; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
.no-category { color: #bbb; }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
.btn-icon { background: none; border: none; color: #bbb; cursor: pointer; font-size: 0.9rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-icon:hover { color: #555; }
.btn-icon.danger:hover { color: #c0392b; }
.state { text-align: center; padding: 40px; color: #888; }
.error { color: red; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.1rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.88rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; }
.btn-confirm-delete { padding: 10px 24px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
