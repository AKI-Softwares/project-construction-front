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
          <span class="user-role">{{ user.role?.name || '—' }}</span>
          <button class="btn-delete" @click="confirmDelete(user)" title="Excluir usuário">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
        </div>
        <div v-if="users.length === 0" class="state">Nenhum usuário cadastrado.</div>
      </div>
    </div>

    <div v-if="tab === 'roles'">
      <div class="header-row">
        <button class="btn-primary" @click="showRoleForm = !showRoleForm">
          <FontAwesomeIcon :icon="['fas', 'plus']" /> Nova função
        </button>
      </div>

      <div v-if="showRoleForm" class="form-card">
        <h3 class="form-title">Criar nova função</h3>
        <div v-if="roleFormSuccess" class="alert success">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Função criada com sucesso!
        </div>
        <div v-if="roleFormError" class="alert error">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ roleFormError }}
        </div>
        <div class="form-group">
          <label>Nome da função</label>
          <input v-model="roleForm.name" type="text" placeholder="Ex: Inspetor, Gerente de Obras..." :class="{ invalid: roleFormErrors.name }" />
          <span v-if="roleFormErrors.name" class="field-error">{{ roleFormErrors.name }}</span>
        </div>
        <div class="form-group">
          <label>Descrição <span class="optional">(opcional)</span></label>
          <input v-model="roleForm.description" type="text" placeholder="Breve descrição das responsabilidades" />
        </div>
        <div class="form-group">
          <label>Permissões</label>
          <span v-if="roleFormErrors.permissionIds" class="field-error">{{ roleFormErrors.permissionIds }}</span>
          <div v-if="loadingPermissions" class="state small">Carregando permissões...</div>
          <div v-else class="permissions-grid">
            <div v-for="group in permissionGroups" :key="group.resource" class="perm-group">
              <div class="perm-group-header">
                <input type="checkbox" :id="'group-' + group.resource" :checked="isGroupChecked(group)" :indeterminate.prop="isGroupIndeterminate(group)" @change="toggleGroup(group)" />
                <label :for="'group-' + group.resource" class="perm-group-label">{{ groupLabel(group.resource) }}</label>
              </div>
              <div class="perm-items">
                <label v-for="perm in group.permissions" :key="perm.id" class="perm-item">
                  <input type="checkbox" :value="perm.id" v-model="roleForm.permissionIds" />
                  {{ operationLabel(perm.operation) }}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingRole" @click="submitRole">
            {{ savingRole ? 'Salvando...' : 'Salvar função' }}
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
              <span v-for="perm in role.permissions.slice(0, 6)" :key="perm.id" class="perm-tag">{{ perm.action }}</span>
              <span v-if="role.permissions.length > 6" class="perm-tag more">+{{ role.permissions.length - 6 }}</span>
            </div>
          </div>
          <div class="role-meta">
            <span class="role-count">{{ role._count.users }} usuário{{ role._count.users !== 1 ? 's' : '' }}</span>
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
import { getRoles, createRole, deleteRole } from '../../services/roles.js'
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
  return group.permissions.every(p => roleForm.permissionIds.includes(p.id))
}
function isGroupIndeterminate(group) {
  const checked = group.permissions.filter(p => roleForm.permissionIds.includes(p.id))
  return checked.length > 0 && checked.length < group.permissions.length
}
function toggleGroup(group) {
  if (isGroupChecked(group)) {
    roleForm.permissionIds = roleForm.permissionIds.filter(id => !group.permissions.map(p => p.id).includes(id))
  } else {
    const toAdd = group.permissions.map(p => p.id).filter(id => !roleForm.permissionIds.includes(id))
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

async function submitRole() {
  roleFormError.value = ''
  roleFormSuccess.value = false
  if (!validateRoleForm()) return
  savingRole.value = true
  try {
    const created = await createRole({
      name: roleForm.name,
      description: roleForm.description || undefined,
      permissionIds: roleForm.permissionIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0),
    })
    roles.value.push(created)
    roleFormSuccess.value = true
    roleForm.name = ''
    roleForm.description = ''
    roleForm.permissionIds = []
  } catch (e) {
    if (e.response?.status === 409) roleFormErrors.name = 'Já existe uma função com esse nome.'
    else roleFormError.value = e.response?.data?.message || 'Erro ao criar função.'
  } finally {
    savingRole.value = false
  }
}

function cancelRoleForm() {
  showRoleForm.value = false
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
.user-card { display: flex; align-items: center; gap: 16px; background: #6b6b6b; border-radius: 12px; padding: 20px 24px; color: #fff; font-size: 1rem; }
.user-icon { font-size: 1.3rem; color: #00e5cc; }
.user-name { font-weight: 500; }
.user-separator { color: rgba(255,255,255,0.5); }
.user-role { color: rgba(255,255,255,0.85); flex: 1; }
.roles-list { display: flex; flex-direction: column; gap: 12px; }
.role-card { display: flex; align-items: flex-start; justify-content: space-between; background: #fff; border-radius: 12px; padding: 20px 24px; border: 1px solid #eee; }
.role-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.role-name { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
.role-desc { font-size: 0.85rem; color: #777; }
.role-perms { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.perm-tag { background: #e8e8e8; color: #333; font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; }
.perm-tag.more { background: #0d0d2b; color: #fff; }
.role-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.role-count { font-size: 0.82rem; color: #888; white-space: nowrap; }
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
.btn-delete { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; padding: 6px 8px; border-radius: 6px; transition: color 0.2s; }
.btn-delete:hover { color: #c0392b; }
.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 40px; width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal h3 { font-size: 1.2rem; color: #1a1a2e; margin: 0; }
.modal p { font-size: 0.9rem; color: #555; line-height: 1.5; margin: 0; }
.modal-actions { display: flex; gap: 12px; margin-top: 8px; }
.btn-confirm-delete { padding: 12px 28px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.95rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
