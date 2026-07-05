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
      <button class="btn-pdf" :disabled="gerandoPdf" @click="downloadPdf">
        <FontAwesomeIcon :icon="['fas', 'file-circle-plus']" />
        {{ gerandoPdf ? 'Gerando PDF...' : 'Baixar Laudo PDF' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="loading-box">
      <FontAwesomeIcon :icon="['fas', 'spinner']" spin class="loading-icon" />
      <p>Carregando dados das vistorias...</p>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!selectedBuildingId" class="empty-card">
      <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
      <p>Selecione um empreendimento para gerar o laudo.</p>
    </div>

    <!-- Preview do laudo na tela -->
    <div v-else class="report-paper">

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
        </div>
      </header>

      <hr class="divider" />

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
            <span class="summary-label">NCs ativas</span>
            <span class="summary-value color-danger">{{ totalNonConformitiesSum }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Reparos realizados</span>
            <span class="summary-value color-info">{{ totalRepairsSum }}</span>
          </div>
          <div class="summary-card highlight">
            <span class="summary-label">Índice de NC</span>
            <span class="summary-value color-danger">{{ qualityObjectiveResult }}%</span>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h3>2. Detalhamento por Unidade</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th class="text-center">NCs Ativas</th>
              <th class="text-center">Reparos</th>
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

      <section class="report-section signatures-preview">
        <h3>3. Assinaturas</h3>
        <div class="signatures-row">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-name">Engenheiro de Qualidade Responsável</p>
            <p class="signature-label">Nome / CREA</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-name">Gestor de Inspeção / Operações</p>
            <p class="signature-label">Nome / Cargo</p>
          </div>
        </div>
      </section>

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
const gerandoPdf = ref(false)

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

async function downloadPdf() {
  gerandoPdf.value = true
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentW = pageW - margin * 2
    let y = margin

    // ── Helpers ──────────────────────────────────────────────
    const checkPage = (needed = 10) => {
      if (y + needed > pageH - 20) {
        doc.addPage()
        y = margin
      }
    }

    const drawHLine = (color = [200, 200, 200]) => {
      doc.setDrawColor(...color)
      doc.line(margin, y, pageW - margin, y)
      y += 4
    }

    // ── Cabeçalho ─────────────────────────────────────────────
    // Badge CheckObra
    doc.setFillColor(11, 17, 32)
    doc.roundedRect(margin, y, 38, 10, 2, 2, 'F')
    doc.setTextColor(0, 229, 204)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CheckObra', margin + 19, y + 6.5, { align: 'center' })

    // Título
    doc.setTextColor(11, 17, 32)
    doc.setFontSize(14)
    doc.text('LAUDO DE INSPEÇÃO FINAL', margin + 44, y + 5)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Relatório Consolidado de Vistorias', margin + 44, y + 10)

    // Meta (canto direito)
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text(`Empreendimento: ${nomePredioSelecionado.value}`, pageW - margin, y + 3, { align: 'right' })
    doc.text(`Data de emissão: ${currentLongDate.value}`, pageW - margin, y + 8, { align: 'right' })

    y += 16
    doc.setDrawColor(11, 17, 32)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 6

    // ── Seção 1: Resumo ───────────────────────────────────────
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 17, 32)
    doc.setFillColor(0, 229, 204)
    doc.rect(margin, y, 3, 6, 'F')
    doc.text('1. Resumo Executivo', margin + 5, y + 5)
    y += 10

    // Cards de resumo em linha
    const cards = [
      { label: 'Unidades Cadastradas', value: String(totalApartmentsCount.value), color: [11, 17, 32] },
      { label: 'Unidades Inspecionadas', value: String(totalApartmentsWithChecklist.value), color: [0, 137, 123] },
      { label: 'NCs Ativas', value: String(totalNonConformitiesSum.value), color: [192, 57, 43] },
      { label: 'Reparos Realizados', value: String(totalRepairsSum.value), color: [25, 118, 210] },
      { label: 'Índice de NC', value: `${qualityObjectiveResult.value}%`, color: [192, 57, 43] },
    ]

    const cardW = contentW / cards.length
    cards.forEach((card, i) => {
      const cx = margin + i * cardW
      doc.setFillColor(249, 249, 249)
      doc.setDrawColor(220, 220, 220)
      doc.roundedRect(cx, y, cardW - 2, 18, 1, 1, 'FD')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text(card.label, cx + (cardW - 2) / 2, y + 5, { align: 'center', maxWidth: cardW - 4 })
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...card.color)
      doc.text(card.value, cx + (cardW - 2) / 2, y + 14, { align: 'center' })
    })
    y += 24

    // ── Seção 2: Cômodos ──────────────────────────────────────
    if (roomCatalog.value.length > 0) {
      checkPage(40)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(11, 17, 32)
      doc.setFillColor(0, 229, 204)
      doc.rect(margin, y, 3, 6, 'F')
      doc.text('2. Cômodos Inspecionados', margin + 5, y + 5)
      y += 10

      // Cabeçalho tabela
      doc.setFillColor(241, 241, 241)
      doc.rect(margin, y, contentW, 7, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text('Cômodo / Área', margin + 2, y + 5)
      doc.text('Ocorrências', pageW - margin - 2, y + 5, { align: 'right' })
      y += 7

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      roomCatalog.value.forEach((room, i) => {
        checkPage(7)
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, y, contentW, 6, 'F')
        }
        doc.setTextColor(60, 60, 60)
        doc.text(room.name, margin + 2, y + 4)
        doc.setFont('helvetica', 'bold')
        doc.text(String(room.count), pageW - margin - 2, y + 4, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setDrawColor(230, 230, 230)
        doc.line(margin, y + 6, pageW - margin, y + 6)
        y += 6
      })
      y += 6
    }

    // ── Seção 3: Detalhamento por unidade ─────────────────────
    checkPage(20)
    const secNum = roomCatalog.value.length > 0 ? '3' : '2'
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 17, 32)
    doc.setFillColor(0, 229, 204)
    doc.rect(margin, y, 3, 6, 'F')
    doc.text(`${secNum}. Detalhamento por Unidade`, margin + 5, y + 5)
    y += 10

    // Cabeçalho tabela
    const colWidths = [contentW * 0.35, contentW * 0.2, contentW * 0.2, contentW * 0.25]
    const colHeaders = ['Unidade', 'NCs Ativas', 'Reparos', 'Status']
    const colAligns = ['left', 'center', 'center', 'center']

    doc.setFillColor(241, 241, 241)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    let cx = margin
    colHeaders.forEach((h, i) => {
      const tx = colAligns[i] === 'center' ? cx + colWidths[i] / 2 : cx + 2
      doc.text(h, tx, y + 5, { align: colAligns[i] === 'center' ? 'center' : 'left' })
      cx += colWidths[i]
    })
    y += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    apartmentsReportData.value.forEach((apto, i) => {
      checkPage(7)
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, y, contentW, 6, 'F')
      }
      cx = margin
      const label = (apto.block !== 'N/A' ? apto.block + ' - ' : '') + apto.identifier
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.text(label, cx + 2, y + 4)
      cx += colWidths[0]

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(192, 57, 43)
      doc.text(String(apto.pendentes), cx + colWidths[1] / 2, y + 4, { align: 'center' })
      cx += colWidths[1]

      doc.setTextColor(0, 137, 123)
      doc.text(String(apto.resolvidos), cx + colWidths[2] / 2, y + 4, { align: 'center' })
      cx += colWidths[2]

      // Badge status
      const statusText = apto.pendentes > 0 ? 'Com Pendências' : 'Liberado'
      const badgeColor = apto.pendentes > 0 ? [253, 236, 234] : [224, 250, 246]
      const textColor = apto.pendentes > 0 ? [192, 57, 43] : [0, 137, 123]
      doc.setFillColor(...badgeColor)
      doc.roundedRect(cx + 2, y + 0.5, colWidths[3] - 4, 5, 1, 1, 'F')
      doc.setTextColor(...textColor)
      doc.setFontSize(7)
      doc.text(statusText, cx + colWidths[3] / 2, y + 4, { align: 'center' })
      doc.setFontSize(8)

      doc.setDrawColor(230, 230, 230)
      doc.line(margin, y + 6, pageW - margin, y + 6)
      y += 6
    })

    // Totais
    y += 2
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, y, contentW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(30, 30, 30)
    doc.text('TOTAL ACUMULADO', margin + 2, y + 5)
    doc.setTextColor(192, 57, 43)
    doc.text(String(totalNonConformitiesSum.value), margin + colWidths[0] + colWidths[1] / 2, y + 5, { align: 'center' })
    doc.setTextColor(0, 137, 123)
    doc.text(String(totalRepairsSum.value), margin + colWidths[0] + colWidths[1] + colWidths[2] / 2, y + 5, { align: 'center' })
    y += 12

    // ── Seção Assinaturas ─────────────────────────────────────
    checkPage(50)
    const sigSecNum = roomCatalog.value.length > 0 ? '4' : '3'
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(11, 17, 32)
    doc.setFillColor(0, 229, 204)
    doc.rect(margin, y, 3, 6, 'F')
    doc.text(`${sigSecNum}. Assinaturas e Responsabilidades`, margin + 5, y + 5)
    y += 14

    const sigBoxW = (contentW - 20) / 2
    const signatures = [
      { title: 'Engenheiro de Qualidade Responsável', sub: 'Nome completo / CREA' },
      { title: 'Gestor de Inspeção / Operações', sub: 'Nome completo / Cargo' },
    ]

    signatures.forEach((sig, i) => {
      const sx = margin + i * (sigBoxW + 20)

      // Espaço em branco para assinatura manuscrita
      doc.setFillColor(252, 252, 252)
      doc.setDrawColor(200, 200, 200)
      doc.rect(sx, y, sigBoxW, 24, 'FD')

      // Linha de assinatura
      doc.setDrawColor(80, 80, 80)
      doc.line(sx + 8, y + 20, sx + sigBoxW - 8, y + 20)

      // Labels
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(sig.title, sx + sigBoxW / 2, y + 28, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(7)
      doc.text(sig.sub, sx + sigBoxW / 2, y + 33, { align: 'center' })
    })
    y += 40

    // Data e local
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Local e data: ______________________________, ${currentLongDate.value}`, margin, y)

    // ── Rodapé em todas as páginas ────────────────────────────
    const totalPages = doc.internal.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setFontSize(7)
      doc.setTextColor(160, 160, 160)
      doc.setFont('helvetica', 'normal')
      doc.text('CheckObra — Plataforma de Inspeção Digital de Obras', margin, pageH - 10)
      doc.text(`Página ${p} de ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' })
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, pageH - 14, pageW - margin, pageH - 14)
    }

    // ── Salvar ────────────────────────────────────────────────
    const fileName = `laudo-${nomePredioSelecionado.value.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fileName)
  } catch (e) {
    console.error('Erro ao gerar PDF:', e)
  } finally {
    gerandoPdf.value = false
  }
}

onMounted(async () => {
  try {
    empreendimentos.value = await getBuildings() || []
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
                if (nc) nc.resolvedAt === null ? pendentes++ : resolvidos++
              }
            }
          }
        }
      } catch { /* apartamento sem checklist */ }
      tempReportData.push({ id: apto.id, block: apto.block || 'N/A', identifier: apto.identifier || 'N/A', pendentes, resolvidos, hasChecklist: temChecklist })
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
.btn-back { background: none; border: none; color: #555; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-pdf { background: #0b1120; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.btn-pdf:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-box { text-align: center; padding: 40px; background: #fff; border-radius: 8px; border: 1px solid #eee; color: #555; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
.loading-icon { font-size: 1.8rem; color: #00e5cc; }
.empty-card { background: #fff; border-radius: 8px; padding: 40px; border: 1px solid #eee; text-align: center; color: #666; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
.empty-icon { font-size: 2rem; color: #b0bec5; }
.report-paper { background: #fff; color: #222; padding: 48px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 20px; font-family: 'Inter', sans-serif; }
.report-header { display: flex; justify-content: space-between; align-items: flex-start; }
.header-brand { display: flex; align-items: center; gap: 16px; }
.brand-badge { background: #0b1120; color: #00e5cc; font-weight: 800; font-size: 1rem; padding: 6px 14px; border-radius: 6px; letter-spacing: 1px; }
.header-titles h1 { font-size: 1.2rem; color: #0b1120; margin: 0 0 2px; }
.header-titles h2 { font-size: 0.85rem; color: #666; font-weight: 400; margin: 0; }
.header-meta { text-align: right; font-size: 0.82rem; color: #555; }
.header-meta p { margin: 3px 0; }
.divider { border: 0; border-top: 2px solid #0b1120; margin: 20px 0; }
.report-section { margin-bottom: 32px; }
.report-section h3 { font-size: 0.95rem; color: #0b1120; border-left: 4px solid #00e5cc; padding-left: 10px; margin: 0 0 16px; }
.summary-cards { display: flex; gap: 12px; flex-wrap: wrap; }
.summary-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 14px 18px; min-width: 130px; display: flex; flex-direction: column; gap: 4px; }
.summary-card.highlight { border-top: 3px solid #c0392b; }
.summary-label { font-size: 0.7rem; color: #777; font-weight: 600; text-transform: uppercase; }
.summary-value { font-size: 1.6rem; font-weight: 800; color: #0b1120; }
.report-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.report-table th { background: #f1f1f1; color: #333; font-weight: 600; padding: 8px 12px; border: 1px solid #ddd; }
.report-table td { padding: 8px 12px; border: 1px solid #ddd; color: #444; }
.report-table tfoot td { background: #f5f5f5; font-weight: bold; border-top: 2px solid #333; }
.report-table tbody tr:nth-child(even) { background: #fafafa; }
.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.color-danger { color: #c0392b; }
.color-success { color: #00897b; }
.color-info { color: #1976d2; }
.report-badge { padding: 3px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: bold; }
.badge-alert { background: #fdecea; color: #c0392b; }
.badge-safe { background: #e0faf6; color: #00897b; }
.signatures-preview .signatures-row { display: flex; gap: 40px; }
.signature-box { flex: 1; display: flex; flex-direction: column; align-items: center; }
.signature-line { width: 100%; border-bottom: 1px solid #333; height: 60px; margin-bottom: 8px; }
.signature-name { font-size: 0.85rem; font-weight: 600; color: #333; margin: 0; text-align: center; }
.signature-label { font-size: 0.75rem; color: #888; margin: 2px 0 0; text-align: center; }
</style>
