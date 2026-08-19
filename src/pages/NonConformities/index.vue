<template>
  <MainLayout titulo="Não-Conformidades">
    <div class="nc-container">

      <div class="filters-card">
        <div class="form-group">
          <label for="building-select">Empreendimento:</label>
          <select
            id="building-select"
            v-model="selectedBuildingId"
            @change="carregarNaoConformidades"
            class="form-control"
          >
            <option value="">-- Escolha um empreendimento --</option>
            <option v-for="b in empreendimentos" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="status-select">Status:</label>
          <select id="status-select" v-model="selectedStatus" @change="carregarNaoConformidades" class="form-control">
            <option value="open">Pendentes</option>
            <option value="resolved">Resolvidas</option>
            <option value="">Todas</option>
          </select>
        </div>
      </div>

      <div v-if="reinspectionMessage" class="alert-inline" :class="reinspectionOk ? 'ok' : 'error'">
        {{ reinspectionMessage }}
      </div>

      <div v-if="carregando" class="loading-box">
        <span>Carregando não-conformidades...</span>
      </div>

      <div v-else-if="naoConformidades.length > 0" class="table-card">
        <table class="nc-table">
          <colgroup>
            <col style="width: 16%;">
            <col style="width: 15%;">
            <col style="width: 17%;">
            <col style="width: 13%;">
            <col style="width: 9%;">
            <col style="width: 12%;">
            <col style="width: 18%;">
          </colgroup>
          <thead>
            <tr>
              <th>Bloco / Apto</th>
              <th>Cômodo</th>
              <th>Item de Verificação</th>
              <th>Criada em</th>
              <th style="text-align: center;">Fotos</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center;">Ação</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="nc in naoConformidades" :key="nc.id">
              <tr class="nc-row" @click="toggleExpanded(nc.id)">
                <td>
                  <span class="expand-chevron">
                    <FontAwesomeIcon :icon="['fas', expandedIds.has(nc.id) ? 'chevron-up' : 'chevron-down']" />
                  </span>
                  <strong>{{ nc.block }} - {{ nc.apartment }}</strong>
                </td>
                <td>{{ nc.roomName }}</td>
                <td>{{ nc.itemName }}</td>
                <td class="created-at">{{ formatDate(nc.createdAt) }}</td>
                <td style="text-align: center;">
                  <span v-if="nc.photos.length" class="photo-count">
                    <FontAwesomeIcon :icon="['fas', 'image']" /> {{ nc.photos.length }}
                  </span>
                  <span v-else class="no-photos">—</span>
                </td>
                <td style="text-align: center;">
                  <span :class="nc.resolvedAt ? 'badge-resolved' : 'badge-pending'">
                    {{ nc.resolvedAt ? 'Resolvida' : 'Pendente' }}
                  </span>
                </td>
                <td style="text-align: center;" @click.stop>
                  <button
                    v-if="canReinspect(nc)"
                    class="btn-reinspection"
                    :disabled="reinspectionLoadingId === nc.id"
                    title="Atribuir / Solicitar Re-inspeção"
                    @click="handleReinspection(nc)"
                  >
                    <FontAwesomeIcon :icon="['fas', 'redo']" />
                    {{ reinspectionLoadingId === nc.id ? 'Enviando...' : 'Reinspeção' }}
                  </button>
                  <span v-else-if="nc.visitItem?.visit?.type === 'REINSPECTION'" class="no-action" title="Já é resultado de uma re-inspeção">—</span>
                </td>
              </tr>

              <tr v-if="expandedIds.has(nc.id)" class="detail-row">
                <td colspan="7">
                  <div class="detail-panel">
                    <div class="detail-main">
                      <h4>Descrição do problema</h4>
                      <p class="detail-description">{{ nc.description }}</p>

                      <div class="detail-meta">
                        <span v-if="nc.inspectorName">
                          <FontAwesomeIcon :icon="['fas', 'user']" /> Vistoriado por <strong>{{ nc.inspectorName }}</strong>
                        </span>
                        <span>
                          <FontAwesomeIcon :icon="['fas', 'clipboard-list']" />
                          {{ nc.visitType === 'REINSPECTION' ? 'Registrado em re-inspeção' : 'Registrado na vistoria inicial' }}
                        </span>
                        <span v-if="nc.resolvedAt">
                          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Resolvida em {{ formatDate(nc.resolvedAt) }}
                        </span>
                      </div>
                    </div>

                    <div class="detail-photos">
                      <h4>Fotos <span v-if="nc.photos.length">({{ nc.photos.length }})</span></h4>
                      <div v-if="nc.photos.length" class="photos-strip">
                        <a v-for="photo in nc.photos" :key="photo.id" :href="photo.url" target="_blank" rel="noopener" class="photo-thumb">
                          <img :src="photo.url" :alt="`Foto da não-conformidade ${nc.id}`" loading="lazy" />
                        </a>
                      </div>
                      <p v-else class="no-photos-note">Nenhuma foto anexada.</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-card">
        <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
        <p v-if="!selectedBuildingId">Selecione um empreendimento acima para listar os problemas ativos em aberto.</p>
        <p v-else>Nenhuma não-conformidade encontrada para este filtro.</p>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { getNonConformities } from '../../services/nonConformities.js'
import { createReinspection } from '../../services/visits.js'

const empreendimentos = ref([])
const selectedBuildingId = ref('')
const selectedStatus = ref('open')
const naoConformidades = ref([])
const carregando = ref(false)

const expandedIds = ref(new Set())
const reinspectionLoadingId = ref(null)
const reinspectionMessage = ref('')
const reinspectionOk = ref(false)

onMounted(async () => {
  try {
    const res = await getBuildings()
    empreendimentos.value = res || []
  } catch (error) {
    console.error('Erro ao buscar empreendimentos:', error)
  }
})

// Usa o endpoint dedicado GET /non-conformities (já traz description,
// createdAt, fotos, inspetor e todo o vínculo apartamento/cômodo/vistoria
// em uma única chamada — substitui a antiga varredura manual apartamento
// a apartamento).
async function carregarNaoConformidades() {
  if (!selectedBuildingId.value) {
    naoConformidades.value = []
    return
  }

  carregando.value = true
  reinspectionMessage.value = ''
  expandedIds.value = new Set()

  try {
    const filters = { buildingId: selectedBuildingId.value }
    if (selectedStatus.value) filters.status = selectedStatus.value

    const dados = await getNonConformities(filters)
    naoConformidades.value = (dados || []).map((nc) => {
      const apt = nc.visitItem?.visit?.checklist?.apartment
      return {
        id: nc.id,
        block: apt?.block || 'N/A',
        apartment: apt?.identifier || 'N/A',
        roomName: nc.visitItem?.checklistItem?.apartmentRoomService?.apartmentRoom?.name || 'Geral',
        itemName: nc.visitItem?.checklistItem?.apartmentRoomService?.service?.name || 'Item de Inspeção',
        description: nc.description || 'Sem descrição informada.',
        createdAt: nc.createdAt,
        resolvedAt: nc.resolvedAt,
        photos: nc.photos || [],
        inspectorName: nc.visitItem?.visit?.inspector?.name || null,
        visitType: nc.visitItem?.visit?.type || null,
        visitItem: nc.visitItem,
      }
    })
  } catch (error) {
    console.error('Erro ao carregar não-conformidades:', error)
  } finally {
    carregando.value = false
  }
}

function toggleExpanded(ncId) {
  const next = new Set(expandedIds.value)
  next.has(ncId) ? next.delete(ncId) : next.add(ncId)
  expandedIds.value = next
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// Só oferece o botão para NCs ainda pendentes cuja vistoria de origem seja
// INITIAL — regra idêntica à validada pelo back em POST /visits/:id/reinspection
// (não é possível reinspecionar uma re-inspeção).
function canReinspect(nc) {
  return !nc.resolvedAt && nc.visitItem?.visit?.type === 'INITIAL'
}

async function handleReinspection(nc) {
  const visitId = nc.visitItem?.visit?.id
  if (!visitId) return
  reinspectionLoadingId.value = nc.id
  reinspectionMessage.value = ''
  try {
    await createReinspection(visitId)
    reinspectionOk.value = true
    reinspectionMessage.value = `Re-inspeção criada e atribuída automaticamente para o apto ${nc.apartment}.`
  } catch (e) {
    reinspectionOk.value = false
    reinspectionMessage.value = e.response?.data?.message || 'Erro ao solicitar re-inspeção. Tente novamente.'
  } finally {
    reinspectionLoadingId.value = null
  }
}
</script>

<style scoped>
.nc-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.filters-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 260px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0d0d2b;
}

.form-control {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 0.9rem;
  color: #333;
  outline: none;
}

.form-control:focus {
  border-color: #00e5cc;
}

.alert-inline {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
}
.alert-inline.ok { background: #e0faf6; color: #00695c; border: 1px solid #00e5cc; }
.alert-inline.error { background: #fdecea; color: #c0392b; border: 1px solid #f5b7b1; }

.loading-box {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  color: #555;
  font-weight: 500;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow-x: auto;
}

.nc-table {
  width: 100%;
  min-width: 880px;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: left;
  font-size: 0.87rem;
}

.nc-table th {
  background: #0d0d2b;
  color: #fff;
  padding: 12px 12px;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
}

.nc-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #444;
  vertical-align: middle;
  overflow-wrap: break-word;
}

.nc-row { cursor: pointer; transition: background 0.15s; }
.nc-row:hover { background: #fafafa; }
.nc-row:last-child td { border-bottom: none; }

.expand-chevron { display: inline-block; width: 14px; color: #999; margin-right: 6px; font-size: 0.8rem; }

.created-at { color: #666; font-size: 0.8rem; }
.no-action, .no-photos { color: #bbb; }
.photo-count { color: #666; font-size: 0.85rem; white-space: nowrap; }

/* ─── Painel expandido: descrição + fotos juntos ─── */
.detail-row td { padding: 0; border-bottom: 1px solid #eee; }
.detail-panel {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  padding: 18px 24px 22px 40px;
  background: #fafafa;
}
.detail-main h4, .detail-photos h4 {
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.detail-description {
  margin: 0 0 14px;
  font-size: 0.92rem;
  color: #c0392b;
  line-height: 1.5;
  white-space: pre-wrap;
}
.detail-meta { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; color: #666; }
.detail-meta svg { width: 13px; margin-right: 4px; color: #999; }

.no-photos-note { margin: 0; font-size: 0.88rem; color: #999; font-style: italic; }

.photos-strip { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-thumb {
  width: 84px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  display: block;
}
.photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.btn-reinspection {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 20px;
  border: none;
  background: #00c2a8;
  color: #000;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-reinspection:hover { opacity: 0.9; }
.btn-reinspection:disabled { opacity: 0.5; cursor: not-allowed; }

.badge-pending {
  background: #f99f56;
  color: #fff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}

.badge-resolved {
  background: #e0faf6;
  color: #00897b;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 600;
  display: inline-block;
  border: 1px solid #00e5cc;
  white-space: nowrap;
}

.empty-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  border: 1px solid #eee;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 2rem;
  color: #b0bec5;
}

.empty-card p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .detail-panel { grid-template-columns: 1fr; }
}
</style>
