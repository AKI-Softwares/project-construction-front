<template>
  <MainLayout titulo="Gestão de Empresas">

    <!-- Aviso sobre o gap real do backend -->
    <div class="info-banner">
      <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="info-icon" />
      <div>
        <strong>Importante sobre criação direta de empresas</strong>
        <p>
          Empresas criadas aqui pelo botão "Nova Empresa" entram como <strong>ACTIVE</strong>
          imediatamente, mas o catálogo (funções, serviços e tipos de apartamento) só é
          copiado quando uma empresa passa de PENDING para ACTIVE. Empresas criadas
          diretamente não recebem esse catálogo automaticamente — será necessário ajuste
          no backend para cobrir esse caso.
        </p>
      </div>
    </div>

    <div class="top-bar">
      <div class="filter-bar">
        <button
          v-for="opt in statusOptions"
          :key="opt.value || 'all'"
          :class="['filter-btn', { active: activeStatus === opt.value }]"
          @click="setStatus(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <button class="btn-primary" @click="openCreateForm">
        <FontAwesomeIcon :icon="['fas', 'plus']" /> Nova empresa
      </button>
    </div>

    <!-- Formulário de criação -->
    <div v-if="showForm" class="form-card">
      <h3 class="form-title">Nova empresa</h3>
      <div v-if="formSuccess" class="alert success">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Empresa criada com sucesso!
      </div>
      <div v-if="formError" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ formError }}
      </div>
      <div class="form-row">
        <div class="form-col">
          <label>Nome <span class="required">*</span></label>
          <input v-model="form.name" type="text" placeholder="Nome da empresa" :class="{ invalid: formErrors.name }" @input="autoSlug" />
          <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
        </div>
        <div class="form-col">
          <label>Slug <span class="required">*</span></label>
          <input v-model="form.slug" type="text" placeholder="nome-da-empresa" :class="{ invalid: formErrors.slug }" />
          <span v-if="formErrors.slug" class="field-error">{{ formErrors.slug }}</span>
          <span class="hint">Apenas letras minúsculas, números e hífens</span>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" :disabled="saving" @click="submitForm">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
        <button class="btn-cancel" @click="closeForm">Cancelar</button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>

    <div v-if="!loading && !loadError">
      <div class="table-header">
        <span>Nome</span>
        <span>Slug</span>
        <span>Status</span>
        <span>Usuários</span>
        <span>Criada em</span>
        <span></span>
      </div>

      <div v-for="c in companies" :key="c.id" class="table-row" @click="goToDetail(c)">
        <span class="company-name">{{ c.name }}</span>
        <span class="company-slug">{{ c.slug }}</span>
        <span>
          <span :class="['status-tag', statusClass(c.status)]">{{ statusLabel(c.status) }}</span>
        </span>
        <span>{{ c._count?.users ?? 0 }}</span>
        <span class="created-at">{{ formatDate(c.createdAt) }}</span>
        <div class="row-actions" @click.stop>
          <button
            v-if="c.status === 'PENDING'"
            class="btn-action activate"
            :disabled="statusChanging === c.id"
            @click="changeStatus(c, 'ACTIVE')"
          >
            Ativar
          </button>
          <button
            v-if="c.status === 'ACTIVE'"
            class="btn-action suspend"
            :disabled="statusChanging === c.id"
            @click="changeStatus(c, 'SUSPENDED')"
          >
            Suspender
          </button>
          <button
            v-if="c.status === 'SUSPENDED'"
            class="btn-action activate"
            :disabled="statusChanging === c.id"
            @click="changeStatus(c, 'ACTIVE')"
          >
            Reativar
          </button>
        </div>
      </div>

      <div v-if="companies.length === 0" class="state">Nenhuma empresa encontrada.</div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../../components/Layout/MainLayout.vue'
import { getCompanies, createCompany, updateCompanyStatus } from '../../../services/platform.js'

const router = useRouter()
const companies = ref([])
const loading = ref(true)
const loadError = ref('')
const activeStatus = ref(undefined)

const statusOptions = [
  { label: 'Todas', value: undefined },
  { label: 'Ativas', value: 'ACTIVE' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Suspensas', value: 'SUSPENDED' },
]

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

async function setStatus(status) {
  activeStatus.value = status
  await loadCompanies()
}

async function loadCompanies() {
  loading.value = true
  loadError.value = ''
  try {
    companies.value = await getCompanies(activeStatus.value)
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao carregar empresas.'
  } finally {
    loading.value = false
  }
}

function goToDetail(c) {
  router.push(`/platform/companies/${c.id}`)
}

// ─── Status (ativar/suspender) ─────────────────────────────────
const statusChanging = ref(null)

async function changeStatus(c, newStatus) {
  statusChanging.value = c.id
  try {
    const updated = await updateCompanyStatus(c.id, newStatus)
    const idx = companies.value.findIndex(x => x.id === c.id)
    if (idx !== -1) companies.value[idx] = { ...companies.value[idx], ...updated }
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao alterar status.'
  } finally {
    statusChanging.value = null
  }
}

// ─── Formulário de criação ──────────────────────────────────────
const showForm = ref(false)
const saving = ref(false)
const formSuccess = ref(false)
const formError = ref('')
const form = reactive({ name: '', slug: '' })
const formErrors = reactive({ name: '', slug: '' })
let slugTouched = false

function autoSlug() {
  if (slugTouched) return
  form.slug = form.name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function openCreateForm() {
  form.name = ''; form.slug = ''
  formErrors.name = ''; formErrors.slug = ''
  formSuccess.value = false; formError.value = ''
  slugTouched = false
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function validateForm() {
  formErrors.name = ''; formErrors.slug = ''
  let valid = true
  if (!form.name || form.name.length < 2) { formErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; valid = false }
  if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) {
    formErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens.'
    valid = false
  }
  return valid
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true; formError.value = ''; formSuccess.value = false
  try {
    const created = await createCompany({ name: form.name, slug: form.slug })
    companies.value.unshift(created)
    formSuccess.value = true
    form.name = ''; form.slug = ''
  } catch (e) {
    if (e.response?.status === 409) formErrors.slug = 'Esse slug já está em uso.'
    else formError.value = e.response?.data?.message || 'Erro ao criar empresa.'
  } finally {
    saving.value = false
  }
}

onMounted(loadCompanies)
</script>

<style scoped>
.info-banner {
  display: flex; gap: 14px; background: #fff8e1; border: 1px solid #f5d77a;
  border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 0.85rem; color: #333;
}
.info-icon { color: #f5a623; font-size: 1.2rem; margin-top: 2px; flex-shrink: 0; }
.info-banner strong { display: block; margin-bottom: 4px; color: #1a1a2e; }
.info-banner p { margin: 0; line-height: 1.5; color: #555; }

.top-bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-btn { padding: 8px 18px; border-radius: 30px; border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.filter-btn:hover { border-color: #00e5cc; color: #00897b; }
.filter-btn.active { background: #00e5cc; border-color: #00e5cc; color: #0d0d2b; font-weight: 700; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: #0d0d2b; color: #fff; border: none; border-radius: 30px; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; white-space: nowrap; }

.form-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; max-width: 700px; }
.form-title { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.85rem; font-weight: 600; color: #333; }
.required { color: #c0392b; }
input[type="text"] { width: 100%; padding: 11px 18px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.9rem; outline: none; color: #333; box-sizing: border-box; }
input[type="text"].invalid { border: 2px solid #c0392b; background: #fff3f0; }
.hint { font-size: 0.75rem; color: #999; padding-left: 4px; }
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

.table-header { display: grid; grid-template-columns: 1.5fr 1.2fr 1fr 0.8fr 1fr auto; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 2px solid #eee; margin-bottom: 4px; }
.table-row { display: grid; grid-template-columns: 1.5fr 1.2fr 1fr 0.8fr 1fr auto; padding: 14px 20px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; background: #fff; border-radius: 8px; margin-bottom: 4px; cursor: pointer; transition: background 0.2s; }
.table-row:hover { background: #f9f9f9; }
.company-name { font-weight: 600; color: #1a1a2e; }
.company-slug { color: #777; font-size: 0.83rem; font-family: monospace; }
.created-at { color: #888; font-size: 0.82rem; }
.status-tag { padding: 4px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; }
.status-active { background: #e0faf6; color: #00897b; }
.status-pending { background: #fff8e1; color: #b8860b; }
.status-suspended { background: #fff3f0; color: #c0392b; }
.row-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-action { padding: 6px 14px; border-radius: 20px; border: none; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-action.activate { background: #00e5cc; color: #0d0d2b; }
.btn-action.suspend { background: #fff3f0; color: #c0392b; }
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
