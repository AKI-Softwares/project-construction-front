
<template>
  <MainLayout titulo="Catálogo Global">

    <div class="info-banner">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="info-icon" />
      <div>
        <strong>Catálogo compartilhado</strong>
        <p>
          Estes serviços e tipos de apartamento são copiados automaticamente para toda
          empresa nova que é ativada (transição PENDING → ACTIVE). Tipos de apartamento
          aqui não têm cômodos/serviços vinculados — essa estrutura só existe no nível
          de cada empresa, após a cópia.
        </p>
      </div>
    </div>

    <div class="tabs">
      <button :class="['tab-btn', { active: tab === 'services' }]" @click="tab = 'services'">
        Serviços
      </button>
      <button :class="['tab-btn', { active: tab === 'types' }]" @click="tab = 'types'">
        Tipos de Apartamento
      </button>
    </div>
    <hr class="divider" />

    <!-- ===== TAB SERVIÇOS ===== -->
    <div v-if="tab === 'services'">
      <div class="header-row">
        <button class="btn-primary" @click="openServiceForm()">
          <FontAwesomeIcon :icon="['fas', 'plus']" /> Novo serviço
        </button>
      </div>

      <div v-if="showServiceForm" class="form-card">
        <h3 class="form-title">{{ editingService ? 'Editar serviço' : 'Novo serviço' }}</h3>
        <div v-if="svcFormSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Salvo!</div>
        <div v-if="svcFormError" class="alert error">{{ svcFormError }}</div>
        <div class="form-row">
          <div class="form-col">
            <label>Nome</label>
            <input v-model="serviceForm.name" type="text" placeholder="Ex: Pintura" :class="{ invalid: svcFormErrors.name }" />
            <span v-if="svcFormErrors.name" class="field-error">{{ svcFormErrors.name }}</span>
          </div>
          <div class="form-col">
            <label>Categoria</label>
            <input v-model="serviceForm.category" type="text" placeholder="Ex: Elétrica" list="cat-list" />
            <datalist id="cat-list"><option v-for="c in serviceCategories" :key="c" :value="c" /></datalist>
          </div>
        </div>
        <div class="form-col">
          <label>Descrição <span class="optional">(opcional)</span></label>
          <textarea v-model="serviceForm.description" rows="2"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingService" @click="submitService">{{ savingService ? 'Salvando...' : 'Salvar' }}</button>
          <button class="btn-cancel" @click="closeServiceForm">Cancelar</button>
        </div>
      </div>

      <div v-if="loadingServices" class="state">Carregando...</div>
      <div v-if="servicesError" class="state error">{{ servicesError }}</div>
      <div v-if="!loadingServices && !servicesError">
        <div class="table-header"><span>Nome</span><span>Categoria</span><span>Descrição</span><span></span></div>
        <div v-for="svc in services" :key="svc.id" class="table-row">
          <span class="row-name">{{ svc.name }}</span>
          <span><span v-if="svc.category" class="category-tag">{{ svc.category }}</span><span v-else class="muted">—</span></span>
          <span class="row-desc">{{ svc.description || '—' }}</span>
          <div class="row-actions">
            <button class="btn-icon" @click="openServiceForm(svc)" title="Editar"><FontAwesomeIcon :icon="['fas', 'pen']" /></button>
            <button class="btn-icon danger" @click="confirmDeleteService(svc)" title="Excluir"><FontAwesomeIcon :icon="['fas', 'trash']" /></button>
          </div>
        </div>
        <div v-if="services.length === 0" class="state">Nenhum serviço no catálogo global.</div>
      </div>
    </div>

    <!-- ===== TAB TIPOS DE APARTAMENTO ===== -->
    <div v-if="tab === 'types'">
      <div class="header-row">
        <button class="btn-primary" @click="openTypeForm()">
          <FontAwesomeIcon :icon="['fas', 'plus']" /> Novo tipo
        </button>
      </div>

      <div v-if="showTypeForm" class="form-card">
        <h3 class="form-title">{{ editingType ? 'Editar tipo' : 'Novo tipo de apartamento' }}</h3>
        <div v-if="typeFormSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Salvo!</div>
        <div v-if="typeFormError" class="alert error">{{ typeFormError }}</div>
        <div class="form-col">
          <label>Nome</label>
          <input v-model="typeForm.name" type="text" placeholder="Ex: Studio, 2 Quartos..." :class="{ invalid: typeFormErrors.name }" />
          <span v-if="typeFormErrors.name" class="field-error">{{ typeFormErrors.name }}</span>
        </div>
        <div class="form-col">
          <label>Descrição <span class="optional">(opcional)</span></label>
          <textarea v-model="typeForm.description" rows="2"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingType" @click="submitType">{{ savingType ? 'Salvando...' : 'Salvar' }}</button>
          <button class="btn-cancel" @click="closeTypeForm">Cancelar</button>
        </div>
      </div>

      <div v-if="loadingTypes" class="state">Carregando...</div>
      <div v-if="typesError" class="state error">{{ typesError }}</div>
      <div v-if="!loadingTypes && !typesError" class="type-grid">
        <div v-for="t in apartmentTypes" :key="t.id" class="type-card">
          <div class="type-card-info">
            <span class="type-name">{{ t.name }}</span>
            <span v-if="t.description" class="type-desc">{{ t.description }}</span>
          </div>
          <div class="type-card-actions">
            <button class="btn-icon" @click="openTypeForm(t)" title="Editar"><FontAwesomeIcon :icon="['fas', 'pen']" /></button>
            <button class="btn-icon danger" @click="confirmDeleteType(t)" title="Excluir"><FontAwesomeIcon :icon="['fas', 'trash']" /></button>
          </div>
        </div>
        <div v-if="apartmentTypes.length === 0" class="state">Nenhum tipo no catálogo global.</div>
      </div>
    </div>

    <!-- Modais de exclusão -->
    <div v-if="serviceToDelete" class="modal-overlay" @click.self="serviceToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir serviço</h3>
        <p>Excluir <strong>{{ serviceToDelete.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingService" @click="doDeleteService">{{ deletingService ? 'Excluindo...' : 'Sim, excluir' }}</button>
          <button class="btn-cancel" @click="serviceToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="typeToDelete" class="modal-overlay" @click.self="typeToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir tipo</h3>
        <p>Excluir <strong>{{ typeToDelete.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingType" @click="doDeleteType">{{ deletingType ? 'Excluindo...' : 'Sim, excluir' }}</button>
          <button class="btn-cancel" @click="typeToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../../../components/Layout/MainLayout.vue'
import {
  getCatalogServices, createCatalogService, updateCatalogService, deleteCatalogService,
  getCatalogApartmentTypes, createCatalogApartmentType, updateCatalogApartmentType, deleteCatalogApartmentType,
} from '../../../services/platform.js'

const tab = ref('services')

// ─── Serviços ───────────────────────────────────────────────────
const services = ref([])
const loadingServices = ref(true)
const servicesError = ref('')

const serviceCategories = computed(() => {
  const set = new Set(services.value.map(s => s.category).filter(Boolean))
  return [...set].sort()
})

const showServiceForm = ref(false)
const editingService = ref(null)
const savingService = ref(false)
const svcFormSuccess = ref(false)
const svcFormError = ref('')
const serviceForm = reactive({ name: '', category: '', description: '' })
const svcFormErrors = reactive({ name: '' })

function openServiceForm(svc) {
  editingService.value = svc || null
  serviceForm.name = svc?.name || ''
  serviceForm.category = svc?.category || ''
  serviceForm.description = svc?.description || ''
  svcFormErrors.name = ''; svcFormSuccess.value = false; svcFormError.value = ''
  showServiceForm.value = true
}
function closeServiceForm() { showServiceForm.value = false; editingService.value = null }

async function submitService() {
  svcFormErrors.name = ''
  if (!serviceForm.name || serviceForm.name.length < 2) { svcFormErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; return }
  savingService.value = true; svcFormError.value = ''; svcFormSuccess.value = false
  try {
    const data = {
      name: serviceForm.name,
      ...(serviceForm.category ? { category: serviceForm.category } : {}),
      ...(serviceForm.description ? { description: serviceForm.description } : {}),
    }
    if (editingService.value) {
      const updated = await updateCatalogService(editingService.value.id, data)
      const idx = services.value.findIndex(s => s.id === editingService.value.id)
      if (idx !== -1) services.value[idx] = updated
    } else {
      const created = await createCatalogService(data)
      services.value.push(created)
      services.value.sort((a, b) => a.name.localeCompare(b.name))
    }
    svcFormSuccess.value = true
    serviceForm.name = ''; serviceForm.category = ''; serviceForm.description = ''
    if (!editingService.value) showServiceForm.value = false
  } catch (e) {
    if (e.response?.status === 409) svcFormErrors.name = 'Já existe um serviço com esse nome.'
    else svcFormError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    savingService.value = false
  }
}

const serviceToDelete = ref(null)
const deletingService = ref(false)
function confirmDeleteService(svc) { serviceToDelete.value = svc }
async function doDeleteService() {
  if (!serviceToDelete.value) return
  deletingService.value = true
  try {
    await deleteCatalogService(serviceToDelete.value.id)
    services.value = services.value.filter(s => s.id !== serviceToDelete.value.id)
    serviceToDelete.value = null
  } catch (e) {
    servicesError.value = e.response?.data?.message || 'Erro ao excluir.'
    serviceToDelete.value = null
  } finally {
    deletingService.value = false
  }
}

// ─── Tipos de Apartamento ─────────────────────────────────────
const apartmentTypes = ref([])
const loadingTypes = ref(true)
const typesError = ref('')

const showTypeForm = ref(false)
const editingType = ref(null)
const savingType = ref(false)
const typeFormSuccess = ref(false)
const typeFormError = ref('')
const typeForm = reactive({ name: '', description: '' })
const typeFormErrors = reactive({ name: '' })

function openTypeForm(t) {
  editingType.value = t || null
  typeForm.name = t?.name || ''
  typeForm.description = t?.description || ''
  typeFormErrors.name = ''; typeFormSuccess.value = false; typeFormError.value = ''
  showTypeForm.value = true
}
function closeTypeForm() { showTypeForm.value = false; editingType.value = null }

async function submitType() {
  typeFormErrors.name = ''
  if (!typeForm.name || typeForm.name.length < 2) { typeFormErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; return }
  savingType.value = true; typeFormError.value = ''; typeFormSuccess.value = false
  try {
    const data = { name: typeForm.name, ...(typeForm.description ? { description: typeForm.description } : {}) }
    if (editingType.value) {
      const updated = await updateCatalogApartmentType(editingType.value.id, data)
      const idx = apartmentTypes.value.findIndex(t => t.id === editingType.value.id)
      if (idx !== -1) apartmentTypes.value[idx] = updated
    } else {
      const created = await createCatalogApartmentType(data)
      apartmentTypes.value.push(created)
      apartmentTypes.value.sort((a, b) => a.name.localeCompare(b.name))
    }
    typeFormSuccess.value = true
    typeForm.name = ''; typeForm.description = ''
    if (!editingType.value) showTypeForm.value = false
  } catch (e) {
    if (e.response?.status === 409) typeFormErrors.name = 'Já existe um tipo com esse nome.'
    else typeFormError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    savingType.value = false
  }
}

const typeToDelete = ref(null)
const deletingType = ref(false)
function confirmDeleteType(t) { typeToDelete.value = t }
async function doDeleteType() {
  if (!typeToDelete.value) return
  deletingType.value = true
  try {
    await deleteCatalogApartmentType(typeToDelete.value.id)
    apartmentTypes.value = apartmentTypes.value.filter(t => t.id !== typeToDelete.value.id)
    typeToDelete.value = null
  } catch (e) {
    typesError.value = e.response?.data?.message || 'Erro ao excluir.'
    typeToDelete.value = null
  } finally {
    deletingType.value = false
  }
}

onMounted(async () => {
  const [s, t] = await Promise.allSettled([getCatalogServices(), getCatalogApartmentTypes()])
  if (s.status === 'fulfilled') services.value = s.value
  else servicesError.value = 'Erro ao carregar serviços.'
  loadingServices.value = false

  if (t.status === 'fulfilled') apartmentTypes.value = t.value
  else typesError.value = 'Erro ao carregar tipos.'
  loadingTypes.value = false
})
</script>

<style scoped>
.info-banner { display: flex; gap: 14px; background: #f0fdfb; border: 1px solid #00e5cc; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 0.85rem; color: #333; }
.info-icon { color: #00897b; font-size: 1.2rem; margin-top: 2px; flex-shrink: 0; }
.info-banner strong { display: block; margin-bottom: 4px; color: #1a1a2e; }
.info-banner p { margin: 0; line-height: 1.5; color: #555; }

.tabs { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 16px; }
.tab-btn { padding: 12px 28px; border-radius: 30px; border: none; background: #0d0d2b; color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.tab-btn.active { background: #00e5cc; color: #0d0d2b; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin-bottom: 28px; }

.header-row { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }

.form-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; max-width: 700px; }
.form-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.85rem; font-weight: 600; color: #333; }
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

.state { text-align: center; padding: 40px; color: #888; }
.error { color: red; }

.table-header { display: grid; grid-template-columns: 2fr 1.2fr 2fr auto; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 2px solid #eee; margin-bottom: 4px; }
.table-row { display: grid; grid-template-columns: 2fr 1.2fr 2fr auto; padding: 14px 20px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; background: #fff; border-radius: 8px; margin-bottom: 4px; }
.row-name { font-weight: 600; color: #1a1a2e; }
.row-desc { color: #777; font-size: 0.83rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.category-tag { background: #e8e8e8; color: #333; padding: 3px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
.muted { color: #bbb; }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
.btn-icon { background: none; border: none; color: #bbb; cursor: pointer; font-size: 0.9rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-icon:hover { color: #555; }
.btn-icon.danger:hover { color: #c0392b; }

.type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.type-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.type-card-info { display: flex; flex-direction: column; gap: 4px; }
.type-name { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; }
.type-desc { font-size: 0.82rem; color: #777; }
.type-card-actions { display: flex; gap: 6px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.1rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.88rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; }
.btn-confirm-delete { padding: 10px 24px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
