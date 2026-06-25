<template>
  <MainLayout titulo="Relatório Consolidado de Inspeção">
    
    <div class="report-actions no-print">
      <button class="btn-back" @click="router.back()">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <button class="btn-print" @click="printReport">
        <FontAwesomeIcon :icon="['fas', 'print']" /> Imprimir ou Salvar PDF
      </button>
    </div>

    <div class="report-paper">
      
      <header class="report-header">
        <div class="header-main">
          <h1>RELATÓRIO CONSOLIDADO</h1>
          <h2>PEO 19 — CHECK LIST DE INSPEÇÃO FINAL</h2>
        </div>
        <div class="header-meta">
          <p><strong>Empreendimento:</strong> {{ buildingName }}</p>
          <p><strong>Data de Emissão:</strong> {{ currentLongDate }}</p>
        </div>
      </header>

      <hr class="divider" />

      <section class="report-section">
        <h3>1. Indicadores de Desempenho e Objetivo da Qualidade</h3>
        
        <div class="quality-grid">
          <div class="quality-card highlight">
            <span class="card-label">Resultado Objetivo da Qualidade</span>
            <span class="card-value">{{ qualityObjectiveResult }}%</span>
            <span class="card-sub">Indicador global de inconformidades detectadas</span>
          </div>
          
          <div class="formula-box">
            <strong>Fórmula de Cálculo do Objetivo:</strong>
            <div class="formula-display">
              $$\text{Resultado} = \frac{\text{N° de Itens de NC Total}}{\text{Nº Itens do Formulário} \times \text{Nº Apartamentos}} \times 100$$
            </div>
            <p class="formula-note">Métrica utilizada para mensurar a taxa de retrabalho e eficiência na entrega das unidades.</p>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h3>2. Escopo Geral e Itens Verificados</h3>
        
        <div class="tables-split">
          <div class="table-wrapper">
            <h4>Matriz de Itens por Cômodo (Apartamento Tipo)</h4>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cômodo / Área Avaliada</th>
                  <th class="text-center">Quantidade de Itens</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in roomItemsCatalog" :key="room.name">
                  <td>{{ room.name }}</td>
                  <td class="text-center font-bold">{{ room.count }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total de Itens por Apartamento</strong></td>
                  <td class="text-center font-bold">{{ totalItemsPerApartment }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="table-wrapper">
            <h4>Resumo Volumétrico da Obra</h4>
            <table class="report-table summary-table">
              <thead>
                <tr>
                  <th>Categoria / Tipo</th>
                  <th class="text-center">Apartamentos</th>
                  <th class="text-center">Itens Verificados</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Apartamentos Tipo</strong></td>
                  <td class="text-center">{{ totalStandardApartments }}</td>
                  <td class="text-center">{{ totalStandardItemsVerified }}</td>
                </tr>
                <tr>
                  <td><strong>Apartamentos Duplex</strong></td>
                  <td class="text-center">{{ totalDuplexApartments }}</td>
                  <td class="text-center">{{ totalDuplexItemsVerified }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="final-row">
                  <td><strong>Total Geral</strong></td>
                  <td class="text-center font-bold">{{ totalApartmentsCount }}</td>
                  <td class="text-center font-bold color-cyan">{{ totalGlobalItemsVerified }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      <div class="page-break"></div>

      <section class="report-section">
        <h3>3. Mapeamento Analítico de Não-Conformidades e Reparos por Unidade</h3>
        <p class="section-description">A tabela abaixo apresenta o volume de não-conformidades encontradas e a quantidade total de reparos que tiveram de ser realizados por apartamento de forma dinâmica.</p>
        
        <table class="report-table apartments-table">
          <thead>
            <tr>
              <th>Nº do Apto</th>
              <th class="text-center">Não-Conformidades Encontradas</th>
              <th class="text-center">Quantidade de Reparos Realizados</th>
              <th>Status de Liberação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apto in apartmentsData" :key="apto.number">
              <td class="font-bold">Apto {{ apto.number }}</td>
              <td class="text-center color-danger font-bold">{{ apto.nonConformities }}</td>
              <td class="text-center color-success font-bold">{{ apto.repairsRealized }}</td>
              <td>
                <span :class="['report-badge', apto.nonConformities > 15 ? 'badge-alert' : 'badge-safe']">
                  {{ apto.nonConformities > 15 ? 'Revisão Prioritária' : 'Liberado' }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total Acumulado</strong></td>
              <td class="text-center font-bold color-danger">{{ totalNonConformitiesSum }}</td>
              <td class="text-center font-bold color-success">{{ totalRepairsSum }}</td>
              <td><strong>—</strong></td>
            </tr>
          </tfoot>
        </table>
      </section>

      <footer class="print-footer">
        <div class="signature-box">
          <div class="line"></div>
          <p>Engenheiro de Qualidade Responsável</p>
        </div>
        <div class="signature-box">
          <div class="line"></div>
          <p>Gestor de Inspeção / Operações</p>
        </div>
      </footer>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'

const router = useRouter()

// Variáveis reativas preparadas para receber os dados vindos da sua API / Store
const buildingName = ref('Edifício Residencial Padrão')
const roomItemsCatalog = ref([])
const apartmentsData = ref([])

// Configurações base do formulário (vêm das especificações do PEO 19)
const itemsPerStandardApartment = ref(118)
const itemsPerDuplexApartment = ref(176)

// Data de emissão automática
const currentLongDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

// --- CÁLCULOS DINÂMICOS (REATIVOS) ---

// 1. Itens por cômodo somados dinamicamente
const totalItemsPerApartment = computed(() => {
  return roomItemsCatalog.value.reduce((acc, room) => acc + room.count, 0)
})

// 2. Separação de tipos de apartamentos (Filtrando dinamicamente pela flag ou tipo se houver)
const totalStandardApartments = computed(() => {
  return apartmentsData.value.filter(apto => !apto.isDuplex).length
})

const totalDuplexApartments = computed(() => {
  return apartmentsData.value.filter(apto => apto.isDuplex).length
})

const totalApartmentsCount = computed(() => {
  return apartmentsData.value.length
})

// 3. Totais de itens verificados com base na quantidade de apartamentos cadastrados
const totalStandardItemsVerified = computed(() => {
  return totalStandardApartments.value * itemsPerStandardApartment.value
})

const totalDuplexItemsVerified = computed(() => {
  return totalDuplexApartments.value * itemsPerDuplexApartment.value
})

const totalGlobalItemsVerified = computed(() => {
  return totalStandardItemsVerified.value + totalDuplexItemsVerified.value
})

// 4. Somatórios das Não-Conformidades e Reparos da tabela analítica
const totalNonConformitiesSum = computed(() => {
  return apartmentsData.value.reduce((acc, apto) => acc + (apto.nonConformities || 0), 0)
})

const totalRepairsSum = computed(() => {
  return apartmentsData.value.reduce((acc, apto) => acc + (apto.repairsRealized || 0), 0)
})

// 5. CÁLCULO REAL DA MÉTRICA DE QUALIDADE (Fórmula PEO 19)
// N° de itens de NC total / (nº itens do formulário x nº apartamentos) * 100
const qualityObjectiveResult = computed(() => {
  if (totalGlobalItemsVerified.value === 0) return '0.00'
  const calculation = (totalNonConformitiesSum.value / totalGlobalItemsVerified.value) * 100
  return calculation.toFixed(2)
})

function printReport() {
  window.print()
}

// Simulação de carregamento de dados (Substitua pelas suas chamadas axios / fetch reais)
onMounted(async () => {
  try {
    // Aqui você vai buscar os dados reais da sua rota de backend, exemplo:
    // const response = await api.get('/reports/building-data')
    
    // Alimentando os cômodos dinamicamente
    roomItemsCatalog.value = [
      { name: 'Sala de Estar/Jantar', count: 12 },
      { name: 'Cozinha e Área de Serviço', count: 14 },
      { name: 'Sacada', count: 16 },
      { name: 'Circulação', count: 9 },
      { name: 'Quarto Maior', count: 11 },
      { name: 'Quarto Menor', count: 11 },
      { name: 'BWC Social', count: 17 },
      { name: 'Quarto Suíte', count: 11 },
      { name: 'BWC Suíte', count: 17 }
    ]

    // Exemplo de como a estrutura do array deve vir para que o Vue calcule tudo sozinho:
    // Cada objeto precisa do número, quantidade de NCs capturadas, e quantos reparos já foram feitos.
    apartmentsData.value = [
      { number: '101', nonConformities: 11, repairsRealized: 11, isDuplex: false },
      { number: '102', nonConformities: 15, repairsRealized: 15, isDuplex: false },
      { number: '103', nonConformities: 12, repairsRealized: 12, isDuplex: false },
      { number: '104', nonConformities: 13, repairsRealized: 13, isDuplex: false },
      { number: '201', nonConformities: 24, repairsRealized: 24, isDuplex: false },
      { number: '202', nonConformities: 21, repairsRealized: 21, isDuplex: false },
      { number: '203', nonConformities: 13, repairsRealized: 13, isDuplex: false },
      { number: '204', nonConformities: 18, repairsRealized: 18, isDuplex: false },
      { number: '301', nonConformities: 18, repairsRealized: 18, isDuplex: false },
      { number: '302', nonConformities: 16, repairsRealized: 16, isDuplex: false },
      { number: '303', nonConformities: 14, repairsRealized: 14, isDuplex: false },
      { number: '304', nonConformities: 13, repairsRealized: 13, isDuplex: false },
      { number: '401', nonConformities: 14, repairsRealized: 14, isDuplex: false },
      { number: '402', nonConformities: 13, repairsRealized: 13, isDuplex: false },
      { number: '4
