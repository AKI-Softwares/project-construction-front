
<template>
  <MainLayout titulo="Detalhe da Vistoria">

    <button class="btn-back" @click="router.push('/visits')">
      <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      Voltar para Vistorias
    </button>

    <div v-if="loading" class="state">Carregando...</div>
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
          <strong>Inspetor:</strong> {{ latestVisit.inspector?.name || '—' }}
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
              :class="['item-row', `item-${item.status.toLowerCase()}`]"
            >
              <div class="item-info">
                <span class="item-name">{{ item.apartmentRoomService.service.name }}</span>
                <span class="item-category">{{ item.apartmentRoomService.service.category }}</span>
              </div>
              <span :class="['item-badge', `badge-item-${item.status.toLowerCase()}`]">
                {{ translateItemStatus(item.status) }}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getVisit } from '../../services/visits.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const visit = ref(null)
const openRoom = ref(null)

const latestVisit = computed(() => {
  if (!visit.value?.visits?.length) return null
  return visit.value.visits[visit.value.visits.length - 1]
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

// Agrupa itens por cômodo
const groupedRooms = computed(() => {
  const items = visit.value?.items || []
  const rooms = {}

  for (const item of items) {
    const roomName = item.apartmentRoomService.apartmentRoom.name
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

onMounted(async () => {
  try {
    visit.value = await getVisit(route.params.id)
    // Abre o primeiro cômodo por padrão
    if (visit.value?.items?.length) {
      openRoom.value = visit.value.items[0].apartmentRoomService.apartmentRoom.name
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar vistoria.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
}
.btn-back:hover { color: #00e5cc; }

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

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #f5f5f5;
}

.item-info {
  display: flex;
  flex-direction: column;
}
.item-name { font-size: 0.88rem; color: #333; font-weight: 500; }
.item-category { font-size: 0.75rem; color: #999; }

.item-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-item-pending { background: #f0f0f0; color: #888; }
.badge-item-ok { background: #e0faf6; color: #00897b; }
.badge-item-nok { background: #fdecea; color: #c0392b; }
</style>
