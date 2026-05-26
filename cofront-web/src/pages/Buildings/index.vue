<template>
    <MainLayout titulo="Empreendimentos">
  
      <!-- Carregando -->
      <div v-if="carregando" class="estado">
        Carregando empreendimentos...
      </div>
  
      <!-- Erro -->
      <div v-else-if="erro" class="estado erro">
        {{ erro }}
      </div>
  
      <!-- Conteúdo -->
      <div v-else>
  
        <!-- Cards de resumo -->
        <div class="cards">
          <div class="card card-dark">
            <div class="card-header">
              <span>Total de Apartamentos</span>
              <span>⊞</span>
            </div>
            <div class="card-numero">{{ totalApartamentos }}</div>
            <div class="card-sub">{{ totalBlocos }} blocos</div>
          </div>
  
          <div class="card card-orange">
            <div class="card-header">
              <span>Pendências</span>
              <span>!</span>
            </div>
            <div class="card-numero">{{ totalPendentes }}</div>
            <div class="card-sub">Atenção necessária</div>
          </div>
  
          <div class="card card-yellow">
            <div class="card-header">
              <span>Aguardando</span>
              <span>🕐</span>
            </div>
            <div class="card-numero">{{ totalAguardando }}</div>
            <div class="card-sub">{{ pctAguardando }}% do total</div>
          </div>
  
          <div class="card card-teal">
            <div class="card-header">
              <span>Aprovados</span>
              <span>✓</span>
            </div>
            <div class="card-numero">{{ totalAprovados }}</div>
            <div class="card-sub">{{ pctAprovados }}% do total</div>
          </div>
        </div>
  
        <!-- Filtros -->
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
            :class="['apt-card', `apt-${apt.status.toLowerCase()}`]"
            @click="abrirModal(apt)"
            style="cursor: pointer"
          >
            <div class="apt-header">
              <div class="apt-id">
                <span>⊞</span>
                <strong>{{ apt.identifier }}</strong>
              </div>
              <span :class="['apt-badge', `badge-${apt.status.toLowerCase()}`]">
                {{ traduzirStatus(apt.status) }}
              </span>
            </div>
  
            <div class="apt-info">
              <span>{{ apt.floor }}º andar • {{ apt.area }}m²</span>
              <span>Inspeção: {{ formatarData(apt.inspectionDate) }}</span>
            </div>
  
            <div class="apt-checklist">
              <span>CHECKLIST</span>
              <span>{{ apt.checklistProgress }}%</span>
            </div>
            <div class="apt-barra">
              <div
                class="apt-barra-progresso"
                :style="{ width: apt.checklistProgress + '%' }"
                :class="`barra-${apt.status.toLowerCase()}`"
              ></div>
            </div>
          </div>
        </div>
  
      </div>
  
      <!-- Modal de Checklist -->
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
  
  const route = useRoute()
  const carregando = ref(true)
  const erro = ref('')
  
  const building = ref(null)
  const apartments = ref([])
  const filtroAtivo = ref('TODOS')
  
  const filtros = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Aguardando', value: 'WAITING' },
    { label: 'Aprovados', value: 'APPROVED' },
    { label: 'Pendências', value: 'PENDING' },
  ]
  
  const totalApartamentos = computed(() => apartments.value.length)
  const totalBlocos = computed(() => {
    const blocos = new Set(apartments.value.map(a => a.block).filter(Boolean))
    return blocos.size
  })
  const totalPendentes = computed(() =>
    apartments.value.filter(a => a.status === 'PENDING').length
  )
  const totalAguardando = computed(() =>
    apartments.value.filter(a => a.status === 'WAITING').length
  )
  const totalAprovados = computed(() =>
    apartments.value.filter(a => a.status === 'APPROVED').length
  )
  const pctAguardando = computed(() =>
    totalApartamentos.value
      ? Math.round((totalAguardando.value / totalApartamentos.value) * 100)
      : 0
  )
  const pctAprovados = computed(() =>
    totalApartamentos.value
      ? Math.round((totalAprovados.value / totalApartamentos.value) * 100)
      : 0
  )
  
  const apartamentosFiltrados = computed(() => {
    if (filtroAtivo.value === 'TODOS') return apartments.value
    return apartments.value.filter(a => a.status === filtroAtivo.value)
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
    const map = { PENDING: 'Pendências', WAITING: 'Aguardando', APPROVED: 'Aprovado' }
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
  .estado {
    text-align: center;
    padding: 40px;
    color: #555;
  }
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
  .card-orange { border-left-color: #ff6b35; }
  .card-yellow { border-left-color: #f5a623; }
  .card-teal { border-left-color: #00e5cc; }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 8px;
  }
  .card-numero {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1a1a2e;
  }
  .card-sub {
    font-size: 0.8rem;
    color: #888;
    margin-top: 4px;
  }
  
  .filtros {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  .filtro-btn {
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    background: #1a1a2e;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .filtro-btn.ativo {
    background: #00e5cc;
    color: #1a1a2e;
    font-weight: bold;
  }
  
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
  }
  .apt-pending { background: #ff6b35; color: #fff; }
  .apt-pending .apt-info,
  .apt-pending .apt-checklist { color: #fff; }
  
  .apt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .apt-id {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.2rem;
  }
  .apt-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
  }
  .badge-approved { background: #00e5cc; color: #1a1a2e; }
  .badge-waiting { background: #f5a623; color: #fff; }
  .badge-pending { background: #fff; color: #ff6b35; }
  
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
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  .apt-barra-progresso {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .barra-approved { background: #00e5cc; }
  .barra-waiting { background: #f5a623; }
  .barra-pending { background: #ff6b35; }
  </style>