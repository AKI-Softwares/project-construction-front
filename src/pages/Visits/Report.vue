<template>
  <MainLayout titulo="Relatório Consolidado de Inspeção">
    
    <div class="report-actions no-print">
      <button class="btn-back" @click="router.back()">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <button v-if="!loading && !error" class="btn-print" @click="printReport">
        <FontAwesomeIcon :icon="['fas', 'print']" /> Imprimir ou Salvar PDF
      </button>
    </div>

    <div v-if="loading" class="loading-box no-print">
      <FontAwesomeIcon :icon="['fas', 'spinner']" spin class="loading-icon" />
      <p>Carregando dados reais do empreendimento e consolidando indicadores...</p>
    </div>

    <div v-else-if="error" class="error-box no-print">
      <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" class="error-icon" />
      <p>{{ error }}</p>
    </div>

    <div v-else class="report-paper">
      
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
              $$\text{Resultado} = \frac{\text{N° de Itens de NC Total}}{\text{Nº Itens do Formulário} \times \text{Nº Entrega de Unidades}} \times 100$$
            </div>
            <p class="formula-note">Métrica real extraída do banco de dados para mensurar a taxa de retrabalho do empreendimento.</p>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h3>2. Escopo Geral e Itens Verificados</h3>
        
        <div class="tables-split">
          <div class="table-wrapper">
            <h4>Matriz de Itens por Cômodo (Configuração do Sistema)</h4>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cômodo / Área Avaliada</th>
                  <th class="text-center">Quantidade de Itens</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in roomItemsCatalog" :key="room.id || room.name">
                  <td>{{ room.name }}</td>
                  <td class="text-center font-bold">{{ room.itemsCount || room.count || 0 }}</td>
                </tr>
                <tr v-if="roomItemsCatalog.length === 0">
                  <td colspan="2" class="text-center text-muted">Nenhum item de catálogo associado.</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total de Itens Base por Unidade</strong></td>
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
                  <th>Categoria / Tipo de Unidade</th>
                  <th class="text-center">Total de Unidades</th>
                  <th class="text-center">Amostragem de Itens Inspecionados</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Unidades Tipo Padrão</strong></td>
                  <td class="text-center">{{ totalStandardApartments }}</td>
                  <td class="text-center">{{ totalStandardItemsVerified }}</td>
                </tr>
                <tr>
                  <td><strong>Unidades Especiais / Duplex</strong></td>
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
        <p class="section-description">Mapeamento dinâmico gerado a partir de todas as inspeções realizadas e registradas no banco de dados para este empreendimento.</p>
        
        <table class="report-table apartments-table">
          <thead>
            <tr>
              <th>Identificação da Unidade</th>
              <th class="text-center">Não-Conformidades Encontradas</th>
              <th class="text-center">Reparos Realizados / Finalizados</th>
              <th>Status Atualizado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apto in apartmentsData" :key="apto.id || apto.number">
              <td class="font-bold">Apto {{ apto.number || apto.roomNumber }}</td>
              <td class="text-center color-danger font-bold">{{ apto.nonConformitiesCount || apto.nonConformities || 0 }}</td>
              <td class="text-center color-success font-bold">{{ apto.repairsRealizedCount || apto.repairsRealized || 0 }}</td>
              <td>
                <span :class="['report-badge', (apto.nonConformitiesCount || apto.nonConformities) > 0 ? 'badge-alert' : 'badge-safe']">
                  {{ (apto.nonConformitiesCount || apto.nonConformities) > 0 ? 'Com Pendências' : 'Finalizado / Liberado' }}
                </span>
              </td>
            </tr>
            <tr v-if="apartmentsData.length === 0">
              <td colspan="4" class="text-center text-muted">Nenhuma vistoria ou apartamento localizado para este empreendimento.</td>
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
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
// IMPORTANTE: Importe o seu cliente HTTP configurado (ex: axios ou api)
// import api from '../../services/api.js' 

const router = useRouter()
const route = useRoute()

// Controle de Estados Reais da Tela
const loading = ref(true)
const error = ref(null)

// Variáveis reativas que vão armazenar EXCLUSIVAMENTE o que vier do banco
const buildingName = ref('')
const roomItemsCatalog = ref([])
const apartmentsData = ref([])

// Pesos de itens padrão do formulário técnico PEO 19
const itemsPerStandardApartment = ref(118)
const itemsPerDuplexApartment = ref(176)

const currentLongDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

// --- PROCESSAMENTO COMPUTADO DINÂMICO DOS DADOS DA API ---

const totalItemsPerApartment = computed(() => {
  return roomItemsCatalog.value.reduce((acc, room) => acc + (room.itemsCount || room.count || 0), 0)
})

const totalStandardApartments = computed(() => {
  return apartmentsData.value.filter(apto => !apto.isDuplex).length
})

const totalDuplexApartments = computed(() => {
  return apartmentsData.value.filter(apto => apto.isDuplex).length
})

const totalApartmentsCount = computed(() => {
  return apartmentsData.value.length
})

const totalStandardItemsVerified = computed(() => {
  return totalStandardApartments.value * itemsPerStandardApartment.value
})

const totalDuplexItemsVerified = computed(() => {
  return totalDuplexApartments.value * itemsPerDuplexApartment.value
})

const totalGlobalItemsVerified = computed(() => {
  return totalStandardItemsVerified.value + totalDuplexItemsVerified.value
})

const totalNonConformitiesSum = computed(() => {
  return apartmentsData.value.reduce((acc, apto) => acc + (apto.nonConformitiesCount || apto.nonConformities || 0), 0)
})

const totalRepairsSum = computed(() => {
  return apartmentsData.value.reduce((acc, apto) => acc + (apto.repairsRealizedCount || apto.repairsRealized || 0), 0)
})

const qualityObjectiveResult = computed(() => {
  if (totalGlobalItemsVerified.value === 0) return '0.00'
  const calculation = (totalNonConformitiesSum.value / totalGlobalItemsVerified.value) * 100
  return calculation.toFixed(2)
})

function printReport() {
  window.print()
}

// BUSCA REAL DOS DADOS DO EMPREENDIMENTO CADASTRADO
onMounted(async () => {
  // Pega o ID do empreendimento passado via query string na URL (ex: /relatorios?buildingId=123)
  const buildingId = route.query.buildingId

  if (!buildingId) {
    error.value = 'Nenhum código de empreendimento foi fornecido para gerar o relatório.'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    // EXECUÇÃO DAS SUAS CHAMADAS DE API REAIS (Substitua as URLs pelos endpoints exatos do seu backend)
    // Exemplo usando Promise.all para carregar tudo em paralelo com alta performance:
    
    /* const [buildingRes, catalogRes, visitsRes] = await Promise.all([
      api.get(`/buildings/${buildingId}`),
      api.get(`/services/catalog`), // Ajuste para a sua rota de catálogo/itens
      api.get(`/visits?buildingId=${buildingId}`) // Traz as vistorias/apartamentos do prédio
    ])

    buildingName.value = buildingRes.data.name
    roomItemsCatalog.value = catalogRes.data // Array de cômodos cadastrados
    apartmentsData.value = visitsRes.data // Array contendo as unidades, NCs e reparos
    */

    // OBSERVAÇÃO: Mapeie os campos acima de acordo com o retorno do seu JSON do Backend 
    // (ex: se o número do apto vier como `apto.roomNumber`, o Vue já aceita dinamicamente no template)

  } catch (err) {
    console.error('Erro ao conectar com a API do CheckObra:', err)
    error.value = 'Falha ao processar os indicadores da API. Verifique a conexão com o banco de dados.'
  } finally {
    // Apenas para testes temporários enquanto você não descomenta as linhas de api.get:
    loading.value = false 
  }
})
</script>

<style scoped>
.report-actions { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-back { background: none; border: none; color: #555; font-weight: 600; cursor: pointer; }
.btn-print { background: #00e5cc; color: #0d0d2b; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }

/* Boxes de status da API */
.loading-box, .error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  text-align: center;
  color: #555;
  gap: 16px;
}
.loading-icon { font-size: 2rem; color: #00e5cc; }
.error-icon { font-size: 2rem; color: #c0392b; }
.error-box p { color: #c0392b; font-weight: 500; }

.report-paper { background: #fff; color: #222; padding: 40px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
.report-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-main h1 { font-size: 1.4rem; color: #0d0d2b; letter-spacing: 0.5px; margin-bottom: 4px; }
.header-main h2 { font-size: 0.95rem; color: #555; font-weight: 500; }
.header-meta { text-align: right; font-size: 0.85rem; color: #666; }
.divider { border: 0; border-top: 2px solid #0d0d2b; margin: 20px 0 30px 0; }
.report-section { margin-bottom: 35px; }
.report-section h3 { font-size: 1.1rem; color: #0d0d2b; border-left: 4px solid #00e5cc; padding-left: 10px; margin-bottom: 15px; }
.section-description { font-size: 0.88rem; color: #555; margin-bottom: 15px; }
.quality-grid { display: flex; gap: 24px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
.quality-card { background: #fff; border: 1px solid #e0e0e0; padding: 16px; border-radius: 6px; min-width: 220px; display: flex; flex-direction: column; justify-content: center; }
.quality-card.highlight { border-top: 4px solid #c0392b; }
.card-label { font-size: 0.8rem; font-weight: bold; color: #555; }
.card-value { font-size: 2rem; font-weight: 800; color: #c0392b; margin: 6px 0; }
.card-sub { font-size: 0.72rem; color: #888; }
.formula-box { flex: 1; font-size: 0.85rem; }
.formula-display { background: #fff; padding: 12px; border-radius: 6px; margin: 8px 0; border: 1px dashed #ccc; overflow-x: auto; }
.formula-note { font-size: 0.75rem; color: #777; font-style: italic; }
.tables-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.table-wrapper h4 { font-size: 0.9rem; color: #444; margin-bottom: 10px; }
.report-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 15px; }
.report-table th { background: #f1f1f1; color: #333; font-weight: 600; padding: 10px; border: 1px solid #ddd; text-align: left; }
.report-table td { padding: 8px 10px; border: 1px solid #ddd; color: #444; }
.report-table tfoot td { background: #f9f9f9; font-weight: bold; border-top: 2px solid #333; }
.apartments-table { margin-top: 15px; }
.apartments-table tbody tr:nth-child(even) { background: #fbfbfb; }
.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.color-danger { color: #c0392b; }
.color-success { color: #00897b; }
.color-cyan { color: #00b3a0; }
.text-muted { color: #888; font-style: italic; }
.report-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: bold; }
.badge-alert { background: #fdecea; color: #c0392b; }
.badge-safe { background: #e0faf6; color: #00897b; }
.print-footer { display: none; }

@media print {
  body { background: #fff; color: #000; }
  .no-print { display: none !important; }
  .report-paper { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; background: transparent !important; }
  .report-table th { background: #eaeaea !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .quality-grid { background: #f5f5f5 !important; border: 1px solid #ccc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-break { display: block; page-break-before: always; }
  .print-footer { display: flex; justify-content: space-between; margin-top: 80px; page-break-inside: avoid; }
  .signature-box { width: 45%; text-align: center; font-size: 0.85rem; }
  .signature-box .line { border-top: 1px solid #000; margin-bottom: 8px; }
}
</style>
