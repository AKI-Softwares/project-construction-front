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
          <p><strong>Empreendimento:</strong> Edifício Residencial Padrão</p>
          <p><strong>Data de Emissão:</strong> {{ currentLongDate }}</p>
        </div>
      </header>

      <hr class="divider" />

      <section class="report-section">
        <h3>1. Indicadores de Desempenho e Objetivo da Qualidade</h3>
        
        <div class="quality-grid">
          <div class="quality-card highlight">
            <span class="card-label">Resultado Objetivo da Qualidade</span>
            <span class="card-value">11,90%</span>
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
                  <td class="text-center font-bold">118</td>
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
                  <td class="text-center">68</td>
                  <td class="text-center">8.024</td>
                </tr>
                <tr>
                  <td><strong>Apartamentos Duplex</strong></td>
                  <td class="text-center">4</td>
                  <td class="text-center">704</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="final-row">
                  <td><strong>Total Geral</strong></td>
                  <td class="text-center font-bold">72</td>
                  <td class="text-center font-bold color-cyan">8.728</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      <div class="page-break"></div>

      <section class="report-section">
        <h3>3. Mapeamento Analítico de Não-Conformidades e Reparos por Unidade</h3>
        <p class="section-description">A tabela abaixo apresenta o volume de não-conformidades encontradas e a quantidade total de reparos que tiveram de ser realizados por apartamento.</p>
        
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
              <td class="text-center color-danger font-bold">{{ apto.repairs }}</td>
              <td class="text-center color-success font-bold">{{ apto.repairs }}</td>
              <td>
                <span :class="['report-badge', apto.repairs > 15 ? 'badge-alert' : 'badge-safe']">
                  {{ apto.repairs > 15 ? 'Revisão Prioritária' : 'Liberado' }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total Acumulado</strong></td>
              <td class="text-center font-bold color-danger">1.039</td>
              <td class="text-center font-bold color-success">1.039</td>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'

const router = useRouter()

const currentLongDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

function printReport() {
  window.print()
}

// Catálogo fixo baseado no checklist do PEO 19
const roomItemsCatalog = [
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

// Mapeamento extraído fielmente do documento PDF informado
const apartmentsData = [
  { number: '101', repairs: 11 }, { number: '102', repairs: 15 }, { number: '103', repairs: 12 }, { number: '104', repairs: 13 },
  { number: '201', repairs: 24 }, { number: '202', repairs: 21 }, { number: '203', repairs: 13 }, { number: '204', repairs: 18 },
  { number: '301', repairs: 18 }, { number: '302', repairs: 16 }, { number: '303', repairs: 14 }, { number: '304', repairs: 13 },
  { number: '401', repairs: 14 }, { number: '402', repairs: 13 }, { number: '403', repairs: 12 }, { number: '404', repairs: 14 },
  { number: '501', repairs: 10 }, { number: '502', repairs: 11 }, { number: '503', repairs: 21 }, { number: '504', repairs: 12 },
  { number: '601', repairs: 20 }, { number: '602', repairs: 15 }, { number: '603', repairs: 12 }, { number: '604', repairs: 17 },
  { number: '701', repairs: 11 }, { number: '702', repairs: 13 }, { number: '703', repairs: 12 }, { number: '704', repairs: 11 },
  { number: '801', repairs: 10 }, { number: '802', repairs: 5 },  { number: '803', repairs: 14 }, { number: '804', repairs: 11 },
  { number: '901', repairs: 13 }, { number: '902', repairs: 10 }, { number: '903', repairs: 18 }, { number: '904', repairs: 20 },
  { number: '1001', repairs: 19 }, { number: '1002', repairs: 12 }, { number: '1003', repairs: 15 }, { number: '1004', repairs: 14 },
  { number: '1101', repairs: 15 }, { number: '1102', repairs: 14 }, { number: '1103', repairs: 21 }, { number: '1104', repairs: 19 },
  { number: '1201', repairs: 16 }, { number: '1202', repairs: 16 }, { number: '1203', repairs: 10 }, { number: '1204', repairs: 16 },
  { number: '1301', repairs: 18 }, { number: '1302', repairs: 20 }, { number: '1303', repairs: 19 }, { number: '1304', repairs: 15 },
  { number: '1401', repairs: 22 }, { number: '1402', repairs: 21 }, { number: '1403', repairs: 14 }, { number: '1404', repairs: 9 },
  { number: '1501', repairs: 13 }, { number: '1502', repairs: 14 }, { number: '1503', repairs: 14 }, { number: '1504', repairs: 15 },
  { number: '1601', repairs: 16 }, { number: '1602', repairs: 13 }, { number: '1603', repairs: 15 }, { number: '1604', repairs: 12 },
  { number: '1701', repairs: 26 }, { number: '1702', repairs: 19 }, { number: '1703', repairs: 15 }, { number: '1704', repairs: 15 },
  { number: '1801', repairs: 5 },  { number: '1802', repairs: 6 },  { number: '1803', repairs: 3 },  { number: '1804', repairs: 6 }
]
</script>

<style scoped>
/* Controle de Ações */
.report-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.btn-back {
  background: none;
  border: none;
  color: #555;
  font-weight: 600;
  cursor: pointer;
}
.btn-print {
  background: #00e5cc;
  color: #0d0d2b;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

/* Visualização Folha A4 no Painel */
.report-paper {
  background: #fff;
  color: #222;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.header-main h1 { font-size: 1.4rem; color: #0d0d2b; letter-spacing: 0.5px; margin-bottom: 4px; }
.header-main h2 { font-size: 0.95rem; color: #555; font-weight: 500; }
.header-meta { text-align: right; font-size: 0.85rem; color: #666; }

.divider { border: 0; border-top: 2px solid #0d0d2b; margin: 20px 0 30px 0; }

.report-section { margin-bottom: 35px; }
.report-section h3 { font-size: 1.1rem; color: #0d0d2b; border-left: 4px solid #00e5cc; padding-left: 10px; margin-bottom: 15px; }
.section-description { font-size: 0.88rem; color: #555; margin-bottom: 15px; }

/* Grid de Objetivos de Qualidade */
.quality-grid {
  display: flex;
  gap: 24px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.quality-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 6px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quality-card.highlight { border-top: 4px solid #c0392b; }
.card-label { font-size: 0.8rem; font-weight: bold; color: #555; }
.card-value { font-size: 2rem; font-weight: 800; color: #c0392b; margin: 6px 0; }
.card-sub { font-size: 0.72rem; color: #888; }

.formula-box { flex: 1; font-size: 0.85rem; }
.formula-display {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  margin: 8px 0;
  border: 1px dashed #ccc;
  overflow-x: auto;
}
.formula-note { font-size: 0.75rem; color: #777; font-style: italic; }

/* Estruturação das Tabelas */
.tables-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.table-wrapper h4 { font-size: 0.9rem; color: #444; margin-bottom: 10px; }

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 15px;
}
.report-table th { background: #f1f1f1; color: #333; font-weight: 600; padding: 10px; border: 1px solid #ddd; text-align: left; }
.report-table td { padding: 8px 10px; border: 1px solid #ddd; color: #444; }
.report-table tfoot td { background: #f9f9f9; font-weight: bold; border-top: 2px solid #333; }

.apartments-table { margin-top: 15px; }
.apartments-table tbody tr:nth-child(even) { background: #fbfbfb; }

/* Auxiliares Utilitários */
.text-center { text-center: center; text-align: center; }
.font-bold { font-weight: bold; }
.color-danger { color: #c0392b; }
.color-success { color: #00897b; }
.color-cyan { color: #00b3a0; }

.report-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: bold;
}
.badge-alert { background: #fdecea; color: #c0392b; }
.badge-safe { background: #e0faf6; color: #00897b; }

/* Assinaturas (Ocultas por padrão na tela) */
.print-footer { display: none; }

/* ==========================================================================
   Configurações de Impressão de Alta Qualidade (CSS Print)
   ========================================================================== */
@media print {
  body { background: #fff; color: #000; }
  .no-print { display: none !important; }
  
  .report-paper {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
  }
  
  .report-table th { background: #eaeaea !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .quality-grid { background: #f5f5f5 !important; border: 1px solid #ccc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  .page-break { display: block; page-break-before: always; }
  
  .print-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 80px;
    page-break-inside: avoid;
  }
  .signature-box { width: 45%; text-align: center; font-size: 0.85rem; }
  .signature-box .line { border-top: 1px solid #000; margin-bottom: 8px; }
}
</style>
