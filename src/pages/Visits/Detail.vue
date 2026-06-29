<template>
  <MainLayout titulo="Detalhe da Vistoria">

    <div class="top-nav">
      <button class="btn-back" @click="router.push('/visits')">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
        Voltar para Vistorias
      </button>

      <!-- Botão para Gerar Re-inspeção (W-15) - Ativo apenas se a vistoria estiver FINALIZED -->
      <div v-if="visit && visit.status === 'FINALIZED'" class="manager-actions">
        <button class="btn-action-reinspection" @click="handleCreateReinspection" :disabled="actionLoading">
          <FontAwesomeIcon :icon="['fas', 'redo']" />
          {{ actionLoading ? 'Processando...' : 'Criar Re-inspeção' }}
        </button>
      </div>
    </div>

      <div v-if="reinspectionError" class="state error" style="margin-bottom:12px;">{{ reinspectionError }}</div>
    <div v-if="loading" class="state">Carregando dados da vistoria...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error && visit">

      <!-- Cabeçalho -->
      <div class="header-card">
        <div class="header-info">
          <h2>{{ visit.title || `Vistoria — Apto ${visit.apartment?.identifier}` }}</h2>
          <p>{{ visit.apartment?.building?.name }} • Apartamento {{ visit.apartment?.identifier }}</p>
        </div>
        <span :class="['status-badge', `badge-${visit.status.toLowerCase()}`]">
          {{ translateStatus(visit.status) }}
        </span>
      </div>

      <!-- Progresso geral -->
      <div class="progress-card">
        <div class="progress-header">
          <span>Progresso geral</span>
          <span>{{ summary.evaluated }} de {{ summary.total }} itens avaliados</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ok" :style="{ width: summary.okPct + '%' }"></div>
          <div class="progress-fill nok" :style="{ width: summary.nokPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot ok"></span>OK {{ summary.ok }}</span>
          <span><span class="dot nok"></span>NOK {{ summary.nok }}</span>
          <span><span class="dot pending"></span>Não avaliado {{ summary.pending }}</span>
        </div>
      </div>

      <!-- Inspetor responsável -->
      <div v-if="latestVisit" class="info-card">
        <FontAwesomeIcon :icon="['fas', 'user']" class="info-icon" />
        <div>
          <strong>Inspetor:</strong> {{ latestVisit.user?.name || latestVisit.inspector?.name || '—' }}
          <span class="info-date">• Iniciada em {{ formatDate(latestVisit.createdAt) }}</span>
        </div>
      </div>

      <!-- Cômodos -->
      <div class="rooms">
        <div v-for="room in groupedRooms" :key="room.name" class="room-card">

          <div class="room-header" @click="toggleRoom(room.name)">
            <span>{{ room.name }}</span>
            <div class="room-header-right">
              <span class="room-count">{{ room.okCount }}/{{ room.items.length }}</span>
              <FontAwesomeIcon :icon="['fas', openRoom === room.name ? 'chevron-down' : 'chevron-right']" />
            </div>
          </div>

          <div v-if="openRoom === room.name" class="room-items">
            <div
              v-for="item in room.items"
              :key="item.id"
              class="item-block"
            >
              <!-- Cabeçalho clicável do item -->
              <div
                :class="['item-row', `item-${item.status.toLowerCase()}`]"
                @click="toggleItem(item.id)"
              >
                <div class="item-info">
                  <span class="item-name">{{ item.apartmentRoomService?.service?.name || 'Serviço' }}</span>
                  <span class="item-category">{{ item.apartmentRoomService?.service?.category || 'Geral' }}</span>
                </div>

                <div class="item-actions-wrapper">
                  <button
                    v-if="item.status === 'NOK'"
                    class="btn-resolve-nc"
                    @click.stop="openResolveModal(item)"
                  >
                    <FontAwesomeIcon :icon="['fas', 'check-double']" />
                    Resolver NC
                  </button>
                  <span :class="['item-badge', `badge-item-${item.status.toLowerCase()}`]">
                    {{ translateItemStatus(item.status) }}
                  </span>
                  <FontAwesomeIcon
                    v-if="item.visitItems?.length"
                    :icon="['fas', openItem === item.id ? 'chevron-up' : 'chevron-down']"
                    class="item-chevron"
                  />
                </div>
              </div>

              <!-- Painel expansível: registros do inspetor -->
              <div v-if="openItem === item.id && item.visitItems?.length" class="item-detail-panel">
                <div
                  v-for="vi in item.visitItems"
                  :key="vi.id"
                  class="visit-entry"
                >
                  <!-- Cabeçalho do registro -->
                  <div class="visit-entry-header">
                    <span class="visit-entry-inspector">
                      <FontAwesomeIcon :icon="['fas', 'user']" />
                      {{ vi.visit?.user?.name || vi.inspector?.name || 'Inspetor' }}
                    </span>
                    <span class="visit-entry-date">{{ formatDate(vi.createdAt || vi.visit?.createdAt) }}</span>
                  </div>

                  <!-- Descrição do inspetor (observations / notes) -->
                  <p v-if="vi.observations || vi.notes || vi.nonConformity?.description" class="visit-entry-desc">
                    {{ vi.observations || vi.notes || vi.nonConformity?.description }}
                  </p>

                  <!-- Fotos -->
                  <div v-if="vi.nonConformity?.photos?.length" class="visit-entry-photos">
                    <a
                      v-for="photo in vi.nonConformity.photos"
                      :key="photo.id || photo.url"
                      :href="photo.url"
                      target="_blank"
                      rel="noopener"
                      class="photo-thumb-link"
                    >
                      <img :src="photo.url" :alt="photo.name || 'Foto'" class="photo-thumb" />
                    </a>
                  </div>

                  <!-- NC sem fotos mas com status -->
                  <div v-else-if="vi.nonConformity" class="visit-entry-no-photo">
                    <FontAwesomeIcon :icon="['fas', 'image']" />
                    Sem fotos registradas
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Modal de Resolução Administrativa (W-10) -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-container">
        <h3>Resolver Não-Conformidade</h3>
        <p>Aprovar manualmente a correção do item <strong>{{ selectedItem?.apartmentRoomService?.service?.name }}</strong>?</p>
        
        <div class="modal-form-group">
          <label>Justificativa / Observações</label>
          <textarea v-model="resolutionNotes" placeholder="Insira detalhes sobre a tratativa ou correção executada..."></textarea>
        </div>

        <div v-if="ncResolveError" class="modal-error">{{ ncResolveError }}</div>

        <div class="modal-buttons">
          <button class="btn-cancel" @click="showModal = false" :disabled="modalLoading">Cancelar</button>
          <button class="btn-confirm" @click="confirmResolveNC" :disabled="modalLoading">
            {{ modalLoading ? 'Salvando...' : 'Confirmar Solução' }}
          </button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getVisit, createReinspection } from '../../services/visits.js'
import { updateChecklistItem } from '../../services/checklists.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const visit = ref(null)
const openRoom = ref(null)
const openItem = ref(null)

function toggleItem(itemId) {
  openItem.value = openItem.value === itemId ? null : itemId
}

// Controle de fluxo de botões e modais
const actionLoading = ref(false)
const reinspectionError = ref('')
const modalLoading = ref(false)
const showModal = ref(false)
const selectedItem = ref(null)
const resolutionNotes = ref('')
const ncResolveError = ref('')
const checklistId = ref(null)

// Com /visits/:id o inspetor vem em visit.user diretamente
const latestVisit = computed(() => {
  if (!visit.value) return null
  // Suporta ambos os shapes: visit.user (novo) ou visit.visits[last] (legado)
  if (visit.value.user) return visit.value
  if (visit.value.visits?.length) return visit.value.visits[visit.value.visits.length - 1]
  return null
})

const summary = computed(() => {
  const items = visit.value?.items || []
  const total = items.length || 1
  const ok = items.filter(i => i.status === 'OK').length
  const nok = items.filter(i => i.status === 'NOK').length
  const pending = items.filter(i => i.status === 'PENDING').length
  return {
    total: items.length,
    evaluated: ok + nok,
    ok,
    nok,
    pending,
    okPct: (ok / total) * 100,
    nokPct: (nok / total) * 100,
  }
})

const groupedRooms = computed(() => {
  const items = visit.value?.items || []
  const rooms = {}

  for (const item of items) {
    const roomName = item.apartmentRoomService?.apartmentRoom?.name || 'Geral'
    if (!rooms[roomName]) rooms[roomName] = []
    rooms[roomName].push(item)
  }

  return Object.entries(rooms).map(([name, items]) => ({
    name,
    items,
    okCount: items.filter(i => i.status === 'OK').length,
  }))
})

function toggleRoom(name) {
  openRoom.value = openRoom.value === name ? null : name
  openItem.value = null
}

function translateStatus(status) {
  const map = { PENDING: 'Pendente', ONGOING: 'Em andamento', FINALIZED: 'Finalizada' }
  return map[status] || status
}

function translateItemStatus(status) {
  const map = { PENDING: 'Não avaliado', OK: 'OK', NOK: 'NOK' }
  return map[status] || status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Configuração do Modal para o item NOK
function openResolveModal(item) {
  selectedItem.value = item
  resolutionNotes.value = ''
  showModal.value = true
}

// Persistência da resolução de NC (W-10)
async function confirmResolveNC() {
  if (!selectedItem.value) return
  modalLoading.value = true
  ncResolveError.value = ''
  try {
    await updateChecklistItem(checklistId.value, selectedItem.value.id, {
      status: 'OK',
      notes: resolutionNotes.value,
    })
    selectedItem.value.status = 'OK'
    showModal.value = false
  } catch (e) {
    ncResolveError.value = e.response?.data?.message || 'Erro ao resolver NC. Tente novamente.'
  } finally {
    modalLoading.value = false
  }
}

// Disparo de abertura de Re-inspeção (W-15)
async function handleCreateReinspection() {
  actionLoading.value = true
  reinspectionError.value = ''
  try {
    await createReinspection(visit.value.id)
    router.push('/reinspections')
  } catch (e) {
    reinspectionError.value = e.response?.data?.message || 'Erro ao criar re-inspeção. Tente novamente.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  try {
    const raw = await getVisit(route.params.id)

    // A API /visits/:id retorna { id, status, apartment, user, checklist: { id, items[] } }
    // Normalizamos para que o template continue usando visit.value.items e visit.value.status
    if (raw.checklist) {
      raw.items = raw.checklist.items || []
      checklistId.value = raw.checklist.id
    } else {
      // Fallback: se vier direto com items (compatibilidade)
      raw.items = raw.items || []
      checklistId.value = raw.id
    }

    visit.value = raw

    if (visit.value.items?.length) {
      openRoom.value = visit.value.items[0].apartmentRoomService?.apartmentRoom?.name || null
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar vistoria.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 0;
}
.btn-back:hover { color: #00e5cc; }

.btn-action-reinspection {
  background: #00e5cc;
  color: #0d0d2b;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 0.88rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.btn-action-reinspection:hover { opacity: 0.9; }
.btn-action-reinspection:disabled { opacity: 0.5; cursor: not-allowed; }

.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

.header-card {
  background: #0d0d2b;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}
.header-info h2 { font-size: 1.2rem; margin-bottom: 4px; }
.header-info p { font-size: 0.85rem; color: rgba(255,255,255,0.6); }

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge-pending { background: #fff3e0; color: #f99f56; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }

.progress-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid #eee;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}
.progress-bar {
  height: 10px;
  background: rgba(0,0,0,0.08);
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  margin-bottom: 10px;
}
.progress-fill { height: 100%; transition: width 0.3s; }
.progress-fill.ok { background: #00e5cc; }
.progress-fill.nok { background: #c0392b; }
.progress-legend { display: flex; gap: 20px; font-size: 0.78rem; color: #555; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }
.dot.ok { background: #00e5cc; }
.dot.nok { background: #c0392b; }
.dot.pending { background: rgba(0,0,0,0.15); }

.info-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #333;
}
.info-icon { color: #00e5cc; }
.info-date { color: #888; margin-left: 4px; }

.rooms { display: flex; flex-direction: column; gap: 10px; }

.room-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eee;
  overflow: hidden;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f5f5f5;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.92rem;
  color: #1a1a2e;
}

.room-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.8rem;
  color: #888;
}

.room-count { font-weight: bold; color: #00897b; }

.room-items {
  display: flex;
  flex-direction: column;
}

.item-block { border-top: 1px solid #f5f5f5; }

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
}
.item-row:hover { background: #fafafa; }

.item-chevron { font-size: 0.75rem; color: #aaa; margin-left: 4px; }

.item-info {
  display: flex;
  flex-direction: column;
}
.item-name { font-size: 0.88rem; color: #333; font-weight: 500; }
.item-category { font-size: 0.75rem; color: #999; }

.item-actions-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-resolve-nc {
  background: #f5a623;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}
.btn-resolve-nc:hover { background: #e0921b; }

.item-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  min-width: 90px;
}
.badge-item-pending { background: #f0f0f0; color: #888; }
.badge-item-ok { background: #e0faf6; color: #00897b; }
.badge-item-nok { background: #fdecea; color: #c0392b; }

/* Painel de detalhes do item (visitItems) */
.item-detail-panel {
  background: #f9f9f9;
  border-top: 1px solid #eee;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visit-entry {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visit-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}
.visit-entry-inspector { font-weight: 600; color: #1a1a2e; display: flex; align-items: center; gap: 6px; }
.visit-entry-date { color: #aaa; }

.visit-entry-desc {
  font-size: 0.85rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
  background: #f5f5f5;
  padding: 10px 12px;
  border-radius: 6px;
}

.visit-entry-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.photo-thumb-link { display: block; border-radius: 6px; overflow: hidden; border: 2px solid #eee; transition: border-color 0.15s; }
.photo-thumb-link:hover { border-color: #00e5cc; }
.photo-thumb { width: 100px; height: 80px; object-fit: cover; display: block; }

.visit-entry-no-photo { font-size: 0.78rem; color: #bbb; display: flex; align-items: center; gap: 6px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-container h3 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.modal-container p {
  font-size: 0.88rem;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.modal-form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

.modal-form-group textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 0.88rem;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  background: #eee;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #555;
}

.btn-confirm {
  background: #00e5cc;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  color: #0d0d2b;
}

.modal-error {
  background: #fff3f0;
  color: #c0392b;
  border: 1px solid #f99f56;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.83rem;
  margin-bottom: 4px;
}
</style>
