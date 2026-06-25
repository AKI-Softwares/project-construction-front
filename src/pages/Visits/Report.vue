<template>
  <MainLayout titulo="Relatório Consolidado de Inspeção">
    
    <div class="filters-card no-print">
      <div class="form-group">
        <label for="building-select">Selecione o Empreendimento para o Relatório:</label>
        <select 
          id="building-select" 
          v-model="selectedBuildingId" 
          @change="gerarRelatorioReal"
          class="form-control"
        >
          <option value="">-- Escolha um empreendimento --</option>
          <option v-for="b in empreendimentos" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedBuildingId && !carregando" class="report-actions no-print" style="margin-top: 20px;">
      <button class="btn-back" @click="router.back()">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <button class="btn-print" @click="printReport">
        <FontAwesomeIcon :icon="['fas', 'print']" /> Imprimir ou Salvar PDF
      </button>
    </div>

    <div v-if="carregando" class="loading-box">
      <FontAwesomeIcon :icon="['fas', 'spinner']" spin class="loading-icon" />
      <p style="margin: 0;">Minerando árvore de checklists e consolidando indicadores reais...</p>
    </div>

    <div v-else-if="!selectedBuildingId" class="empty-card" style="margin-top: 20px;">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
      <p>Selecione um empreendimento cadastrado acima para processar e gerar o relatório PEO 19 real.</p>
    </div>

    <div v-else class="report-paper">
      
      <header class="report-header">
        <div class="header-main">
          <h1>RELATÓRIO CONSOLIDADO</h1>
          <h2>PEO 19 — CHECK LIST DE INSPEÇÃO FINAL</h2>
        </div>
        <div class="header-meta">
          <p><strong>Empreendimento:</strong> {{ nomePredioSelecionado }}</p>
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
            <p class="formula-note">Métrica real do PEO 19 extraída agregando dinamicamente os registros de vistorias.</p>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h3>2. Escopo Geral e Itens Verificados</h3>
        
        <div class="tables-split">
          <div class="table-wrapper">
            <h4>Matriz de Cômodos Identificados nas Vistorias</h4>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cômodo / Área Avaliada</th>
                  <th class="text-center">Vistorias Encontradas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in roomCatalog" :key="room.name">
                  <td>{{ room.name }}</td>
                  <td class="text-center font-bold">{{ room.count }}</td>
                </tr>
                <tr v-if="roomCatalog.length === 0">
                  <td colspan="2" class="text-center text-muted">Nenhum cômodo mapeado nos checklists.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-wrapper">
            <h4>Resumo Volumétrico da Obra</h4>
            <table class="report-table summary-table">
              <thead>
                <tr>
                  <th>Categoria / Métrica</th>
                  <th class="text-center">Totalizador Real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Total de Apartamentos Cadastrados</strong></td>
                  <td class="text-center font-bold">{{ totalApartmentsCount }}</td>
                </tr>
                <tr>
                  <td><strong>Unidades Inspecionadas (Com Checklist)</strong></td>
                  <td class="text-center color-success font-bold">{{ totalApartmentsWithChecklist }}</td>
                </tr>
                <tr>
                  <td><strong>Total de Não-Conformidades Históricas</strong></td>
                  <td class="text-center color-danger font-bold">{{ totalNonConformitiesSum }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="page-break"></div>

      <section class="report-section">
        <h3>3. Mapeamento Analítico de Não-Conformidades e Reparos por Unidade</h3>
        <p class="section-description">Volume acumulado de pendências abertas (reparos pendentes) e finalizados extraídos em tempo real do banco de dados.</p>
        
        <table class="report-table apartments-table">
          <thead>
            <tr>
              <th>Identificação da Unidade</th>
              <th class="text-center">Não-Conformidades Ativas (Pendentes)</th>
              <th class="text-center">Reparos Realizados (Resolvidos)</th>
              <th>Status Atualizado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apto in apartmentsReportData" :key="apto.id">
              <td class="font-bold">{{ apto.block }} - {{ apto.identifier }}</td>
              <td class="text-center color-danger font-bold">{{ apto.pendentes }}</td>
              <td class="text-center color-success font-bold">{{ apto.resolvidos }}</td>
              <td>
                <span :class="['report-badge', apto.pendentes > 0 ? 'badge-alert' : 'badge-safe']">
                  {{ apto.pendentes > 0 ? 'Com Pendências' : 'Finalizado / Liberado' }}
                </span>
              </td>
            </tr>
            <tr v-if="apartmentsReportData.length === 0">
              <td colspan="4" class="text-center text-muted">Nenhum apartamento localizado ou inspecionado para este empreendimento.</td>
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

// Importações dos seus serviços reais do CheckObra
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'

const router = useRouter()

// Estados Reativos do Sistema
const empreendimentos = ref([])
const selectedBuildingId = ref('')
const carregando = ref(false)

// Dados Agregados Reais
const apartmentsReportData = ref([])
const dynamicRoomsMap = ref({})

const currentLongDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const nomePredioSelecionado = computed(() => {
  const b = empreendimentos.value.find(x => x.id === selectedBuildingId.value)
  return b ? b.name : ''
})

// --- CÁLCULO VOLUMÉTRICO E INDICADORES REAIS ---
const totalApartmentsCount = computed(() => apartmentsReportData.value.length)
const totalApartmentsWithChecklist = computed(() => apartmentsReportData.value.filter(a => a.hasChecklist).length)

const totalNonConformitiesSum = computed(() => {
  return apartmentsReportData.value.reduce((acc, a) => acc + a.pendentes, 0)
})

const totalRepairsSum = computed(() => {
  return apartmentsReportData.value.reduce((acc, a) => acc + a.resolvidos, 0)
})

const roomCatalog = computed(() => {
  return Object.keys(dynamicRoomsMap.value).map(key => ({
    name: key,
    count: dynamicRoomsMap.value[key]
  }))
})

// Fórmula PEO 19 baseada nos dados minerados reais
const qualityObjectiveResult = computed(() => {
  const totalInspecionados = totalApartmentsWithChecklist.value * 118 // Fator padrão baseado em itens base
  if (totalInspecionados === 0) return '0.00'
  const calc = (totalNonConformitiesSum.value / totalInspecionados) * 100
  return calc.toFixed(2)
})

function printReport() {
  window.print()
}

// Carrega os empreendimentos do banco de dados na inicialização
onMounted(async () => {
  try {
    const res = await getBuildings()
    empreendimentos.value = res || []
  } catch (error) {
    console.error('Erro ao buscar empreendimentos para o relatório:', error)
  }
})

// MINERAÇÃO E AGREGAÇÃO DINÂMICA (Padrão ouro do seu back-end)
async function gerarRelatorioReal() {
  if (!selectedBuildingId.value) {
    apartmentsReportData.value = []
    dynamicRoomsMap.value = {}
    return
  }

  carregando.value = true
  apartmentsReportData.value = []
  dynamicRoomsMap.value = {}

  try {
    // 1. Busca todos os apartamentos vinculados ao prédio
    const maisAptos = await getApartments({ buildingId: selectedBuildingId.value })
    const listaAptos = maisAptos?.data || maisAptos || []

    const tempReportData = []
    const tempRoomsMap = {}

    // 2. Itera nos apartamentos cruzando os dados analíticos dos checklists
    for (const apto of listaAptos) {
      let contagemPendentes = 0
      let contagemResolvidos = 0
      let temChecklist = false

      try {
        const checklistDetail = await getChecklistByApartment(apto.id)
        
        if (checklistDetail && checklistDetail.items) {
          temChecklist = true
          
          for (const item of checklistDetail.items) {
            // Conta e cataloga os cômodos que estão passando pelas vistorias
            const roomName = item.apartmentRoomService?.apartmentRoom?.name || 'Geral'
            tempRoomsMap[roomName] = (tempRoomsMap[roomName] || 0) + 1

            if (item.status === 'NOK' && item.visitItems) {
              for (const vi of item.visitItems) {
                const nc = vi?.nonConformity
                if (nc) {
                  // Regra de ouro: se resolvedAt for null está ativo (Pendente), senão está Resolvido
                  if (nc.resolvedAt === null) {
                    contagemPendentes++
                  } else {
                    contagemResolvidos++
                  }
                }
              }
            }
          }
        }
      } catch (errCheck) {
        console.warn(`Checklist ausente ou inacessível para o apartamento ID ${apto.id}`)
      }

      // Adiciona o balanço volumétrico real daquela unidade autônoma
      tempReportData.push({
        id: apto.id,
        block: apto.block || 'N/A',
        identifier: apto.identifier || 'N/A',
        pendentes: contagemPendentes,
        resolvidos: contagemResolvidos,
        hasChecklist: temChecklist
      })
    }

    apartmentsReportData.value = tempReportData
    dynamicRoomsMap.value = tempRoomsMap

  } catch (error) {
    console.error('Erro ao processar agregação de dados do relatório:', error)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.filters-card { background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #eee; }
.form-group { display: flex; flex-direction: column; gap: 8px; max-width: 400px; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #0d0d2b; }
.form-control { padding: 10px 14px; border-radius: 6px; border: 1px solid #ccc; background-color: #fff; font-size: 0.9rem; color: #333; outline: none; width: 100%; }
.form-control:focus { border-color: #00e5cc; }

.report-actions { display: flex; justify-content: space-between; }
.btn-back { background: none; border: none; color: #555; font-weight: 600; cursor: pointer; }
.btn-print { background: #00e5cc; color: #0d0d2b; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }

.loading-box { text-align: center; padding: 40px; background: #fff; border-radius: 8px; border: 1px solid #eee; color: #555; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.loading-icon { font-size: 1.8rem; color: #00e5cc; }

.empty-card { background: #fff; border-radius: 8px; padding: 40px; border: 1px solid #eee; text-align: center; color: #666; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-icon { font-size: 2rem; color: #b0bec5; }

.report-paper { background: #fff; color: #222; padding: 40px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: sans-serif; margin-top: 20px; }
.report-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-main h1 { font-size: 1.3rem; color: #0d0d2b; margin: 0 0 4px 0; letter-spacing: 0.5px; }
.header-main h2 { font-size: 0.9rem; color: #555; font-weight: 500; margin: 0; }
.header-meta { text-align: right; font-size: 0.85rem; color: #666; margin: 0; }
.header-meta p { margin: 4px 0; }
.divider { border: 0; border-top: 2px solid #0d0d2b; margin: 20px 0; }

.report-section { margin-bottom: 30px; }
.report-section h3 { font-size: 1.05rem; color: #0d0d2b; border-left: 4px solid #00e5cc; padding-left: 10px; margin-top: 0; margin-bottom: 15px; }
.section-description { font-size: 0.85rem; color: #555; margin-bottom: 15px; }

.quality-grid { display: flex; gap: 20px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
.quality-card { background: #fff; border: 1px solid #e0e0e0; padding: 16px; border-radius: 6px; min-width: 200px; display: flex; flex-direction: column; justify-content: center; border-top: 4px solid #c0392b; }
.card-label { font-size: 0.78rem; font-weight: bold; color: #555; }
.card-value { font-size: 1.8rem; font-weight: 800; color: #c0392b; margin: 4px 0; }
.card-sub { font-size: 0.7rem; color: #888; }
.formula-box { flex: 1; font-size: 0.82rem; color: #444; }
.formula-display { background: #fff; padding: 10px; border-radius: 6px; margin: 6px 0; border: 1px dashed #ccc; font-family: monospace; }
.formula-note { font-size: 0.72rem; color: #777; font-style: italic; margin: 0; }

.tables-split { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-wrapper h4 { font-size: 0.85rem; color: #444; margin-top: 0; margin-bottom: 10px; }
.report-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.report-table th { background: #f1f1f1; color: #333; font-weight: 600; padding: 8px 10px; border: 1px solid #ddd; }
.report-table td { padding: 8px 10px; border: 1px solid #ddd; color: #444; }
.report-table tfoot td { background: #f9f9f9; font-weight: bold; border-top: 2px solid #333; }

.apartments-table tbody tr:nth-child(even) { background: #fbfbfb; }
.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.color-danger { color: #c0392b; }
.color-success { color: #00897b; }
.text-muted { color: #888; font-style: italic; }

.report-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.badge-alert { background: #fdecea; color: #c0392b; }
.badge-safe { background: #e0faf6; color: #00897b; }
.print-footer { display: none; }

@media print {
  .no-print { display: none !important; }
  .report-paper { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
  .report-table th { background: #eaeaea !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .page-break { display: block; page-break-before: always; }
  .print-footer { display: flex; justify-content: space-between; margin-top: 60px; page-break-inside: avoid; }
  .signature-box { width: 45%; text-align: center; font-size: 0.8rem; }
  .signature-box .line { border-top: 1px solid #000; margin-bottom: 6px; }
}
</style>
