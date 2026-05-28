<template>
  <MainLayout titulo="Dashboard">

    <div v-if="carregando" class="estado">Carregando...</div>
    <div v-if="erro" class="estado erro">{{ erro }}</div>

    <div v-if="!carregando && !erro">

      <!-- Cards de resumo -->
      <div class="cards">
        <div class="card card-dark">
          <div class="card-header">
            <span>Total de Empreendimentos</span>
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" />
          </div>
          <div class="card-numero">{{ totalBuildings }}</div>
        </div>

        <div class="card card-orange">
          <div class="card-header">
            <span>Empreendimentos pendentes</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          </div>
          <div class="card-numero">{{ resumo.buildingsPendentes }}</div>
        </div>

        <div class="card card-yellow">
          <div class="card-header">
            <span>Aguardando</span>
            <FontAwesomeIcon :icon="['fas', 'clock']" />
          </div>
          <div class="card-numero">{{ resumo.buildingsAguardando }}</div>
        </div>

        <div class="card card-teal">
          <div class="card-header">
            <span>Aprovados</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          </div>
          <div class="card-numero">{{ resumo.buildingsAprovados }}</div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="graficos">

        <!-- Barras -->
        <div class="grafico-card grafico-barras">
          <div class="grafico-titulo">Status por Empreendimento</div>
          <Bar :data="dadosBarras" :options="opcoesBarras" />
        </div>

        <!-- Rosca -->
        <div class="grafico-card grafico-rosca">
          <Doughnut :data="dadosRosca" :options="opcoesRosca" />
          <div class="legenda">
            <div class="legenda-item">
              <span class="legenda-cor" style="background:#00e5cc"></span>
              Aprovados {{ resumo.pctAprovados }}%
            </div>
            <div class="legenda-item">
              <span class="legenda-cor" style="background:#f99f56"></span>
              Pendentes {{ resumo.pctPendentes }}%
            </div>
            <div class="legenda-item">
              <span class="legenda-cor" style="background:#f5a623"></span>
              Aguardando {{ resumo.pctAguardando }}%
            </div>
          </div>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { mockChecklists, mockApartments } from '../../mocks/buildings.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const carregando = ref(true)
const erro = ref('')
const buildings = ref([])

function calcularStatus(checklist) {
  if (!checklist) return 'waiting'
  const itens = checklist.rooms.flatMap(r => r.items)
  if (!itens.length) return 'waiting'
  if (itens.some(i => i.status === 'PENDING')) return 'pending'
  if (itens.every(i => i.status === 'APPROVED')) return 'approved'
  return 'waiting'
}

const totalBuildings = computed(() => buildings.value.length)

const resumo = computed(() => {
  const todosItens = mockApartments.flatMap(apt => {
    const c = mockChecklists[apt.id]
    return c ? c.rooms.flatMap(r => r.items) : []
  })
  const total = todosItens.length || 1
  const aprovados = todosItens.filter(i => i.status === 'APPROVED').length
  const pendentes = todosItens.filter(i => i.status === 'PENDING').length
  const aguardando = todosItens.filter(i => i.status === 'WAITING').length

  const buildingsPendentes = buildings.value.filter(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    return apts.some(a => calcularStatus(mockChecklists[a.id]) === 'pending')
  }).length

  const buildingsAprovados = buildings.value.filter(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    return apts.length > 0 && apts.every(a => calcularStatus(mockChecklists[a.id]) === 'approved')
  }).length

  const buildingsAguardando = buildings.value.length - buildingsPendentes - buildingsAprovados

  return {
    buildingsPendentes,
    buildingsAprovados,
    buildingsAguardando,
    pctAprovados: Math.round((aprovados / total) * 100),
    pctPendentes: Math.round((pendentes / total) * 100),
    pctAguardando: Math.round((aguardando / total) * 100),
  }
})

// Dados para o gráfico de barras
const dadosBarras = computed(() => {
  const labels = buildings.value.map(b => b.name.replace('Residencial ', ''))
  const aprovados = buildings.value.map(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    const itens = apts.flatMap(a => mockChecklists[a.id]?.rooms.flatMap(r => r.items) || [])
    const total = itens.length || 1
    return Math.round((itens.filter(i => i.status === 'APPROVED').length / total) * 100)
  })
  const pendentes = buildings.value.map(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    const itens = apts.flatMap(a => mockChecklists[a.id]?.rooms.flatMap(r => r.items) || [])
    const total = itens.length || 1
    return Math.round((itens.filter(i => i.status === 'PENDING').length / total) * 100)
  })
  const aguardando = buildings.value.map(b => {
    const apts = mockApartments.filter(a => a.buildingId === b.id)
    const itens = apts.flatMap(a => mockChecklists[a.id]?.rooms.flatMap(r => r.items) || [])
    const total = itens.length || 1
    return Math.round((itens.filter(i => i.status === 'WAITING').length / total) * 100)
  })

  return {
    labels,
    datasets: [
      { label: 'Aprovados', data: aprovados, backgroundColor: '#00e5cc', borderRadius: 4 },
      { label: 'Pendentes', data: pendentes, backgroundColor: '#f99f56', borderRadius: 4 },
      { label: 'Aguardando', data: aguardando, backgroundColor: '#f5a623', borderRadius: 4 },
    ]
  }
})

const opcoesBarras = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: v => v + '%' },
      grid: { color: 'rgba(0,0,0,0.05)' }
    },
    x: { grid: { display: false } }
  }
}

// Dados para o gráfico de rosca
const dadosRosca = computed(() => ({
  labels: ['Aprovados', 'Pendentes', 'Aguardando'],
  datasets: [{
    data: [resumo.value.pctAprovados, resumo.value.pctPendentes, resumo.value.pctAguardando],
    backgroundColor: ['#00e5cc', '#f99f56', '#f5a623'],
    borderWidth: 0,
    hoverOffset: 8,
  }]
}))

const opcoesRosca = {
  responsive: true,
  cutout: '70%',
  plugins: { legend: { display: false } }
}

onMounted(async () => {
  try {
    buildings.value = await getBuildings()
  } catch (e) {
    erro.value = 'Erro ao carregar dados.'
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
  align-items: center;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}
.card-numero { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }

.graficos {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.grafico-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #eee;
}

.grafico-titulo {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.grafico-rosca {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.legenda {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.legenda-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #333;
}

.legenda-cor {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>