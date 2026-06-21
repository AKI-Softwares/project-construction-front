<template>
  <MainLayout titulo="Templates de Funções">

    <div class="info-banner">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="info-icon" />
      <div>
        <strong>O que são templates?</strong>
        <p>
          Templates de função são copiados automaticamente para empresas que passam de
          PENDING para ACTIVE. O template "Company Admin" não pode ser excluído nem editado.
        </p>
      </div>
    </div>

    <div class="header-row">
      <button class="btn-primary" @click="openCreateForm">
        <FontAwesomeIcon :icon="['fas', 'plus']" /> Novo template
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3 class="form-title">{{ editingTemplate ? 'Editar template' : 'Novo template de função' }}</h3>
      <div v-if="formSuccess" class="alert success">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" />
        {{ editingTemplate ? 'Template atualizado!' : 'Template criado com sucesso!' }}
      </div>
      <div v-if="formError" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ formError }}
      </div>

      <div class="form-group">
        <label>Nome</label>
        <input v-model="form.name" type="text" placeholder="Ex: Inspetor, Gerente de Obras..." :class="{ invalid: formErrors.name }" />
        <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
      </div>

      <div class="form-group">
        <label>Descrição <span class="optional">(opcional)</span></label>
        <input v-model="form.description" type="text" placeholder="Breve descrição das responsabilidades" />
      </div>

      <div class="form-group">
        <label>Permissões</label>
        <span v-if="formErrors.permissionIds" class="field-error">{{ formErrors.permissionIds }}</span>
        <div v-if="loadingPermissions" class="state small">Carregando permissões...</div>
        <div v-else class="permissions-grid">
          <div v-for="group in permissionGroups" :key="group.resource" class="perm-group">
            <div class="perm-group-header">
              <input
                type="checkbox"
                :id="'group-' + group.resource"
                :checked="isGroupChecked(group)"
                :indeterminate.prop="isGroupIndeterminate(group)"
                @change="toggleGroup(group)"
              />
              <label :for="'group-' + group.resource" class="perm-group-label">{{ groupLabel(group.resource) }}</label>
            </div>
            <div class="perm-items">
              <label v-for="perm in group.permissions" :key="perm.id" class="perm-item">
                <input type="checkbox" :value="perm.id" v-model="form.permissionIds" />
                {{ operationLabel(perm.operation) }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-save" :disabled="saving" @click="submitForm">
          {{ saving ? 'Salvando...' : 'Salvar template' }}
        </button>
        <button class="btn-cancel" @click="closeForm">Cancelar</button>
      </div>
    </div>

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>

    <div v-if="!loading && !loadError" class="templates-list">
      <div v-for="t in templates" :key="t.id" class="template-card">
        <div class="template-info">
          <div class="template-name-row">
            <span class="template-name">{{ t.name }}</span>
            <span v-if="t.isSystem" class="system-tag">Sistema</span>
          </div>
          <span v-if="t.description" class="template-desc">{{ t.description }}</span>
          <div class="template-perms">
            <span v-for="perm in t.permissions.slice(0, 8)" :key="perm.id" class="perm-tag">{{ perm.action }}</span>
            <span v-if="t.permissions.length > 8" class="perm-tag more">+{{ t.permissions.length - 8 }}</span>
          </div>
        </div>
        <div class="template-actions">
          <button v-if="!t.isSystem" class="btn-icon" @click="openEditForm(t)" title="Editar">
            <FontAwesomeIcon :icon="['fas', 'pen']" />
          </button>
          <button v-if="!t.isSystem" class="btn-icon danger" @click="confirmDelete(t)" title="Excluir">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
        </div>
      </div>
      <div v-if="templates.length === 0" class="state">Nenhum template cadastrado.</div>
    </div>

    <div v-if="templateToDelete" class="modal-overlay" @click.self="templateToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir template</h3>
        <p>Excluir <strong>{{ templateToDelete.name }}</strong>? Empresas já ativadas não são afetadas.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deleting" @click="doDelete">
            {{ deleting ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="templateToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../../../components/Layout/MainLayout.vue'
import {
  getRoleTemplates, createRoleTemplate, updateRoleTemplate, deleteRoleTemplate,
} from '../../../services/platform.js'
import { getPermissions } from '../../../services/permissions.js'

const templates = ref([])
const loading = ref(true)
const loadError = ref('')

const showForm = ref(false)
const editingTemplate = ref(null)
const saving = ref(false)
const formSuccess = ref(false)
const formError = ref('')
const form = reactive({ name: '', description: '', permissionIds: [] })
const formErrors = reactive({ name: '', permissionIds: '' })

const permissions = ref([])
const loadingPermissions = ref(true)

const permissionGroups = computed(() => {
  const map = new Map()
  for (const perm of permissions.value) {
    if (!map.has(perm.resource)) map.set(perm.resource, { resource: perm.resource, permissions: [] })
    map.get(perm.resource).permissions.push(perm)
  }
  return [...map.values()].sort((a, b) => a.resource.localeCompare(b.resource))
})

const GROUP_LABELS = {
  users: 'Usuários', roles: 'Funções', buildings: 'Empreendimentos',
  apartments: 'Apartamentos', checklists: 'Checklists', inspections: 'Inspeções',
  services: 'Serviços', permissions: 'Permissões', analytics: 'Analytics',
  'apartment-types': 'Tipos de Apto', visits: 'Visitas', photos: 'Fotos',
  'non-conformities': 'Não Conformidades',
}
function groupLabel(resource) { return GROUP_LABELS[resource] || resource }

const OPERATION_LABELS = { read: 'Visualizar', create: 'Criar', update: 'Editar', delete: 'Excluir' }
function operationLabel(op) { return OPERATION_LABELS[op] || op }

function isGroupChecked(group) {
  return group.permissions.every(p => form.permissionIds.includes(p.id))
}
function isGroupIndeterminate(group) {
  const checked = group.permissions.filter(p => form.permissionIds.includes(p.id))
  return checked.length > 0 && checked.length < group.permissions.length
}
function toggleGroup(group) {
  if (isGroupChecked(group)) {
    form.permissionIds = form.permissionIds.filter(id => !group.permissions.map(p => p.id).includes(id))
  } else {
    const toAdd = group.permissions.map(p => p.id).filter(id => !form.permissionIds.includes(id))
    form.permissionIds.push(...toAdd)
  }
}

function openCreateForm() {
  editingTemplate.value = null
  form.name = ''; form.description = ''; form.permissionIds = []
  formErrors.name = ''; formErrors.permissionIds = ''
  formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function openEditForm(t) {
  editingTemplate.value = t
  form.name = t.name
  form.description = t.description || ''
  form.permissionIds = t.permissions.map(p => p.id)
  formErrors.name = ''; formErrors.permissionIds = ''
  formSuccess.value = false; formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false; editingTemplate.value = null
  form.name = ''; form.description = ''; form.permissionIds = []
}

function validateForm() {
  formErrors.name = ''; formErrors.permissionIds = ''
  let valid = true
  if (!form.name || form.name.length < 2) { formErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; valid = false }
  if (form.permissionIds.length === 0) { formErrors.permissionIds = 'Selecione ao menos uma permissão.'; valid = false }
  return valid
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true; formError.value = ''; formSuccess.value = false
  try {
    const data = {
      name: form.name,
      ...(form.description ? { description: form.description } : {}),
      permissionIds: form.permissionIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0),
    }
    if (editingTemplate.value) {
      const updated = await updateRoleTemplate(editingTemplate.value.id, data)
      const idx = templates.value.findIndex(t => t.id === editingTemplate.value.id)
      if (idx !== -1) templates.value[idx] = updated
    } else {
      const created = await createRoleTemplate(data)
      templates.value.push(created)
    }
    formSuccess.value = true
    form.name = ''; form.description = ''; form.permissionIds = []
    if (!editingTemplate.value) showForm.value = false
  } catch (e) {
    if (e.response?.status === 409) formErrors.name = 'Já existe um template com esse nome.'
    else formError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

const templateToDelete = ref(null)
const deleting = ref(false)

function confirmDelete(t) { templateToDelete.value = t }

async function doDelete() {
  if (!templateToDelete.value) return
  deleting.value = true
  try {
    await deleteRoleTemplate(templateToDelete.value.id)
    templates.value = templates.value.filter(t => t.id !== templateToDelete.value.id)
    templateToDelete.value = null
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao excluir.'
    templateToDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  const [t, p] = await Promise.allSettled([getRoleTemplates(), getPermissions()])
  if (t.status === 'fulfilled') templates.value = t.value
  else loadError.value = 'Erro ao carregar templates.'
  loading.value = false

  if (p.status === 'fulfilled') permissions.value = p.value
  loadingPermissions.value = false
})
</script>

<style scoped>
.info-banner { display: flex; gap: 14px; background: #f0fdfb; border: 1px solid #00e5cc; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 0.85rem; color: #333; }
.info-icon { color: #00897b; font-size: 1.2rem; margin-top: 2px; flex-shrink: 0; }
.info-banner strong { display: block; margin-bottom: 4px; color: #1a1a2e; }
.info-banner p { margin: 0; line-height: 1.5; color: #555; }

.header-row { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }

.form-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; max-width: 860px; display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px; }
.form-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 0.9rem; font-weight: 500; color: #333; }
.optional { font-weight: 400; color: #aaa; }
input[type="text"] { padding: 12px 20px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.95rem; outline: none; color: #333; }
input[type="text"].invalid { border: 2px solid #c0392b; background: #fff3f0; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 4px; }

.permissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; padding: 16px; background: #f8f8f8; border-radius: 12px; }
.perm-group { display: flex; flex-direction: column; gap: 8px; }
.perm-group-header { display: flex; align-items: center; gap: 8px; }
.perm-group-label { font-size: 0.85rem; font-weight: 700; color: #1a1a2e; cursor: pointer; }
.perm-items { display: flex; flex-direction: column; gap: 6px; padding-left: 20px; }
.perm-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #444; cursor: pointer; }
.perm-item input, .perm-group-header input { cursor: pointer; accent-color: #00e5cc; }

.form-actions { display: flex; gap: 16px; justify-content: flex-end; }
.btn-save { padding: 12px 32px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 12px 32px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #333; cursor: pointer; }

.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }

.state { text-align: center; padding: 40px; color: #888; }
.state.small { padding: 16px; font-size: 0.85rem; }
.error { color: red; }

.templates-list { display: flex; flex-direction: column; gap: 12px; }
.template-card { display: flex; align-items: flex-start; justify-content: space-between; background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #eee; }
.template-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.template-name-row { display: flex; align-items: center; gap: 10px; }
.template-name { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
.system-tag { background: #0d0d2b; color: #fff; font-size: 0.68rem; padding: 2px 10px; border-radius: 20px; font-weight: 700; }
.template-desc { font-size: 0.85rem; color: #777; }
.template-perms { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.perm-tag { background: #e8e8e8; color: #333; font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; }
.perm-tag.more { background: #0d0d2b; color: #fff; }
.template-actions { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; color: #bbb; cursor: pointer; font-size: 0.9rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-icon:hover { color: #555; }
.btn-icon.danger:hover { color: #c0392b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.2rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.9rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; margin-top: 8px; }
.btn-confirm-delete { padding: 12px 28px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.95rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
