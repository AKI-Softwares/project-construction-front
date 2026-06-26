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
          <option value="">-- Escolha um Empreendimento --</option>
          <option v-for="b in empreendimentos" :key="b.id" :value="b.id">
            {{ b.name || b.title }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedBuildingId && !carregando && apartmentsReportData.length > 0" class="report-actions no-print" style="margin-top: 20px;">
      <button class="btn-back" @click="router.back()">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <button class="btn-print" @click="printReport">
        <FontAwesomeIcon :icon="['fas', 'print']" /> Imprimir Relatório
      </button>
    </div>

    <div v-if="carregando" class="loading-box" style="margin-top: 20px;">
      <FontAwesomeIcon :icon="['fas', 'spinner']" spin class="loading-icon" />
      <p style="margin: 0;">Consolidando indicadores reais...</p>
    </div>

    <div v-else-if="!selectedBuildingId" class="empty-card" style="margin-top: 20px;">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
      <p>Aguardando seleção. Escolha um empreendimento cadastrado acima para processar e gerar o relatório.</p>
    </div>

    <div v-else class="report-paper">

      <header class="report-header">
        <div class="header-main">
          <h1>RELATÓRIO CONSOLIDADO</h1>
          <h2>Indicadores Gerais de Vistorias</h2>
        </div>
      </header>

      <hr class="divider" />

      <section class="report-section">
        <h3>1. Indicadores de Desempenho</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Unidades Analisadas</span>
            <span class="metric-value">{{ totalApartmentsWithChecklist }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total de Apontamentos</span>
            <span class="metric-value">{{ totalNonConformitiesSum }}</span>
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
                  <th>Cômodo</th>
                  <th>Total de Itens</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(count, room) in dynamicRoomsMap" :key="room">
                  <td>{{ room }}</td>
                  <td>{{ count }}</td>
                </tr>
                <tr v-if="Object.keys(dynamicRoomsMap).length === 0">
                  <td colspan="2">Nenhum cômodo processado.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-wrapper">
            <h4>Resumo Volumétrico da Obra</h4>
            <table class="report-table summary-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total de Não-Conformidades Identificadas</td>
                  <td>{{ totalNonConformitiesSum }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="page-break"></div>

      <section class="report-section">
        <h3>3. Mapeamento Analítico de Não-Conformidades e Reparos por Unidade</h3>
        <p class="section-description">Volume acumulado de pendências abertas e finalizadas extraídas em tempo real do banco de dados.</p>
        
        <table class="report-table analitica-table">
          <thead>
            <tr>
              <th>Bloco</th>
              <th>Unidade</th>
              <th>Apontamentos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apto in apartmentsReportData" :key="apto.id">
              <td>{{ apto.block }}</td>
              <td>{{ apto.identifier }}</td>
              <td>{{ apto.nonConformitiesCount }}</td>
            </tr>
            <tr v-if="apartmentsReportData.length === 0">
              <td colspan="3">Nenhum dado analítico encontrado para este empreendimento.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="print-footer">
        <div class="signature-box">
          <div class="line"></div>
          <p>Responsável Técnico / Inspeção</p>
        </div>
        <div class="signature-box">
          <div class="line"></div>
          <p>Garantia da Qualidade</p>
        </div>
      </footer>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'

// Importações dos serviços do seu CheckObra
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'

const router = useRouter()

// Estados Reativos Principais
const empreendimentos = ref([])
const selectedBuildingId = ref('')
const carregando = ref(false)

const apartmentsReportData = ref([])
const dynamicRoomsMap = ref({})

// Computados para os cards de indicadores
const totalApartmentsWithChecklist = computed(() => {
  return apartmentsReportData.value.filter(a => a.hasChecklist).length
})

const totalNonConformitiesSum = computed(() => {
  return apartmentsReportData.value.reduce((acc, curr) => acc + (curr.nonConformitiesCount || 0), 0)
})

function printReport() {
  window.print()
}

// Inicialização: Preenche o select superior com os empreendimentos existentes
onMounted(async () => {
  try {
    const res = await getBuildings()
    empreendimentos.value = res?.data || res || []
  } catch (error) {
    console.error('Erro ao buscar empreendimentos para a listagem inicial:', error)
  }
})

// MINERAÇÃO E AGREGAÇÃO DINÂMICA SOB DEMANDA
async function gerarRelatorioReal() {
  // Trava de segurança: se limpou a seleção, reseta o estado.
  if (!selectedBuildingId.value) {
    apartmentsReportData.value = []
    dynamicRoomsMap.value = {}
    return
  }

  carregando.value = true
  const tempReportData = []
  const tempRoomsMap = {}

  try {
    // 1. Busca todos os apartamentos vinculados ao prédio selecionado
    const maisAptos = await getApartments({ buildingId: selectedBuildingId.value })
    const listaAptos = maisAptos?.data || maisAptos || []

    // 2. Varre cada apartamento de forma síncrona para extrair e consolidar métricas da inspeção
    for (const apto of listaAptos) {
      let nonConformitiesCount = 0
      let temChecklist = false

      try {
        const checklistDetail = await getChecklistByApartment(apto.id)
        
        if (checklistDetail && checklistDetail.items) {
          temChecklist = true
          
          for (const item of checklistDetail.items) {
            const roomName = item.apartmentRoomService?.apartmentRoom?.name || 'Geral'
            tempRoomsMap[roomName] = (tempRoomsMap[roomName] || 0) + 1

            // Incrementa se o item possuir falhas/reparos registrados
            if (item.status === 'NC' || item.status === 'REPARO' || item.hasIssues) {
              nonConformitiesCount++
            }
          }
        }
      } catch (err) {
        console.warn(`Checklist ausente ou inacessível para o apartamento ID ${apto.id}`)
      }

      tempReportData.push({
        id: apto.id,
        block: apto.block || 'N/A',
        identifier: apto.identifier || '—',
        hasChecklist: temChecklist,
        nonConformitiesCount
      })
    }

    // Alimenta o estado do componente de forma reativa pós-mineração
    apartmentsReportData.value = tempReportData
    dynamicRoomsMap.value = tempRoomsMap

  } catch (error) {
    console.error('Erro crítico ao minerar dados do relatório consolidado:', error)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.filters-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}
.form-control {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  outline: none;
  background-color: #f9fafb;
}
.report-actions {
  display: flex;
  gap: 12px;
}
.btn-back, .btn-print {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-back { background: #e5e7eb; color: #374151; }
.btn-print { background: #00d5cc; color: #0b1120; }
.loading-box, .empty-card {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  color: #6b7280;
}
.loading-icon, .empty-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #00d5cc;
}
.report-paper {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-top: 20px;
}
.report-header {
  text-align: center;
  margin-bottom: 20px;
}
.report-header h1 { font-size: 1.8rem; color: #111827; margin: 0; }
.report-header h2 { font-size: 1.2rem; color: #4b5563; margin: 5px 0 0; }
.divider { border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0; }
.report-section { margin-bottom: 30px; }
.report-section h3 { font-size: 1.1rem; color: #1f2937; border-left: 4px solid #00d5cc; padding-left: 10px; margin-bottom: 15px; }
.metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.metric-card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 4px; }
.metric-label { font-size: 0.85rem; color: #6b7280; font-weight: 500; }
.metric-value { font-size: 1.8rem; font-weight: bold; color: #111827; }
.tables-split { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.table-wrapper h4 { font-size: 0.95rem; color: #374151; margin: 0 0 10px; }
.report-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.report-table th, .report-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.report-table th { background: #f3f4f6; font-weight: 600; color: #374151; }
.section-description { font-size: 0.85rem; color: #6b7280; margin-bottom: 12px; }
.print-footer { display: flex; justify-content: space-around; margin-top: 60px; padding-top: 20px; }
.signature-box { text-align: center; width: 200px; }
.signature-box .line { border-top: 1px solid #9ca3af; margin-bottom: 8px; }
.signature-box p { font-size: 0.8rem; color: #4b5563; margin: 0; }
.page-break { page-break-before: always; }

@media print {
  .no-print { display: none !important; }
  .report-paper { border: none; padding: 0; margin: 0; }
}
</style>
