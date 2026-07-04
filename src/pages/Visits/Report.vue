<template>
  <MainLayout titulo="Relatório de Inspeção">

    <!-- Filtros -->
    <div class="filters-card no-print">
      <div class="form-group">
        <label>Selecione o empreendimento</label>
        <select v-model="selectedBuildingId" @change="gerarRelatorioReal" class="form-control">
          <option value="">-- Escolha um empreendimento --</option>
          <option v-for="b in empreendimentos" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <!-- Ações -->
    <div v-if="selectedBuildingId && !carregando && apartmentsReportData.length > 0" class="report-actions no-print">
      <button class="btn-back" @click="router.back()">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <div class="btn-group">
        <button class="btn-print" @click="printReport">
          <FontAwesomeIcon :icon="['fas', 'print']" /> Imprimir / Salvar PDF
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading-box">
      <FontAwesomeIcon :icon="['fas', 'spinner']" spin class="loading-icon" />
      <p>Carregando dados das vistorias...</p>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!selectedBuildingId" class="empty-card">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
      <p>Selecione um empreendimento para gerar o relatório.</p>
    </div>

    <!-- Laudo -->
    <div v-else id="report-paper" class="report-paper">

      <!-- Cabeçalho -->
      <header class="report-header">
        <div class="header-brand">
          <div class="brand-badge">CheckObra</div>
          <div class="header-titles">
            <h1>LAUDO DE INSPEÇÃO FINAL</h1>
            <h2>Relatório Consolidado de Vistorias</h2>
          </div>
        </div>
        <div class="header-meta">
          <p><strong>Empreendimento:</strong> {{ nomePredioSelecionado }}</p>
          <p><strong>Data de emissão:</strong> {{ currentLongDate }}</p>
          <p><strong>Gerado por:</strong> CheckObra Backoffice</p>
        </div>
      </header>

      <hr class="divider" />

      <!-- Seção 1: Resumo executivo -->
      <section class="report-section">
        <h3>1. Resumo Executivo</h3>
        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-label">Unidades cadastradas</span>
            <span class="summary-value">{{ totalApartmentsCount }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Unidades inspecionadas</span>
            <span class="summary-value color-success">{{ totalApartmentsWithChecklist }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Não conformidades ativas</span>
            <span class="summary-value color-danger">{{ totalNonConformitiesSum }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Reparos realizados</span>
            <span class="summary-value color-info">{{ totalRepairsSum }}</span>
          </div>
          <div class="summary-card highlight">
            <span class="summary-label">Índice de não conformidade</span>
            <span class="summary-value color-danger">{{ qualityObjectiveResult }}%</span>
          </div>
        </div>
      </section>

      <!-- Seção 2: Cômodos inspecionados -->
      <section class="report-section" v-if="roomCatalog.length > 0">
        <h3>2. Cômodos Inspecionados</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Cômodo / Área</th>
              <th class="text-center">Ocorrências nas vistorias</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in roomCatalog" :key="room.name">
              <td>{{ room.name }}</td>
              <td class="text-center font-bold">{{ room.count }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="page-break"></div>

      <!-- Seção 3: Detalhamento por unidade -->
      <section class="report-section">
        <h3>3. Detalhamento por Unidade</h3>
        <p class="section-description">
          Levantamento de não conformidades pendentes e reparos realizados por apartamento.
        </p>

        <table class="report-table apartments-table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th class="text-center">NCs Ativas</th>
              <th class="text-center">Reparos Realizados</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apto in apartmentsReportData" :key="apto.id">
              <td class="font-bold">{{ apto.block !== 'N/A' ? apto.block + ' - ' : '' }}{{ apto.identifier }}</td>
              <td class="text-center color-danger font-bold">{{ apto.pendentes }}</td>
              <td class="text-center color-success font-bold">{{ apto.resolvidos }}</td>
              <td class="text-center">
                <span :class="['report-badge', apto.pendentes > 0 ? 'badge-alert' : 'badge-safe']">
                  {{ apto.pendentes > 0 ? 'Com Pendências' : 'Liberado' }}
                </span>
              </td>
            </tr>
            <tr v-if="apartmentsReportData.length === 0">
              <td colspan="4" class="text-center text-muted">Nenhum apartamento inspecionado.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td class="text-center font-bold color-danger">{{ totalNonConformitiesSum }}</td>
              <td class="text-center font-bold color-success">{{ totalRepairsSum }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- Rodapé de assinaturas -->
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
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'

const router = useRouter()

const empreendimentos = ref([])
const selectedBuildingId = ref('')
const carregando = ref(false)

const apartmentsReportData = ref([])
const dynamicRoomsMap = ref({})
const totalItemsSum = ref(0)

const currentLongDate = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
)

const nomePredioSelecionado = computed(() => {
  const b = empreendimentos.value.find(x => x.id === selectedBuildingId.value)
  return b ? b.name : ''
})

const totalApartmentsCount = computed(() => apartmentsReportData.value.length)
const totalApartmentsWithChecklist = computed(() => apartmentsReportData.value.filter(a => a.hasChecklist).length)
const totalNonConformitiesSum = computed(() => apartmentsReportData.value.reduce((acc, a) => acc + a.pendentes, 0))
const totalRepairsSum = computed(() => apartmentsReportData.value.reduce((acc, a) => acc + a.resolvidos, 0))
const roomCatalog = computed(() =>
  Object.keys(dynamicRoomsMap.value).map(key => ({ name: key, count: dynamicRoomsMap.value[key] }))
)

const qualityObjectiveResult = computed(() => {
  if (totalItemsSum.value === 0) return '0.00'
  return ((totalNonConformitiesSum.value / totalItemsSum.value) * 100).toFixed(2)
})

function printReport() {
  window.print()
}

onMounted(async () => {
  try {
    const res = await getBuildings()
    empreendimentos.value = res || []
  } catch (e) {
    console.error('Erro ao buscar empreendimentos:', e)
  }
})

async function gerarRelatorioReal() {
  if (!selectedBuildingId.value) {
    apartmentsReportData.value = []
    dynamicRoomsMap.value = {}
    return
  }

  carregando.value = true
  apartmentsReportData.value = []
  dynamicRoomsMap.value = {}
  totalItemsSum.value = 0

  try {
    const maisAptos = await getApartments(selectedBuildingId.value)
    const listaAptos = Array.isArray(maisAptos) ? maisAptos : (maisAptos?.data || [])

    const tempReportData = []
    const tempRoomsMap = {}

    for (const apto of listaAptos) {
      let pendentes = 0
      let resolvidos = 0
      let temChecklist = false

      try {
        const checklistDetail = await getChecklistByApartment(apto.id)

        if (checklistDetail?.items) {
          temChecklist = true
          totalItemsSum.value += checklistDetail.items.length

          for (const item of checklistDetail.items) {
            const roomName = item.apartmentRoomService?.apartmentRoom?.name || 'Geral'
            tempRoomsMap[roomName] = (tempRoomsMap[roomName] || 0) + 1

            if (item.status === 'NOK' && item.visitItems) {
              for (const vi of item.visitItems) {
                const nc = vi?.nonConformity
                if (nc) {
                  nc.resolvedAt === null ? pendentes++ : resolvidos++
                }
              }
            }
          }
        }
      } catch {
        // Apartamento sem checklist — continua
      }

      tempReportData.push({
        id: apto.id,
        block: apto.block || 'N/A',
        identifier: apto.identifier || 'N/A',
        pendentes,
        resolvidos,
        hasChecklist: temChecklist,
      })
    }

    apartmentsReportData.value = tempReportData
    dynamicRoomsMap.value = tempRoomsMap
  } catch (e) {
    console.error('Erro ao processar relatório:', e)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.filters-card { background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #eee; }
.form-group { display: flex; flex-direction: column; gap: 8px; max-width: 400px; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #333; }
.form-control { padding: 10px 14px; border-radius: 6px; border: 1px solid #ccc; font-size: 0.9rem; color: #333; outline: none; width: 100%; }
.form-control:focus { border-color: #00e5cc; }

.report-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
.btn-group { display: flex; gap: 10px; }
.btn-back { background: none; border: none; color: #555; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-print { background: #0b1120; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; }

.loading-box { text-align: center; padding: 40px; background: #fff; border-radius: 8px; border: 1px solid #eee; color: #555; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
.loading-icon { font-size: 1.8rem; color: #00e5cc; }
.empty-card { background: #fff; border-radius: 8px; padding: 40px; border: 1px solid #eee; text-align: center; color: #666; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
.empty-icon { font-size: 2rem; color: #b0bec5; }

.report-paper { background: #fff; color: #222; padding: 48px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 20px; font-family: 'Inter', sans-serif; }

/* Header */
.report-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-brand { display: flex; align-items: center; gap: 16px; }
.brand-badge { background: #0b1120; color: #00e5cc; font-weight: 800; font-size: 1rem; padding: 6px 14px; border-radius: 6px; letter-spacing: 1px; }
.header-titles h1 { font-size: 1.2rem; color: #0b1120; margin: 0 0 2px; letter-spacing: 0.5px; }
.header-titles h2 { font-size: 0.85rem; color: #666; font-weight: 400; margin: 0; }
.header-meta { text-align: right; font-size: 0.82rem; color: #555; }
.header-meta p { margin: 3px 0; }
.divider { border: 0; border-top: 2px solid #0b1120; margin: 20px 0; }

/* Sections */
.report-section { margin-bottom: 32px; }
.report-section h3 { font-size: 0.95rem; color: #0b1120; border-left: 4px solid #00e5cc; padding-left: 10px; margin: 0 0 16px; }
.section-description { font-size: 0.82rem; color: #666; margin-bottom: 12px; }

/* Summary cards */
.summary-cards { display: flex; gap: 12px; flex-wrap: wrap; }
.summary-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 14px 18px; min-width: 150px; display: flex; flex-direction: column; gap: 4px; }
.summary-card.highlight { border-top: 3px solid #c0392b; }
.summary-label { font-size: 0.72rem; color: #777; font-weight: 600; text-transform: uppercase; }
.summary-value { font-size: 1.6rem; font-weight: 800; color: #0b1120; }

/* Tables */
.report-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.report-table th { background: #f1f1f1; color: #333; font-weight: 600; padding: 8px 12px; border: 1px solid #ddd; }
.report-table td { padding: 8px 12px; border: 1px solid #ddd; color: #444; }
.report-table tfoot td { background: #f5f5f5; font-weight: bold; border-top: 2px solid #333; }
.apartments-table tbody tr:nth-child(even) { background: #fafafa; }

.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.color-danger { color: #c0392b; }
.color-success { color: #00897b; }
.color-info { color: #1976d2; }
.text-muted { color: #888; font-style: italic; }

.report-badge { padding: 3px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: bold; }
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
