<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-box">

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-header-info">
          <h2>{{ visit.title || `Vistoria — Apto ${visit.apartment?.identifier}` }}</h2>
          <p>{{ visit.apartment?.building?.name }} • Apartamento {{ visit.apartment?.identifier }}</p>
        </div>
        <div class="modal-header-right">
          <span :class="['status-badge', `badge-${visit.status?.toLowerCase()}`]">
            {{ translateStatus(visit.status) }}
          </span>
          <button class="btn-fechar" @click="$emit('fechar')">✕</button>
        </div>
      </div>

      <!-- Progresso -->
      <div class="progress-bar-wrapper">
        <div class="progress-bar">
          <div class="progress-ok" :style="{ width: summary.okPct + '%' }"></div>
          <div class="progress-nok" :style="{ width: summary.nokPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot ok"></span>OK {{ summary.ok }}</span>
          <span><span class="dot nok"></span>NOK {{ summary.nok }}</span>
          <span><span class="dot pending"></span>Não avaliado {{ summary.pending }}</span>
          <span class="progress-pct">
            {{ summary.total > 0 ? Math.round((summary.ok / summary.total) * 100) : 0 }}% concluído
          </span>
        </div>
      </div>

      <!-- Inspetor -->
      <div v-if="latestVisit" class="inspector-row">
        <FontAwesomeIcon :icon="['fas', 'user']" />
        <span>
          <strong>Inspetor:</strong>
          {{ latestVisit.inspector?.name || latestVisit.user?.name || '—' }}
        </span>
        <span class="inspector-date">• {{ formatDate(latestVisit.createdAt) }}</span>
      </div>

      <!-- Cômodos -->
      <div class="modal-body">
        <div v-if="groupedRooms.length === 0" class="empty">
          Nenhum item de checklist encontrado para esta vistoria.
        </div>

        <div v-for="room in groupedRooms" :key="room.name" class="room-block">

          <div class="room-header" @click="toggleRoom(room.name)">
            <span>{{ room.name }}</span>
            <div class="room-header-right">
              <span class="room-count">{{ room.okCount }}/{{ room.items.length }}</span>
              <FontAwesomeIcon :icon="['fas', openRoom === room.name ? 'chevron-up' : 'chevron-down']" />
            </div>
          </div>

          <div v-if="openRoom === room.name" class="room-items">
            <div v-for="item in room.items" :key="item.id" class="item-block">

              <div
                :class="['item-row', `item-${item.status.toLowerCase()}`]"
                @click="toggleItem(item.id)"
              >
                <div class="item-info">
                  <span class="item-name">{{ item.apartmentRoomService?.service?.name || 'Serviço' }}</span>
                  <span class="item-category">{{ item.apartmentRoomService?.service?.category || 'Geral' }}</span>
                </div>
                <div class="item-actions">
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

              <!-- Registros do inspetor -->
              <div v-if="openItem === item.id && item.visitItems?.length" class="item-detail-panel">
                <div v-for="vi in item.visitItems" :key="vi.id" class="visit-entry">
                  <div class="visit-entry-header">
                    <span class="visit-entry-inspector">
                      <FontAwesomeIcon :icon="['fas', 'user']" />
                      {{ vi.visit?.user?.name || vi.inspector?.name || 'Inspetor' }}
                    </span>
                    <span class="visit-entry-date">{{ formatDate(vi.createdAt || vi.visit?.createdAt) }}</span>
                  </div>
                  <p v-if="vi.observations || vi.notes || vi.nonConformity?.description" class="visit-entry-desc">
                    {{ vi.observations || vi.notes || vi.nonConformity?.description }}
                  </p>
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
                  <div v-else-if="vi.nonConformity" class="no-photo">
                    <FontAwesomeIcon :icon="['fas', 'image']" /> Sem fotos registradas
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visit: { type: Object, required: true },
})

defineEmits(['fechar'])

const openRoom = ref(null)
const openItem = ref(null)

function toggleRoom(name) {
  openRoom.value = openRoom.value === name ? null : name
  openItem.value = null
}

function toggleItem(id) {
  openItem.value = openItem.value === id ? null : id
}

const latestVisit = computed(() => {
  if (!props.visit?.visits?.length) return null
  return props.visit.visits[props.visit.visits.length - 1]
})

const summary = computed(() => {
  const items = props.visit?.items || []
  const total = items.length
  const ok = items.filter(i => i.status === 'OK').length
  const nok = items.filter(i => i.status === 'NOK').length
  const pending = items.filter(i => i.status === 'PENDING').length
  return {
    total,
    ok,
    nok,
    pending,
    okPct: total > 0 ? (ok / total) * 100 : 0,
    nokPct: total > 0 ? (nok / total) * 100 : 0,
  }
})

const groupedRooms = computed(() => {
  const items = props.visit?.items || []
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

function translateStatus(s) {
  return { PENDING: 'Pendente', ONGOING: 'Em andamento', FINALIZED: 'Finalizada' }[s] || s
}

function translateItemStatus(s) {
  return { PENDING: 'Não avaliado', OK: 'OK', NOK: 'NOK' }[s] || s
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-box { background: #fff; border-radius: 14px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
.modal-header { background: #0d0d2b; padding: 20px 24px; border-radius: 14px 14px 0 0; color: #fff; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.modal-header-info h2 { font-size: 1.05rem; margin: 0 0 4px; }
.modal-header-info p { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin: 0; }
.modal-header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.btn-fechar { background: none; border: none; color: #fff; font-size: 1.3rem; cursor: pointer; line-height: 1; padding: 0; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.badge-pending { background: #fff3e0; color: #f99f56; }
.badge-ongoing { background: #e3f2fd; color: #1976d2; }
.badge-finalized { background: #e0faf6; color: #00897b; }
.progress-bar-wrapper { padding: 16px 24px; border-bottom: 1px solid #f0f0f0; }
.progress-bar { height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; margin-bottom: 8px; }
.progress-ok { background: #00e5cc; height: 100%; }
.progress-nok { background: #c0392b; height: 100%; }
.progress-legend { display: flex; gap: 16px; font-size: 0.78rem; color: #666; align-items: center; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dot.ok { background: #00e5cc; }
.dot.nok { background: #c0392b; }
.dot.pending { background: #ccc; }
.progress-pct { margin-left: auto; font-weight: 700; color: #00897b; }
.inspector-row { display: flex; align-items: center; gap: 8px; padding: 12px 24px; font-size: 0.83rem; color: #555; border-bottom: 1px solid #f0f0f0; }
.inspector-date { color: #aaa; }
.modal-body { padding: 16px 24px; display: flex; flex-direction: column; gap: 8px; }
.empty { text-align: center; padding: 40px; color: #aaa; font-size: 0.88rem; }
.room-block { border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
.room-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f5f5f5; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: #1a1a2e; }
.room-header-right { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: #888; }
.room-count { font-weight: bold; color: #00897b; }
.room-items { display: flex; flex-direction: column; }
.item-block { border-top: 1px solid #f5f5f5; }
.item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; cursor: pointer; transition: background 0.15s; }
.item-row:hover { background: #fafafa; }
.item-info { display: flex; flex-direction: column; }
.item-name { font-size: 0.85rem; font-weight: 500; color: #333; }
.item-category { font-size: 0.72rem; color: #999; }
.item-actions { display: flex; align-items: center; gap: 8px; }
.item-chevron { font-size: 0.72rem; color: #aaa; }
.item-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: bold; }
.badge-item-pending { background: #f0f0f0; color: #888; }
.badge-item-ok { background: #e0faf6; color: #00897b; }
.badge-item-nok { background: #fdecea; color: #c0392b; }
.item-detail-panel { background: #f9f9f9; border-top: 1px solid #eee; padding: 10px 18px; display: flex; flex-direction: column; gap: 10px; }
.visit-entry { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.visit-entry-header { display: flex; justify-content: space-between; font-size: 0.78rem; }
.visit-entry-inspector { font-weight: 600; color: #1a1a2e; display: flex; align-items: center; gap: 5px; }
.visit-entry-date { color: #aaa; }
.visit-entry-desc { margin: 0; font-size: 0.83rem; color: #444; line-height: 1.5; background: #f5f5f5; padding: 8px 10px; border-radius: 6px; }
.visit-entry-photos { display: flex; flex-wrap: wrap; gap: 6px; }
.photo-thumb-link { border-radius: 6px; overflow: hidden; border: 2px solid #eee; transition: border-color 0.15s; display: block; }
.photo-thumb-link:hover { border-color: #00e5cc; }
.photo-thumb { width: 90px; height: 70px; object-fit: cover; display: block; }
.no-photo { font-size: 0.75rem; color: #bbb; display: flex; align-items: center; gap: 5px; }
</style>
