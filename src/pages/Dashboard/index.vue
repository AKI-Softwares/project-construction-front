<template>
  <MainLayout titulo="Dashboard">
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Barra de progresso -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">
            {{ isRich ? 'Vistorias finalizadas no período' : 'Progresso geral dos empreendimentos' }}
          </span>
          <span class="progress-pct">
            {{ isRich ? finalizedPct + '% concluído' : totalBuildings + ' empreendimento' + (totalBuildings !== 1 ? 's' : '') }}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill teal" :style="{ width: (isRich ? finalizedPct : 100) + '%' }"></div>
          <div v-if="isRich" class="progress-fill orange" :style="{ width: pendingPct + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span v-if="isRich">
            <span class="dot teal"></span>Finalizadas {{ overview.visitsFinalized }}
          </span>
          <span v-if="isRich">
            <span class="dot orange"></span>Pendentes {{ overview.visitsPending }}
          </span>
          <span v-if="!isRich">
            <span class="dot teal"></span>{{ totalApartments }} apartamentos
          </span>
          <span v-if="!isRich">
            <span class="dot dark"></span>{{ totalUsers }} usuários
          </span>
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
          <div class="card-sub">{{ totalApartments }} apartamentos no total</div>
        </div>

        <div class="card card-teal">
          <div class="card-header">
            <span>{{ isRich ? 'Taxa de Aprovação' : 'Apartamentos' }}</span>
            <FontAwesomeIcon :icon="['fas', 'circle-check']" />
          </div>
          <div class="card-number">{{ isRich ? approvalPct + '%' : totalApartments }}</div>
          <div class="card-sub">{{ isRich ? overview.visitsFinalized + ' vistorias finalizadas' : 'distribuídos nos empreendimentos' }}</div>
        </div>

        <div class="card card-orange">
          <div class="card-header">
            <span>{{ isRich ? 'Vistorias Pendentes' : 'Usuários' }}</span>
            <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          </div>
          <div class="card-number">{{ isRich ? overview.visitsPending : totalUsers }}</div>
          <div class="card-sub card-sub-alert">{{ isRich ? 'aguardando inspeção' : 'cadastrados na plataforma' }}</div>
        </div>

        <div class="card card-yellow">
          <div class="card-header">
            <span>{{ isRich ? 'Não Conformidades' : 'Média de apts' }}</span>
            <FontAwesomeIcon :icon="['fas', 'chart-bar']" />
          </div>
          <div class="card-number">{{ isRich ? overview.totalNonConformities : avgApts }}</div>
          <div class="card-sub">{{ isRich ? 'identificadas nas vistorias' : 'por empreendimento' }}</div>
        </div>
      </div>

      <!-- Gráficos + listas -->
      <div class="bottom-row">

        <!-- Empreendimentos com contagem de apartamentos -->
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

        <!-- Qualidade por serviço (só pra company admin) ou usuários por função -->
        <div class="table-card">
          <template v-if="isRich && qualityRows.length > 0">
            <div class="table-title">
              <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="title-icon orange" />
              Serviços com mais reprovações
            </div>
            <div class="table-header-2">
              <span>Serviço</span>
              <span>Taxa NOK</span>
            </div>
            <div v-for="row in topQualityIssues" :key="row.serviceId" class="building-row">
              <div class="building-name">{{ row.serviceName }}</div>
              <div class="building-bar">
                <div class="building-fill orange" :style="{ width: Math.round(row.nokRate * 100) + '%' }"></div>
              </div>
              <span class="building-count">{{ Math.round(row.nokRate * 100) }}%</span>
            </div>
            <div v-if="topQualityIssues.length === 0" class="empty">Nenhuma reprovação no período. 🎉</div>
          </template>

          <template v-else>
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
          </template>
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
import { getOverview, getQuality } from '../../services/analytics.js'

const loading = ref(true)
const error = ref('')
const buildings = ref([])
const apartments = ref([])
const users = ref([])
const isRich = ref(false) // true quando analytics retorna 200 (company admin)
const qualityRows = ref([])

const overview = ref({
  totalApartments: 0, visitsFinalized: 0, visitsPending: 0,
  nokRate: 0, totalNonConformities: 0, totalInspectors: 0,
})

const totalBuildings = computed(() => buildings.value.length)
const totalApartments = computed(() => apartments.value.length)
const totalUsers = computed(() => users.value.length)
const avgApts = computed(() =>
  totalBuildings.value > 0 ? Math.round(totalApartments.value / totalBuildings.value) : 0
)

const totalVisits = computed(() => overview.value.visitsFinalized + overview.value.visitsPending)
const finalizedPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsFinalized / totalVisits.value) * 100) : 0
)
const pendingPct = computed(() =>
  totalVisits.value > 0 ? Math.round((overview.value.visitsPending / totalVisits.value) * 100) : 0
)
const approvalPct = computed(() => Math.round((1 - overview.value.nokRate) * 100))

const buildingsWithCount = computed(() =>
  buildings.value.map(b => ({
    ...b,
    aptCount: apartments.value.filter(a => a.buildingId === b.id).length,
  })).sort((a, b) => b.aptCount - a.aptCount)
)
const maxApts = computed(() => Math.max(...buildingsWithCount.value.map(b => b.aptCount), 1))

const topQualityIssues = computed(() =>
  [...qualityRows.value]
    .filter(r => r.nokCount > 0)
    .sort((a, b) => b.nokRate - a.nokRate)
    .slice(0, 6)
)

const usersByRole = computed(() => {
  const map = new Map()
  for (const u of users.value) {
    const role = u.role?.name || 'Sem função'
    map.set(role, (map.get(role) || 0) + 1)
  }
  return [...map.entries()].map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count)
})

onMounted(async () => {
  try {
    // Carrega dados base que funcionam pra qualquer perfil
    const [b, a, u] = await Promise.allSettled([getBuildings(), getApartments(), getUsers()])
    if (b.status === 'fulfilled') buildings.value = b.value
    if (a.status === 'fulfilled') apartments.value = a.value
    if (u.status === 'fulfilled') users.value = u.value

    // Tenta analytics (só funciona pra company admin — 403 pra outros perfis)
    try {
      const [ov, q] = await Promise.all([getOverview(), getQuality()])
      overview.value = ov.data
      qualityRows.value = q.data
      isRich.value = true // analytics funcionou — exibe versão rica
    } catch {
      // 403 esperado pra platform admin e inspetores — fica com o dashboard simples
      isRich.value = false
    }
  } catch (e) {
    error.value = 'Erro ao carregar dados do dashboard.'
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
.progress-fill.orange { background: #f99f56; }
.progress-legend { display: flex; gap: 24px; font-size: 0.8rem; color: #555; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.dot.teal { background: #00e5cc; }
.dot.orange { background: #f99f56; }
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
.card-sub-alert { color: #f99f56; font-weight: 600; }

.bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #eee; }
.table-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: #333; margin-bottom: 16px; }
.title-icon.teal { color: #00e5cc; }
.title-icon.orange { color: #f99f56; }
.table-header-2 { display: grid; grid-template-columns: 1fr auto; padding: 0 0 8px; font-size: 0.78rem; color: #888; font-weight: 600; border-bottom: 1px solid #eee; margin-bottom: 8px; }
.building-row { display: grid; grid-template-columns: 1fr 2fr auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.building-row:last-child { border-bottom: none; }
.building-name { font-size: 0.85rem; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.building-bar { height: 8px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; }
.building-fill { height: 100%; background: #00e5cc; border-radius: 4px; transition: width 0.3s; }
.building-fill.orange { background: #f99f56; }
.building-count { font-size: 0.82rem; font-weight: bold; color: #555; white-space: nowrap; }
.empty { text-align: center; padding: 24px; color: #aaa; font-size: 0.9rem; }
</style>
