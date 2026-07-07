<template>
  <MainLayout titulo="Detalhe da Empresa">

    <button class="btn-back" @click="router.push('/platform/companies')">← Voltar</button>

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>

    <div v-if="!loading && !loadError && company" class="detail-grid">

      <!-- Card de info -->
      <div class="card">
        <div class="card-header-row">
          <h2 class="card-title">{{ company.name }}</h2>
          <span :class="['status-tag', statusClass(company.status)]">{{ statusLabel(company.status) }}</span>
        </div>
        <div class="info-row"><span class="info-label">Slug</span><span class="info-value mono">{{ company.slug }}</span></div>
        <div class="info-row"><span class="info-label">Usuários</span><span class="info-value">{{ company._count?.users ?? 0 }}</span></div>
        <div class="info-row"><span class="info-label">Criada em</span><span class="info-value">{{ formatDate(company.createdAt) }}</span></div>

        <div class="card-actions">
          <button v-if="company.status === 'PENDING'" class="btn-action activate" :disabled="changingStatus" @click="changeStatus('ACTIVE')">
            Ativar empresa
          </button>
          <button v-if="company.status === 'ACTIVE'" class="btn-action suspend" :disabled="changingStatus" @click="changeStatus('SUSPENDED')">
            Suspender empresa
          </button>
          <button v-if="company.status === 'SUSPENDED'" class="btn-action activate" :disabled="changingStatus" @click="changeStatus('ACTIVE')">
            Reativar empresa
          </button>
        </div>

        <div v-if="company.status === 'PENDING'" class="hint-box">
          <FontAwesomeIcon :icon="['fas', 'circle-info']" />
          Ao ativar, o backend copia automaticamente o catálogo global (funções, serviços e
          tipos de apartamento) para esta empresa.
        </div>
      </div>

      <!-- Editar nome/slug -->
      <div class="card">
        <h3 class="card-title small">Editar dados</h3>
        <div v-if="editSuccess" class="alert success">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Dados atualizados!
        </div>
        <div v-if="editError" class="alert error">{{ editError }}</div>
        <div class="form-col">
          <label>Nome</label>
          <input v-model="editForm.name" type="text" />
        </div>
        <div class="form-col">
          <label>Slug</label>
          <input v-model="editForm.slug" type="text" />
        </div>
        <button class="btn-save" :disabled="saving" @click="saveEdit">
          {{ saving ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </div>

      <!-- Criar usuário admin: bloqueado por gap real do back -->
      <div class="card">
        <h3 class="card-title small">Criar usuário para esta empresa</h3>
        <div class="blocked-box">
          <FontAwesomeIcon :icon="['fas', 'lock']" class="blocked-icon" />
          <div>
            <strong>Indisponível no momento</strong>
            <p>
              O endpoint <code>POST /platform/companies/:id/users</code> existe e funciona, mas
              exige um <code>roleId</code> válido da empresa. O endpoint de funções
              (<code>GET /roles</code>) não filtra por empresa nem retorna o campo
              <code>companyId</code> — não há como, hoje, listar com segurança apenas as
              funções desta empresa específica. Criar um usuário aqui exigiria adivinhar o
              ID da função, o que pode atribuir a pessoa errada à empresa errada.
              É necessário um ajuste no backend (endpoint escopado por empresa) antes de
              liberar esta ação com segurança.
            </p>
          </div>
        </div>
      </div>

    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../../../components/Layout/MainLayout.vue'
import { getCompany, updateCompany, updateCompanyStatus } from '../../../services/platform.js'

import { useAuthStore } from '../../../store/auth.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const companyId = Number(route.params.id)

const company = ref(null)
const loading = ref(true)
const loadError = ref('')

function statusLabel(status) {
  return { ACTIVE: 'Ativa', PENDING: 'Pendente', SUSPENDED: 'Suspensa' }[status] || status
}
function statusClass(status) {
  return { ACTIVE: 'status-active', PENDING: 'status-pending', SUSPENDED: 'status-suspended' }[status] || ''
}
function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

const changingStatus = ref(false)
async function changeStatus(newStatus) {
  changingStatus.value = true
  try {
    company.value = await updateCompanyStatus(companyId, newStatus)
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao alterar status.'
  } finally {
    changingStatus.value = false
  }
}

const editForm = reactive({ name: '', slug: '' })
const saving = ref(false)
const editSuccess = ref(false)
const editError = ref('')

async function saveEdit() {
  saving.value = true
  editError.value = ''
  editSuccess.value = false
  try {
    company.value = await updateCompany(companyId, { name: editForm.name, slug: editForm.slug })
    editSuccess.value = true
  } catch (e) {
    if (e.response?.status === 409) editError.value = 'Esse slug já está em uso.'
    else editError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Platform Admin entra no contexto desta empresa
  authStore.setActiveCompany(companyId)
  try {
    company.value = await getCompany(companyId)
    editForm.name = company.value.name
    editForm.slug = company.value.slug
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao carregar empresa.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  // Sai do contexto da empresa ao deixar a tela
  authStore.setActiveCompany(null)
})
</script>

<style scoped>
.btn-back { background: none; border: 1px solid #ccc; border-radius: 30px; padding: 8px 18px; font-size: 0.85rem; color: #555; cursor: pointer; margin-bottom: 20px; }
.state { text-align: center; padding: 40px; color: #888; }
.error { color: red; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 14px; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.card-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.card-title.small { font-size: 0.95rem; }

.status-tag { padding: 4px 14px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; white-space: nowrap; }
.status-active { background: #e0faf6; color: #00897b; }
.status-pending { background: #fff8e1; color: #b8860b; }
.status-suspended { background: #fff3f0; color: #c0392b; }

.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 0.88rem; }
.info-label { color: #888; }
.info-value { color: #333; font-weight: 600; }
.info-value.mono { font-family: monospace; }

.card-actions { display: flex; gap: 12px; }
.btn-action { padding: 10px 20px; border-radius: 30px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-action.activate { background: #00e5cc; color: #0d0d2b; }
.btn-action.suspend { background: #fff3f0; color: #c0392b; }
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }

.hint-box { display: flex; gap: 10px; background: #f0fdfb; border: 1px solid #00e5cc; border-radius: 8px; padding: 12px 14px; font-size: 0.8rem; color: #00897b; line-height: 1.4; }

.form-col { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.85rem; font-weight: 600; color: #333; }
input[type="text"] { width: 100%; padding: 11px 18px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; box-sizing: border-box; }
.btn-save { padding: 10px 28px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: bold; color: #0d0d2b; cursor: pointer; align-self: flex-start; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.alert { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }

.blocked-box { display: flex; gap: 12px; background: #f8f8f8; border-radius: 10px; padding: 16px; font-size: 0.83rem; color: #555; }
.blocked-icon { color: #999; font-size: 1.1rem; margin-top: 2px; flex-shrink: 0; }
.blocked-box strong { display: block; color: #333; margin-bottom: 4px; }
.blocked-box p { margin: 0; line-height: 1.5; }
.blocked-box code { background: #e8e8e8; padding: 1px 6px; border-radius: 4px; font-size: 0.78rem; }
</style>
