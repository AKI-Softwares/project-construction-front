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
            <col style="width: 12%;">
            <col style="width: 12%;">
            <col style="width: 16%;">
            <col style="width: 22%;">
            <col style="width: 12%;">
            <col style="width: 9%;">
            <col style="width: 9%;">
            <col style="width: 8%;">
          </colgroup>
          <thead>
            <tr>
              <th>Bloco / Apto</th>
              <th>Cômodo</th>
              <th>Item de Verificação</th>
              <th>Descrição do Problema</th>
              <th>Criada em</th>
              <th style="text-align: center;">Fotos</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center;">Ação</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="nc in naoConformidades" :key="nc.id">
              <tr>
                <td><strong>{{ nc.block }} - {{ nc.apartment }}</strong></td>
                <td>{{ nc.roomName }}</td>
                <td>{{ nc.itemName }}</td>
                <td class="text-danger">{{ nc.description }}</td>
                <td class="created-at">{{ formatDate(nc.createdAt) }}</td>
                <td style="text-align: center;">
                  <button
                    v-if="nc.photos?.length"
                    class="btn-photos"
                    @click="toggleExpanded(nc.id)"
                  >
                    <FontAwesomeIcon :icon="['fas', 'image']" />
                    {{ nc.photos.length }}
                    <FontAwesomeIcon :icon="['fas', expandedIds.has(nc.id) ? 'chevron-up' : 'chevron-down']" />
                  </button>
                  <span v-else class="no-photos">—</span>
                </td>
                <td style="text-align: center;">
                  <span :class="nc.resolvedAt ? 'badge-resolved' : 'badge-pending'">
                    {{ nc.resolvedAt ? 'Resolvida' : 'Pendente' }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <button
                    v-if="canReinspect(nc)"
                    class="btn-reinspection"
                    :disabled="reinspectionLoadingId === nc.id"
                    @click="handleReinspection(nc)"
                  >
                    <FontAwesomeIcon :icon="['fas', 'redo']" />
                    {{ reinspectionLoadingId === nc.id ? 'Enviando...' : 'Atribuir / Solicitar Re-inspeção' }}
                  </button>
                  <span v-else-if="nc.visitItem?.visit?.type === 'REINSPECTION'" class="no-action" title="Já é resultado de uma re-inspeção">—</span>
                </td>
              </tr>
              <tr v-if="expandedIds.has(nc.id) && nc.photos?.length" class="photos-row">
                <td colspan="8">
                  <div class="photos-strip">
                    <a v-for="photo in nc.photos" :key="photo.id" :href="photo.url" target="_blank" rel="noopener" class="photo-thumb">
                      <img :src="photo.url" :alt="`Foto da não-conformidade ${nc.id}`" loading="lazy" />
                    </a>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

    </div>
  </MainLayout>
</template>

<style scoped>
.nc-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: left;
  font-size: 0.9rem;
}

.nc-table th {
  background: #0d0d2b;
  color: #fff;
  padding: 14px 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nc-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  color: #444;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
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
// createdAt, fotos e todo o vínculo apartamento/cômodo/vistoria em uma
// única chamada — substitui a antiga varredura manual apartamento a
// apartamento).
async function carregarNaoConformidades() {
  if (!selectedBuildingId.value) {
    naoConformidades.value = []
    return
  }

  carregando.value = true
  reinspectionMessage.value = ''

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
        description: nc.description || 'Sem descrição informada',
        createdAt: nc.createdAt,
        resolvedAt: nc.resolvedAt,
        photos: nc.photos || [],
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
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
  border-collapse: collapse;
  table-layout: fixed;
  text-align: left;
  font-size: 0.9rem;
}

.nc-table th {
  background: #0d0d2b;
  color: #fff;
  padding: 14px 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nc-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  color: #444;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.nc-table tr:last-child td {
  border-bottom: none;
}

.text-danger {
  color: #c0392b;
  font-weight: 500;
}

.created-at { color: #666; font-size: 0.82rem; white-space: nowrap; }
.no-photos, .no-action { color: #bbb; }

.btn-photos {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  color: #333;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-photos:hover { background: #f0f0f0; }

.photos-row td { padding: 12px 16px 20px; background: #fafafa; }
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
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  background: #00c2a8;
  color: #000;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.btn-reinspection:hover { opacity: 0.9; }
.btn-reinspection:disabled { opacity: 0.5; cursor: not-allowed; }

.badge-pending {
  background: #f99f56;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge-resolved {
  background: #e0faf6;
  color: #00897b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  border: 1px solid #00e5cc;
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
</style>
