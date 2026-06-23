<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { me } from '../../services/auth.js'

const editing = ref(false)

const company = ref({
  name: '',
  slug: '',
  email: '',
  phone: '',
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

const originalCompany = ref({ ...company.value })

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

function saveChanges() {
  // TODO: PATCH /company quando o back liberar o endpoint self-service
  originalCompany.value = { ...company.value }
  editing.value = false
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { message: 'Funcionalidade aguardando integração com o servidor.', type: 'warning' }
  }))
}

function cancelEdit() {
  company.value = { ...originalCompany.value }
  editing.value = false
}

function upgradeNotAvailable() {
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { message: 'Upgrade de plano estará disponível em breve.', type: 'warning' }
  }))
}

onMounted(async () => {
  try {
    const user = await me()
    if (user.company) {
      company.value.name = user.company.name || ''
      company.value.status = user.company.status || 'ACTIVE'
    }
    originalCompany.value = { ...company.value }
  } catch {
    // silencioso — campos ficam vazios
  }
})
</script>
