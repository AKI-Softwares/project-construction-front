<template>
  <MainLayout titulo="Equipe">

    <div class="tabs">
      <button :class="['tab-btn', { active: tab === 'users' }]" @click="tab = 'users'">
        <FontAwesomeIcon :icon="['fas', 'users']" /> Usuários
      </button>
      <button :class="['tab-btn', { active: tab === 'roles' }]" @click="tab = 'roles'">
        <FontAwesomeIcon :icon="['fas', 'shield-halved']" /> Funções
      </button>
    </div>
    <hr class="divider" />

    <div v-if="tab === 'users'">
      <div class="header-row">
        <button class="btn-primary" @click="goToRegister">
          <FontAwesomeIcon :icon="['fas', 'user-plus']" /> Cadastrar usuário
        </button>
      </div>
      <div v-if="loadingUsers" class="state">Carregando...</div>
      <div v-if="userError" class="state error">{{ userError }}</div>
      <div v-if="!loadingUsers && !userError" class="user-list">
        <div v-for="user in users" :key="user.id" class="user-card">
          <FontAwesomeIcon :icon="['fas', 'user']" class="user-icon" />
          <span class="user-name">{{ user.name }}</span>
          <span class="user-separator">-</span>
          <span class="user-role">
            <span v-if="user.isCompanyAdmin" class="role-badge-admin">Administrador</span>
            <span v-else>{{ user.role?.name || '—' }}</span>
          </span>
          <button class="btn-delete" @click="confirmDelete(user)" title="Excluir usuário">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
        </div>
        <div v-if="users.length === 0" class="state">Nenhum usuário cadastrado.</div>
      </div>
    </div>

    <div v-if="tab === 'roles'">
      <div class="header-row">
        <button class="btn-primary" @click="openCreateForm">
          <FontAwesomeIcon :icon="['fas', 'plus']" /> Nova função
        </button>
      </div>

      <div v-if="showRoleForm" class="form-card">
        <h3 class="form-title">{{ editingRole ? 'Editar função' : 'Criar nova função' }}</h3>
        
        <div v-if="roleFormSuccess" class="alert success">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> {{ editingRole ? 'Função atualizada com sucesso!' : 'Função criada com sucesso!' }}
        </div>
        <div v-if="roleFormError" class="alert error">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ roleFormError }}
        </div>

        <div v-if="editingRole?.isSystem" class="alert info">
          <FontAwesomeIcon :icon="['fas', 'circle-info']" />
          Esta é uma função de sistema. O nome e a descrição podem ser alterados, mas é necessário manter ao menos uma permissão marcada.
        </div>

        <div class="form-group">
          <label>Nome da função</label>
          <input v-model="roleForm.name" type="text" placeholder="Ex: Inspetor de Campo, Gerente de Obras..." :class="{ invalid: roleFormErrors.name }" />
          <span v-if="roleFormErrors.name" class="field-error">{{ roleFormErrors.name }}</span>
        </div>

        <div class="form-group">
          <label>Descrição <span class="optional">(opcional)</span></label>
          <input v-model="roleForm.description" type="text" placeholder="Breve descrição das responsabilidades e acessos" />
        </div>

        <div class="form-group">
          <label>Definição de Acessos e Permissões do Sistema</label>
          <span v-if="roleFormErrors.permissionIds" class="field-error">{{ roleFormErrors.permissionIds }}</span>
          <div v-if="loadingPermissions" class="state small">Carregando matriz de permissões...</div>
          
          <div v-else class="permissions-grid">
            <div v-for="group in permissionGroups" :key="group.resource" class="perm-group-card">
              
              <div class="perm-group-header">
                <input type="checkbox" :id="'group-' + group.resource" :checked="isGroupChecked(group)" :indeterminate.prop="isGroupIndeterminate(group)" @change="toggleGroup(group)" />
                <label :for="'group-' + group.resource" class="perm-group-label">
                  {{ groupLabel(group.resource) }}
                </label>
              </div>

              <div class="perm-items">
                <label v-for="perm in group.permissions" :key="perm.id" class="perm-item">
                  <input type="checkbox" :value="perm.id" v-model="roleForm.permissionIds" />
                  <span class="perm-op-text">{{ operationLabel(perm.operation) }} {{ groupLabel(group.resource).toLowerCase() }}</span>
                </label>
              </div>

            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingRole" @click="submitRole">
            {{ savingRole ? 'Salvando...' : editingRole ? 'Salvar alterações' : 'Salvar função' }}
          </button>
          <button class="btn-cancel" @click="cancelRoleForm">Cancelar</button>
        </div>
      </div>

      <div v-if="loadingRoles" class="state">Carregando funções...</div>
      <div v-if="rolesError" class="state error">{{ rolesError }}</div>
      
      <div v-if="!loadingRoles && !rolesError" class="roles-list">
        <div v-for="role in roles" :key="role.id" class="role-card">
          <div class="role-info">
            <span class="role-name">{{ role.name }}</span>
            <span v-if="role.description" class="role-desc">{{ role.description }}</span>
            
            <div class="role-perms">
              <span v-for="perm in role.permissions.slice(0, 6)" :key="perm.id" class="perm-tag">
                {{ traduzirAcaoBanco(perm.action, perm.resource) }}
              </span>
              <span v-if="role.permissions.length > 6" class="perm-tag more">+{{ role.permissions.length - 6 }}</span>
            </div>
          </div>

          <div class="role-meta">
            <span class="role-count">{{ role._count.users }} usuário{{ role._count.users !== 1 ? 's' : '' }}</span>
            <button class="btn-icon-edit" @click="openEditForm(role)" title="Editar função">
              <FontAwesomeIcon :icon="['fas', 'pen']" />
            </button>
            <button v-if="!role.isSystem && role._count.users === 0" class="btn-delete" @click="confirmDeleteRole(role)" title="Excluir função">
              <FontAwesomeIcon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
        <div v-if="roles.length === 0" class="state">Nenhuma função cadastrada.</div>
      </div>
    </div>

    <div v-if="userToDelete" class="modal-overlay" @click.self="userToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir usuário</h3>
        <p>Tem certeza que deseja excluir <strong>{{ userToDelete.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deleting" @click="doDeleteUser">{{ deleting ? 'Excluindo...' : 'Sim, excluir' }}</button>
          <button class="btn-cancel" @click="userToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="roleToDelete" class="modal-overlay" @click.self="roleToDelete = null">
      <div class="modal">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir função</h3>
        <p>Tem certeza que deseja excluir a função <strong>{{ roleToDelete.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingRole" @click="doDeleteRole">{{ deletingRole ? 'Excluindo...' : 'Sim, excluir' }}</button>
          <button class="btn-cancel" @click="roleToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getUsers, deleteUser } from '../../services/users.js'
import { getRoles, createRole, updateRole, deleteRole } from '../../services/roles.js'
import { getPermissions } from '../../services/permissions.js'

const router = useRouter()
const tab = ref('users')

const users = ref([])
const loadingUsers = ref(true)
const userError = ref('')
const userToDelete = ref(null)
const deleting = ref(false)

function goToRegister() { router.push('/team/register') }
function confirmDelete(user) { userToDelete.value = user }

async function doDeleteUser() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await deleteUser(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    userToDelete.value = null
  } catch (e) {
    userError.value = e.response?.data?.message || 'Erro ao excluir usuário.'
    userToDelete.value = null
  } finally {
    deleting.value = false
  }
}

const roles = ref([])
const loadingRoles = ref(true)
const rolesError = ref('')
const showRoleForm = ref(false)
const editingRole = ref(null) // null = criar, objeto = editar
const savingRole = ref(false)
const roleFormSuccess = ref(false)
const roleFormError = ref('')
const roleToDelete = ref(null)
const deletingRole = ref(false)

const roleForm = reactive({ name: '', description: '', permissionIds: [] })
const roleFormErrors = reactive({ name: '', permissionIds: '' })

const permissions = ref([])
const loadingPermissions = ref(true)

const permissionGroups = computed(() => {
  return [...permissions.value].sort((a, b) => a.resource.localeCompare(b.resource))
})

// Mapeamento dos Módulos Focados em Negócio e Telas
const GROUP_LABELS = {
  analytics: 'Dashboard e Indicadores',
  visits: 'Acesso ao Mobile (Vistorias)',
  inspections: 'Inspeções de Campo',
  checklists: 'Checklists de Unidades',
  'non-conformities': 'Não Conformidades',
  buildings: 'Empreendimentos (Obras)',
  apartments: 'Unidades (Apartamentos)',
  'apartment-types': 'Tipos de Apartamento',
  services: 'Catálogo de Serviços',
  users: 'Gestão da Equipe (Usuários)',
  roles: 'Controle de Funções e Perfis',
  permissions: 'Chaves de Sistema',
  photos: 'Mídia e Fotos de Reparo'
}
function groupLabel(resource) { return GROUP_LABELS[resource] || resource }

const OPERATION_LABELS = { 
  read: 'Visualizar', 
  create: 'Criar/Cadastrar', 
  update: 'Editar/Atualizar', 
  delete: 'Excluir' 
}
function operationLabel(op) { return OPERATION_LABELS[op] || op }

// Função mágica para ler strings em inglês do banco (ex: "create:buildings") e traduzir no Front
function traduzirAcaoBanco(actionString, resource) {
  if (!actionString) return '—'
  const op = actionString.includes(':') ? actionString.split(':')[0] : actionString
  const traduzaoOp = OPERATION_LABELS[op] || op
  const traducaoModulo = GROUP_LABELS[resource] || resource
  
  return `${traduzaoOp} ${traducaoModulo}`
}

function isGroupChecked(group) {
  return group.permissions.every(p => roleForm.permissionIds.includes(Number(p.id)))
}
function isGroupIndeterminate(group) {
  const checked = group.permissions.filter(p => roleForm.permissionIds.includes(Number(p.id)))
  return checked.length > 0 && checked.length < group.permissions.length
}
function toggleGroup(group) {
  if (isGroupChecked(group)) {
    const groupIds = group.permissions.map(p => Number(p.id))
    roleForm.permissionIds = roleForm.permissionIds.filter(id => !groupIds.includes(Number(id)))
  } else {
    const toAdd = group.permissions.map(p => Number(p.id)).filter(id => !roleForm.permissionIds.includes(id))
    roleForm.permissionIds.push(...toAdd)
  }
}

function validateRoleForm() {
  roleFormErrors.name = ''
  roleFormErrors.permissionIds = ''
  let valid = true
  if (!roleForm.name || roleForm.name.length < 2) { roleFormErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; valid = false }
  if (roleForm.permissionIds.length === 0) { roleFormErrors.permissionIds = 'Selecione ao menos uma permissão.'; valid = false }
  return valid
}

function openCreateForm() {
  editingRole.value = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissionIds = []
  roleFormErrors.name = ''
  roleFormErrors.permissionIds = ''
  roleFormError.value = ''
  roleFormSuccess.value = false
  showRoleForm.value = true
}

function openEditForm(role) {
  editingRole.value = role
  roleForm.name = role.name
  roleForm.description = role.description || ''
  roleForm.permissionIds = role.permissions.map(p => Number(p.id))
  roleFormErrors.name = ''
  roleFormErrors.permissionIds = ''
  roleFormError.value = ''
  roleFormSuccess.value = false
  showRoleForm.value = true
}

async function submitRole() {
  roleFormError.value = ''
  roleFormSuccess.value = false
  if (!validateRoleForm()) return
  savingRole.value = true
  try {
    const payload = {
      name: roleForm.name,
      description: roleForm.description || undefined,
      permissionIds: roleForm.permissionIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0),
    }
    if (editingRole.value) {
      const updated = await updateRole(editingRole.value.id, payload)
      const idx = roles.value.findIndex(r => r.id === editingRole.value.id)
      if (idx !== -1) roles.value[idx] = updated
      roleFormSuccess.value = true
    } else {
      const created = await createRole(payload)
      roles.value.push(created)
      roleFormSuccess.value = true
      roleForm.name = ''
      roleForm.description = ''
      roleForm.permissionIds = []
    }
  } catch (e) {
    if (e.response?.status === 409) roleFormErrors.name = 'Já existe uma função com esse nome.'
    else if (e.response?.status === 403) roleFormError.value = 'Funções de sistema precisam manter ao menos uma permissão.'
    else roleFormError.value = e.response?.data?.message || 'Erro ao salvar função.'
  } finally {
    savingRole.value = false
  }
}

function cancelRoleForm() {
  showRoleForm.value = false
  editingRole.value = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissionIds = []
  roleFormErrors.name = ''
  roleFormErrors.permissionIds = ''
  roleFormError.value = ''
  roleFormSuccess.value = false
}

function confirmDeleteRole(role) { roleToDelete.value = role }

async function doDeleteRole() {
  if (!roleToDelete.value) return
  deletingRole.value = true
  try {
    await deleteRole(roleToDelete.value.id)
    roles.value = roles.value.filter(r => r.id !== roleToDelete.value.id)
    roleToDelete.value = null
  } catch (e) {
    rolesError.value = e.response?.data?.message || 'Erro ao excluir função.'
    roleToDelete.value = null
  } finally {
    deletingRole.value = false
  }
}

onMounted(async () => {
  const [u, r, p] = await Promise.allSettled([getUsers(), getRoles(), getPermissions()])
  if (u.status === 'fulfilled') users.value = u.value
  else userError.value = 'Erro ao carregar usuários.'
  loadingUsers.value = false
  if (r.status === 'fulfilled') roles.value = r.value
  else rolesError.value = 'Erro ao carregar funções.'
  loadingRoles.value = false
  if (p.status === 'fulfilled') permissions.value = p.value
  loadingPermissions.value = false
})
</script>

<style scoped>
.tabs { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 16px; }
.tab-btn { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 30px; border: none; background: #0d0d2b; color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.tab-btn.active { background: #00e5cc; color: #0d0d2b; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin-bottom: 28px; }
.header-row { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.btn-primary { display: flex; align-items: center; gap: 10px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 14px 28px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #1a1a4e; }
.state { text-align: center; padding: 40px; color: #555; }
.state.small { padding: 16px; font-size: 0.85rem; }
.error { color: red; }
.user-list { display: flex; flex-direction: column; gap: 12px; }
.user-card { display: flex; align-items: center; gap: 16px; background: #2c3e50; border-radius: 12px; padding: 20px 24px; color: #fff; font-size: 1rem; }
.user-icon { font-size: 1.3rem; color: #00e5cc; }
.user-name { font-weight: 500; }
.user-separator { color: rgba(255,255,255,0.5); }
.user-role { color: rgba(255,255,255,0.85); flex: 1; }
.role-badge-admin { background: #00e5cc; color: #0b1120; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
.roles-list { display: flex; flex-direction: column; gap: 12px; }
.role-card { display: flex; align-items: flex-start; justify-content: space-between; background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.role-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.role-name { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
.role-desc { font-size: 0.85rem; color: #777; }
.role-perms { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.perm-tag { background: #f0f1f5; color: #4a5568; font-size: 0.72rem; padding: 4px 12px; border-radius: 20px; font-weight: 500; border: 1px solid #e2e8f0; }
.perm-tag.more { background: #0d0d2b; color: #fff; border: none; }
.role-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.role-count { font-size: 0.82rem; color: #888; white-space: nowrap; font-weight: 500; }
.form-card { background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #eee; max-width: 900px; display: flex; flex-direction: column; gap: 24px; margin-bottom: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.form-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 0.9rem; font-weight: 600; color: #2d3748; }
.optional { font-weight: 400; color: #aaa; }
input[type="text"] { padding: 14px 20px; border: none; border-radius: 30px; background: #f0f2f5; font-size: 0.95rem; outline: none; color: #333; transition: background 0.2s; }
input[type="text"]:focus { background: #e2e8f0; }
input[type="text"].invalid { border: 2px solid #c0392b; background: #fff3f0; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 4px; font-weight: 500; }
.permissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; padding: 4px 0; }
.perm-group-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.perm-group-header { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; }
.perm-group-label { font-size: 0.88rem; font-weight: 700; color: #0d0d2b; cursor: pointer; }
.perm-items { display: flex; flex-direction: column; gap: 8px; padding-left: 4px; }
.perm-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.82rem; color: #4a5568; cursor: pointer; line-height: 1.4; }
.perm-op-text { padding-top: 1px; }
.perm-item input, .perm-group-header input { cursor: pointer; accent-color: #00e5cc; width: 15px; height: 15px; }
.form-actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 12px; }
.btn-save { padding: 14px 36px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 14px 36px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #333; cursor: pointer; }
.btn-delete { background: none; border: none; color: #cbd5e0; cursor: pointer; font-size: 1rem; padding: 6px 8px; border-radius: 6px; transition: color 0.2s; }
.btn-delete:hover { color: #c0392b; }
.btn-icon-edit { background: none; border: none; color: #cbd5e0; cursor: pointer; font-size: 0.9rem; padding: 6px 8px; border-radius: 6px; transition: color 0.2s; }
.btn-icon-edit:hover { color: #00897b; }
.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.alert.info { background: #f0f7ff; color: #2563eb; border: 1px solid #93c5fd; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.2rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.9rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; margin-top: 8px; }
.btn-confirm-delete { padding: 12px 28px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.95rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
