<template>
  <MainLayout titulo="Dashboard">

    <!-- Cards de resumo -->
    <div class="cards">
      <div class="card card-dark">
        <div class="card-header">
          <span>Total de Empreendimentos</span>
          <span class="icone">⊞</span>
        </div>
        <div class="card-numero">{{ totalBuildings }}</div>
      </div>

      <div class="card card-orange">
        <div class="card-header">
          <span>Empreendimentos pendentes</span>
          <span class="icone">!</span>
        </div>
        <div class="card-numero">{{ totalPendentes }}</div>
      </div>

      <div class="card card-yellow">
        <div class="card-header">
          <span>Aguardando</span>
          <span class="icone">🕐</span>
        </div>
        <div class="card-numero">{{ totalAguardando }}</div>
      </div>

      <div class="card card-teal">
        <div class="card-header">
          <span>Aprovados</span>
          <span class="icone">✓</span>
        </div>
        <div class="card-numero">{{ totalAprovados }}</div>
      </div>
    </div>

    <!-- Mensagem de carregando -->
    <div v-if="carregando" class="carregando">
      Carregando dados...
    </div>

    <!-- Mensagem de erro -->
    <div v-if="erro" class="erro">
      {{ erro }}
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { getInspections } from '../../services/inspections.js'

const carregando = ref(true)
const erro = ref('')

const totalBuildings = ref(0)
const totalPendentes = ref(0)
const totalAguardando = ref(0)
const totalAprovados = ref(0)

onMounted(async () => {
  try {
    const [buildings, inspections] = await Promise.all([
      getBuildings(),
      getInspections()
    ])

    totalBuildings.value = buildings.length

    totalPendentes.value = inspections.filter(i => i.status === 'PENDING').length
    totalAguardando.value = inspections.filter(i => i.status === 'WAITING').length
    totalAprovados.value = inspections.filter(i => i.status === 'APPROVED').length

  } catch (e) {
    erro.value = 'Erro ao carregar dados. Verifique sua conexão.'
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.card {
  border-radius: 12px;
  padding: 20px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 6px solid transparent;
}

.card-dark { border-left-color: #1a1a2e; background: #fff; }
.card-orange { border-left-color: #ff6b35; background: #fff; }
.card-yellow { border-left-color: #f5a623; background: #fff; }
.card-teal { border-left-color: #00e5cc; background: #fff; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 12px;
}

.card-numero {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a1a2e;
}

.carregando {
  color: #555;
  font-size: 0.95rem;
}

.erro {
  color: red;
  font-size: 0.95rem;
}
</style>