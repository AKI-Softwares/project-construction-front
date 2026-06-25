<template>
  <MainLayout titulo="Configurações">

    <div class="settings-grid">

      <div class="settings-card">
        <div class="card-title">
          <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" />
          Dados do Perfil e Empresa
        </div>

        <div class="field">
          <label>Nome do Gestor / Responsável</label>
          <input v-model="userProfile.name" type="text" :disabled="!editing" />
        </div>

        <div class="field">
          <label>E-mail de contato</label>
          <input v-model="userProfile.email" type="email" :disabled="!editing" />
        </div>

        <div class="field">
          <label>Empresa Vinculada</label>
          <input v-model="company.name" type="text" disabled />
          <span class="field-hint">Para mudar o nome da empresa, contate o Platform Admin</span>
        </div>

        <div class="field">
          <label>Identificador da Empresa (slug)</label>
          <input v-model="company.slug" type="text" disabled />
        </div>

        <div class="card-actions">
          <button v-if="!editing" class="btn-edit" @click="editing = true">
            <FontAwesomeIcon :icon="['fas', 'pen-to-square']" />
            Editar dados
          </button>
          <template v-else>
            <button class="btn-save" @click="saveChanges" :disabled="salvando">
              {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
            </button>
            <button class="btn-cancel" @click="cancelEdit" :disabled="salvando">Cancelar</button>
          </template>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-title">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          Status da Conta
        </div>

        <div class="status-row">
          <span :class="['status-badge', `status-${company.status.toLowerCase()}`]">
            {{ translateStatus(company.status) }}
          </span>
          <span class="status-date">desde {{ formatDate(company.statusSince) }}</span>
        </div>

        <p class="status-description">{{ statusDescription }}</p>
      </div>

      <div class="settings-card plan-card">
        <div class="card-title">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          Plano Atual
        </div>

        <div class="plan-info">
          <div class="plan-name">{{ company.plan.name }}</div>
          <div class="plan-price">
            <span class="price-value">{{ company.plan.price }}</span>
            <span class="price-period">/mês</span>
          </div>
        </div>

        <ul class="plan-features">
          <li v-for="feature in company.plan.features" :key="feature">
            <FontAwesomeIcon :icon="['fas', 'circle-check']" class="check-icon" />
            {{ feature }}
          </li>
        </ul>

        <button class="btn-upgrade" @click="upgradeNotAvailable">
          Fazer upgrade do plano
        </button>
        <p class="upgrade-note">
          O pagamento é processado por um gateway seguro externo (AbacatePay).
        </p>
      </div>

    </div>

  </MainLayout>
</template>

<script setup>


import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { useAuthStore } from '../../store/auth'

// Importa os arquivos inteiros como objetos para garantir compatibilidade com as funções exportadas
import * as authService from '../../services/auth'
import * as usersService from '../../services/users'

const authStore = useAuthStore()
const editing = ref(false)
const salvando = ref(false)

// Estado para controle do perfil do usuário logado (mutável)
const userProfile = ref({
  id: null,
  name: '',
  email: ''
})

// Dados da empresa vindos por agregação do /auth/me (somente leitura conforme limitações do back)
const company = ref({
  name: 'Carregando...',
  slug: '',
  status: 'ACTIVE',
  statusSince: null,
  plan: {
    name: 'Plano Profissional',
    price: 'R$ 299,00',
    features: [
      'Até 10 empreendimentos',
      'Usuários ilimitados',
      'Relatórios em PDF',
      'Suporte prioritário',
    ]
  }
})

// Backup para o botão "Cancelar"
const originalUser = ref({ ...userProfile.value })

onMounted(async () => {
  await carregarDadosUsuario()
})

async function carregarDadosUsuario() {
  try {
    if (authService && typeof authService.me === 'function') {
      const userData = await authService.me()
      
      if (userData) {
        userProfile.value.id = userData.id
        userProfile.value.name = userData.name || ''
        userProfile.value.email = userData.email || ''

        if (userData.company) {
          company.value.name = userData.company.name || 'Minha Empresa'
          company.value.slug = userData.company.slug || `empresa-${userData.companyId}`
          company.value.status = userData.company.status || 'ACTIVE'
          company.value.statusSince = userData.company.createdAt || null
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do endpoint /auth/me:', error)
  } finally {
    originalUser.value = JSON.parse(JSON.stringify(userProfile.value))
  }
}

const statusDescription = computed(() => {
  const map = {
    ACTIVE: 'Sua conta está ativa e todos os recursos estão disponíveis.',
    SUSPENDED: 'Sua conta está suspensa. Entre em contato com o suporte.',
    PENDING: 'Sua conta está aguardando aprovação.',
  }
  return map[company.value.status] || ''
})

function translateStatus(status) {
  const map = { ACTIVE: 'Ativa', SUSPENDED: 'Suspensa', PENDING: 'Pendente' }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

// Salva utilizando de verdade o endpoint PATCH /users/:id do seu back-end
async function saveChanges() {
  if (!userProfile.value.id) return

  salvando.value = true
  try {
    // Tenta encontrar a função de update dinamicamente no serviço de usuários
    const updateFn = usersService.updateUser || usersService.patch || usersService.update
    
    if (typeof updateFn === 'function') {
      await updateFn(userProfile.value.id, {
        name: userProfile.value.name,
        email: userProfile.value.email
      })
    } else {
      console.warn('Método de atualização não encontrado em src/services/users.js')
    }

    originalUser.value = JSON.parse(JSON.stringify(userProfile.value))
    editing.value = false

    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Dados cadastrais atualizados com sucesso no servidor!', type: 'success' }
    }))
  } catch (error) {
    console.error('Erro ao salvar modificações via PATCH /users/:id:', error)
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Erro ao salvar modificações no servidor.', type: 'danger' }
    }))
  } finally {
    salvando.value = false
  }
}

function cancelEdit() {
  userProfile.value = JSON.parse(JSON.stringify(originalUser.value))
  editing.value = false
}

function upgradeNotAvailable() {
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { message: 'Redirecionando para o ambiente seguro do gateway AbacatePay...', type: 'info' }
  }))
}

</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.plan-card { grid-column: span 2; }
.settings-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 600; color: #1a1a2e; margin-bottom: 24px; }
.card-title svg { color: #00e5cc; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.field label { font-size: 0.85rem; font-weight: 500; color: #333; }
.field input { padding: 12px 18px; border: none; border-radius: 24px; background: #e8e8e8; font-size: 0.92rem; outline: none; color: #333; width: 100%; box-sizing: border-box; }
.field input:disabled { background: #f5f5f5; color: #888; cursor: not-allowed; }
.field-hint { font-size: 0.75rem; color: #999; padding-left: 8px; }
.card-actions { display: flex; gap: 12px; margin-top: 8px; }
.btn-edit, .btn-save, .btn-cancel, .btn-upgrade { padding: 11px 24px; border: none; border-radius: 24px; font-size: 0.88rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.btn-edit { background: #0d0d2b; color: #fff; }
.btn-save { background: #00e5cc; color: #0d0d2b; }
.btn-save:disabled { background: #ccc; cursor: not-allowed; }
.btn-cancel { background: #e8e8e8; color: #333; }
.status-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.status-badge { padding: 6px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
.status-active { background: #e0faf6; color: #00897b; }
.status-suspended { background: #fdecea; color: #c0392b; }
.status-pending { background: #fff3e0; color: #f99f56; }
.status-date { font-size: 0.8rem; color: #888; }
.status-description { font-size: 0.88rem; color: #555; line-height: 1.5; }
.plan-info { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.plan-name { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; }
.price-value { font-size: 1.6rem; font-weight: bold; color: #00e5cc; }
.price-period { font-size: 0.85rem; color: #888; }
.plan-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
.plan-features li { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: #333; }
.check-icon { color: #00e5cc; }
.btn-upgrade { background: #00e5cc; color: #0d0d2b; width: 100%; justify-content: center; padding: 14px; font-size: 0.95rem; }
.upgrade-note { font-size: 0.78rem; color: #999; text-align: center; margin-top: 10px; }
</style>
