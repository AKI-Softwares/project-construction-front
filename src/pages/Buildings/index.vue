<template>
  <MainLayout titulo="Empreendimentos">

    <div v-if="carregando" class="estado">Carregando empreendimentos...</div>
    <div v-else-if="erro" class="estado erro">{{ erro }}</div>

    <div v-else>

      <!-- Cards de resumo -->
      <div class="cards">
        <div class="card card-dark">
          <div class="card-header"><span>Total de Apartamentos</span><span>⊞</span></div>
          <div class="card-numero">{{ totalApartamentos }}</div>
          <div class="card-sub">{{ totalBlocos }} blocos</div>
        </div>
        <div class="card card-orange">
          <div class="card-header"><span>Pendências</span><span>!</span></div>
          <div class="card-numero">{{ totalItensResumo.pendentes }}</div>
          <div class="card-sub">Atenção necessária</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header"><span>Aguardando</span><span>🕐</span></div>
          <div class="card-numero">{{ totalItensResumo.aguardando }}</div>
          <div class="card-sub">itens aguardando vistoria</div>
        </div>
        <div class="card card-teal">
          <div class="card-header"><span>Aprovados</span><span>✓</span></div>
          <div class="card-numero">{{ totalItensResumo.aprovados }}</div>
          <div class="card-sub">{{ totalItensResumo.pctAprovados }}% do total</div>
        </div>
      </div>

      <!-- Filtros — baseados no status calculado -->
      <div class="filtros">
        <button
          v-for="filtro in filtros"
          :key="filtro.value"
          :class="['filtro-btn', { ativo: filtroAtivo === filtro.value }]"
          @click="filtroAtivo = filtro.value"
        >
          {{ filtro.label }}
        </button>
      </div>

      <!-- Lista de apartamentos -->
      <div class="grid-apartments">
        <div
          v-for="apt in apartamentosFiltrados"
          :key="apt.id"
          :class="['apt-card', `apt-${calcularStatus(mockChecklists[apt.id])}`]"
          @click="abrirModal(apt)"
          style="cursor: pointer"
        >
          <div class="apt-header">
            <div class="apt-id">
              <span>⊞</span>
              <strong>{{ apt.identifier }}</strong>
            </div>
            <span :class="['apt-badge', `badge-${calcularStatus(mockChecklists[apt.id])}`]">
              {{ traduzirStatus(calcularStatus(mockChecklists[apt.id])) }}
            </span>
          </div>

          <!-- Bloco + andar -->
          <div class="apt-info">
            <span>Bloco {{ apt.block }} • {{ apt.floor }}º andar • {{ apt.area }}m²</span>
            <span>Inspeção: {{ formatarData(apt.inspectionDate) }}</span>
          </div>

          <div class="apt-checklist">
            <span>CHECKLIST</span>
            <span>{{ calcularProgresso(mockChecklists[apt.id]) }}%</span>
          </div>

          <div class="apt-barra">
            <div
              class="apt-barra-segmento seg-aprovado"
              :style="{ width: calcularPctAprovados(mockChecklists[apt.id]) + '%' }"
            ></div>
            <div
              class="apt-barra-segmento seg-pendente"
              :style="{ width: calcularPctPendentes(mockChecklists[apt.id]) + '%' }"
            ></div>
          </div>
        </div>
      </div>

    </div>

    <ChecklistModal
      v-if="modalAberto && checklistAtivo"
      :checklist="checklistAtivo"
      @fechar="fecharModal"
    />

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuilding } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { mockChecklists } from '../../mocks/buildings.js'
import { calcularProgresso } from '../../utils/checklist.js'

const route = useRoute()
const carregando = ref(true)
const erro = ref('')
const building = ref(null)
const apartments = ref([])
const filtroAtivo = ref('TODOS')

const filtros = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Aguardando', value: 'waiting' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Pendências', value: 'pending' },
]

// Calcula status do apartamento a partir dos itens reais do checklist
function calcularStatus(checklist) {
  if (!checklist) return 'waiting'
  const itens = checklist.rooms.flatMap(r => r.items)
  if (itens.length === 0) return 'waiting'
  if (itens.some(i => i.status === 'PENDING')) return 'pending'
  if (itens.every(i => i.status === 'APPROVED')) return 'approved'
  return 'waiting'
}

function calcularPctAprovados(checklist) {
  if (!checklist) return 0
  const itens = checklist.rooms.flatMap(r => r.items)
  if (!itens.length) return 0
  return (itens.filter(i => i.status === 'APPROVED').length / itens.length) * 100
}

function calcularPctPendentes(checklist) {
  if (!checklist) return 0
  const itens = checklist.rooms.flatMap(r => r.items)
  if (!itens.length) return 0
  return (itens.filter(i => i.status === 'PENDING').length / itens.length) * 100
}

// Resumo calculado dos itens reais
const totalItensResumo = computed(() => {
  const todosItens = apartments.value.flatMap(apt => {
    const checklist = mockChecklists[apt.id]
    if (!checklist) return []
    return checklist.rooms.flatMap(r => r.items)
  })
  const total = todosItens.length
  const aprovados = todosItens.filter(i => i.status === 'APPROVED').length
  const pendentes = todosItens.filter(i => i.status === 'PENDING').length
  const aguardando = todosItens.filter(i => i.status === 'WAITING').length
  return {
    aprovados,
    pendentes,
    aguardando,
    pctAprovados: total > 0 ? Math.round((aprovados / total) * 100) : 0
  }
})

const totalApartamentos = computed(() => apartments.value.length)
const totalBlocos = computed(() => {
  const blocos = new Set(apartments.value.map(a => a.block).filter(Boolean))
  return blocos.size
})

// Filtro baseado no status calculado
const apartamentosFiltrados = computed(() => {
  if (filtroAtivo.value === 'TODOS') return apartments.value
  return apartments.value.filter(apt =>
    calcularStatus(mockChecklists[apt.id]) === filtroAtivo.value
  )
})

const modalAberto = ref(false)
const checklistAtivo = ref(null)

function abrirModal(apt) {
  checklistAtivo.value = mockChecklists[apt.id]
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  checklistAtivo.value = null
}

function traduzirStatus(status) {
  const map = { pending: 'Pendências', waiting: 'Aguardando', approved: 'Aprovado' }
  return map[status] || status
}

function formatarData(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  try {
    const buildingId = route.params.id
    const [buildingData, apartmentsData] = await Promise.all([
      getBuilding(buildingId),
      getApartments(buildingId)
    ])
    building.value = buildingData
    apartments.value = apartmentsData
  } catch (e) {
    erro.value = 'Erro ao carregar empreendimento. Verifique sua conexão.'
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.estado { text-align: center; padding: 40px; color: #555; }
.erro { color: red; }

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.card {
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  border-left: 6px solid transparent;
}
.card-dark { border-left-color: #1a1a2e; }
.card-orange { border-left-color: #f99f56; }
.card-yellow { border-left-color: #f5a623; }
.card-teal { border-left-color: #00e5cc; }

.card-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}
.card-numero { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.8rem; color: #888; margin-top: 4px; }

.filtros { display: flex; gap: 12px; margin-bottom: 24px; }
.filtro-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: #1a1a2e;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}
.filtro-btn.ativo { background: #00e5cc; color: #1a1a2e; font-weight: bold; }

.grid-apartments {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.apt-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
  transition: background 0.2s;
}
.apt-pending { background: #f99f56; color: #fff; }
.apt-pending .apt-info,
.apt-pending .apt-checklist { color: #fff; }

.apt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.apt-id { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; }

.apt-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-approved { background: #00e5cc; color: #1a1a2e; }
.badge-waiting { background: #f5a623; color: #fff; }
.badge-pending { background: #fff; color: #f99f56; }

.apt-info {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
  color: #666;
  gap: 2px;
  margin-bottom: 16px;
}
.apt-checklist {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 6px;
}

.apt-barra {
  height: 6px;
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}
.apt-barra-segmento { height: 100%; transition: width 0.3s; }
.seg-aprovado { background: #00e5cc; }
.seg-pendente { background: #c0392b; }
</style>