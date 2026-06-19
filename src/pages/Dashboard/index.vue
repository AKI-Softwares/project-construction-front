<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Barra de progresso geral -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">Progresso geral dos empreendimentos</span>
          <span class="progress-pct">{{ totalBuildings }} empreendimento{{ totalBuildings !== 1 ? 's' : '' }} cadastrado{{ totalBuildings !== 1 ? 's' : '' }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill teal" :style="{ width: '100%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot teal"></span>{{ totalApartments }} apartamentos no total</span>
          <span><span class="dot dark"></span>{{ totalUsers }} usuários cadastrados</span>
        </div>
      </div>

      <!-- Cards -->
      <div class="cards">
        <div class="card card-dark">
          <div class="card-header">
            <span>Empreendimentos</span>
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" />
          </div>
          <div class="card-number">{{ totalBuildings }}</div>
          <div class="card-sub">cadastrados no sistema</div>
        </div>
        <div class="card card-teal">
          <div class="card-header">
            <span>Apartamentos</span>
            <FontAwesomeIcon :icon="['fas', 'door-open']" />
          </div>
          <div class="card-number">{{ totalApartments }}</div>
          <div class="card-sub">distribuídos nos empreendimentos</div>
        </div>
        <div class="card card-orange">
          <div class="card-header">
            <span>Usuários</span>
            <FontAwesomeIcon :icon="['fas', 'users']" />
          </div>
          <div class="card-number">{{ totalUsers }}</div>
          <div class="card-sub">cadastrados na plataforma</div>
        </div>
        <div class="card card-yellow">
          <div class="card-header">
            <span>Média de apts</span>
            <FontAwesomeIcon :icon="['fas', 'chart-bar']" />
          </div>
          <div class="card-number">{{ avgApts }}</div>
          <div class="card-sub">por empreendimento</div>
        </div>
      </div>

      <!-- Listas -->
      <div class="bottom-row">

        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'building-circle-arrow-right']" class="title-icon teal" />
            Empreendimentos
          </div>
          <div v-for="b in buildingsWithCount" :key="b.id" class="building-row">
            <div class="building-name">{{ b.name }}</div>
            <div class="building-bar">
              <div class="building-fill" :style="{ width: totalApartments > 0 ? (b.aptCount / maxApts * 100) + '%' : '0%' }"></div>
            </div>
            <span class="building-count">{{ b.aptCount }} apt{{ b.aptCount !== 1 ? 's' : '' }}</span>
          </div>
          <div v-if="buildingsWithCount.length === 0" class="empty">Nenhum empreendimento cadastrado.</div>
        </div>

        <div class="table-card">
          <div class="table-title">
            <FontAwesomeIcon :icon="['fas', 'users']" class="title-icon orange" />
            Usuários por função
          </div>
          <div v-for="group in usersByRole" :key="group.role" class="building-row">
            <div class="building-name">{{ group.role }}</div>
            <div class="building-bar">
              <div class="building-fill orange" :style="{ width: totalUsers > 0 ? (group.count / totalUsers * 100) + '%' : '0%' }"></div>
            </div>
            <span class="building-count">{{ group.count }}</span>
          </div>
          <div v-if="usersByRole.length === 0" class="empty">Nenhum usuário cadastrado.</div>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getUsers } from '../../services/users.js'

const loading = ref(true)
const error = ref('')
const buildings = ref([])
const apartments = ref([])
const users = ref([])

const totalBuildings = computed(() => buildings.value.length)
const totalApartments = computed(() => apartments.value.length)
const totalUsers = computed(() => users.value.length)
const avgApts = computed(() =>
  totalBuildings.value > 0 ? Math.round(totalApartments.value / totalBuildings.value) : 0
)

const buildingsWithCount = computed(() =>
  buildings.value.map(b => ({
    ...b,
    aptCount: apartments.value.filter(a => a.buildingId === b.id).length,
  })).sort((a, b) => b.aptCount - a.aptCount)
)

const maxApts = computed(() =>
  Math.max(...buildingsWithCount.value.map(b => b.aptCount), 1)
)

const usersByRole = computed(() => {
  const map = new Map()
  for (const u of users.value) {
    const role = u.role?.name || 'Sem função'
    map.set(role, (map.get(role) || 0) + 1)
  }
  return [...map.entries()]
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
})

onMounted(async () => {
  try {
    const [b, a, u] = await Promise.allSettled([
      getBuildings(),
      getApartments(),
      getUsers(),
    ])
    if (b.status === 'fulfilled') buildings.value = b.value
    if (a.status === 'fulfilled') apartments.value = a.value
    if (u.status === 'fulfilled') users.value = u.value
    if (b.status === 'rejected' && a.status === 'rejected') {
      error.value = 'Erro ao carregar dados do dashboard.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }
.progress-card { background: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #eee; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.progress-label { font-size: 0.9rem; font-weight: 600; color: #333; }
.progress-pct { font-size: 1rem; font-weight: bold; color: #00e5cc; }
.progress-bar { height: 12px; background: rgba(0,0,0,0.08); border-radius: 6px; overflow: hidden; display: flex; margin-bottom: 10px; }
.progress-fill { height: 100%; transition: width 0.4s ease; }
.progress-fill.teal { background: #00e5cc; }
.progress-legend { display: flex; gap: 24px; font-size: 0.8rem; color: #555; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.dot.teal { background: #00e5cc; }
.dot.dark { background: #1a1a2e; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.card { border-radius: 12px; padding: 20px; background: #fff; border-left: 6px solid transparent; }
.card-dark { border-left-color: #1a1a2e; }
.card-teal { border-left-color: #00e5cc; }
.card-orange { border-left-color: #f99f56; }
.card-yellow { border-left-color: #f5a623; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #555; margin-bottom: 8px; }
.card-number { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
.card-sub { font-size: 0.8rem; color: #888; margin-top: 4px; }
.bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.table-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.title-icon.teal { color: #00e5cc; }
.title-icon.orange { color: #f99f56; }
.building-row { display: grid; grid-template-columns: 1fr 2fr auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.building-row:last-child { border-bottom: none; }
.building-name { font-size: 0.85rem; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.building-bar { height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; }
.building-fill { height: 100%; background: #00e5cc; border-radius: 4px; transition: width 0.3s; }
.building-fill.orange { background: #f99f56; }
.building-count { font-size: 0.82rem; font-weight: bold; color: #555; white-space: nowrap; }
.empty { text-align: center; padding: 24px; color: #aaa; font-size: 0.9rem; }
</style>
