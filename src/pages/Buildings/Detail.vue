<template>
  <MainLayout :titulo="building?.name || 'Empreendimento'">

    <div class="top-nav">
      <button class="btn-back" @click="router.push('/buildings')">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
      </button>
      <span v-if="building?.address" class="building-address">{{ building.address }}</span>
    </div>

    <div v-if="loading" class="state">Carregando empreendimento...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error">

      <!-- Resumo -->
      <div class="summary-cards">
        <div class="summary-card">
          <span class="summary-label">Apartamentos</span>
          <span class="summary-value">{{ apartments.length }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Tipos cadastrados</span>
          <span class="summary-value">{{ uniqueTypeIds.length }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Cômodos (total)</span>
          <span class="summary-value">{{ totalRooms }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Serviços (total)</span>
          <span class="summary-value">{{ totalServices }}</span>
        </div>
      </div>

      <div class="section-header">
        <h3>Apartamentos</h3>
        <span class="apt-count">{{ apartments.length }} unidade(s)</span>
      </div>

      <div v-if="apartments.length === 0" class="state">Nenhum apartamento cadastrado neste empreendimento.</div>

      <div class="apt-list">
        <div v-for="apt in apartments" :key="apt.id" class="apt-card">

          <div class="apt-header" @click="toggleApt(apt.id)">
            <div class="apt-header-info">
              <span class="apt-identifier">Apto {{ apt.identifier }}</span>
              <span v-if="apt.block || apt.floor" class="apt-meta">
                {{ [apt.block ? `Bloco ${apt.block}` : null, apt.floor ? `${apt.floor}º andar` : null].filter(Boolean).join(' · ') }}
              </span>
              <span v-if="getTypeName(apt.apartmentTypeId)" class="apt-type-tag">
                {{ getTypeName(apt.apartmentTypeId) }}
              </span>
            </div>
            <div class="apt-header-right">
              <span v-if="loadingAptRooms[apt.id]" class="apt-loading">carregando...</span>
              <span v-else-if="aptRooms[apt.id]" class="apt-rooms-count">
                {{ aptRooms[apt.id].length }} cômodo(s)
              </span>
              <FontAwesomeIcon :icon="['fas', openApt === apt.id ? 'chevron-up' : 'chevron-down']" class="apt-chevron" />
            </div>
          </div>

          <div v-if="openApt === apt.id" class="apt-body">
            <div v-if="loadingAptRooms[apt.id]" class="apt-body-state">Carregando cômodos...</div>
            <div v-else-if="!aptRooms[apt.id]?.length" class="apt-body-state">Nenhum cômodo cadastrado para este tipo de apartamento.</div>
            <div v-else class="rooms-grid">
              <div v-for="room in aptRooms[apt.id]" :key="room.id" class="room-card">
                <div class="room-name">
                  <FontAwesomeIcon :icon="['fas', 'door-open']" class="room-icon" />
                  {{ room.name }}
                </div>
                <div class="services-list">
                  <div v-if="!room.defaultServices?.length" class="no-services">
                    Sem serviços vinculados
                  </div>
                  <span
                    v-for="svc in room.defaultServices"
                    :key="svc.service.id"
                    class="service-tag"
                  >
                    {{ svc.service.name }}
                    <span v-if="svc.service.category" class="service-category">
                      {{ svc.service.category }}
                    </span>
                  </span>
                </div>
              </div>
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
import { getBuilding } from '../../services/buildings.js'
import { getApartments } from '../../services/apartments.js'
import { getApartmentType } from '../../services/apartmentTypes.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const building = ref(null)
const apartments = ref([])
const apartmentTypes = ref({}) // { [typeId]: typeData }

const openApt = ref(null)
const aptRooms = ref({})        // { [aptId]: rooms[] }
const loadingAptRooms = ref({}) // { [aptId]: boolean }

const uniqueTypeIds = computed(() =>
  [...new Set(apartments.value.map(a => a.apartmentTypeId).filter(Boolean))]
)

const totalRooms = computed(() =>
  Object.values(aptRooms.value).reduce((acc, rooms) => acc + (rooms?.length || 0), 0)
)

const totalServices = computed(() =>
  Object.values(aptRooms.value).reduce((acc, rooms) =>
    acc + (rooms || []).reduce((a, r) =>
      a + (r.defaultServices?.length || 0), 0
    ), 0
  )
)

function getTypeName(typeId) {
  return apartmentTypes.value[typeId]?.name || null
}

async function toggleApt(aptId) {
  if (openApt.value === aptId) {
    openApt.value = null
    return
  }
  openApt.value = aptId

  // Já carregou antes — não busca de novo
  if (aptRooms.value[aptId] !== undefined) return

  const apt = apartments.value.find(a => a.id === aptId)
  if (!apt?.apartmentTypeId) {
    aptRooms.value = { ...aptRooms.value, [aptId]: [] }
    return
  }

  loadingAptRooms.value = { ...loadingAptRooms.value, [aptId]: true }
  try {
    if (!apartmentTypes.value[apt.apartmentTypeId]) {
      const type = await getApartmentType(apt.apartmentTypeId)
      apartmentTypes.value = { ...apartmentTypes.value, [apt.apartmentTypeId]: type }
    }
    const type = apartmentTypes.value[apt.apartmentTypeId]
    aptRooms.value = { ...aptRooms.value, [aptId]: type.rooms || [] }
  } catch (e) {
    console.error('Erro ao carregar cômodos:', e)
    aptRooms.value = { ...aptRooms.value, [aptId]: [] }
  } finally {
    loadingAptRooms.value = { ...loadingAptRooms.value, [aptId]: false }
  }
}

onMounted(async () => {
  try {
    const [b, apts] = await Promise.all([
      getBuilding(route.params.id),
      getApartments(route.params.id),
    ])
    building.value = b
    apartments.value = Array.isArray(apts) ? apts : (apts?.data || [])
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao carregar empreendimento.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.top-nav { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.btn-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #555; font-size: 0.9rem; cursor: pointer; padding: 8px 0; }
.btn-back:hover { color: #00e5cc; }
.building-address { font-size: 0.85rem; color: #888; }
.state { text-align: center; padding: 40px; color: #888; }
.error { color: #c0392b; }
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.summary-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 6px; }
.summary-label { font-size: 0.78rem; color: #888; text-transform: uppercase; font-weight: 600; }
.summary-value { font-size: 2rem; font-weight: 700; color: #1a1a2e; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-header h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.apt-count { font-size: 0.82rem; color: #aaa; }
.apt-list { display: flex; flex-direction: column; gap: 10px; }
.apt-card { background: #fff; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
.apt-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: background 0.15s; }
.apt-header:hover { background: #fafafa; }
.apt-header-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.apt-identifier { font-size: 0.95rem; font-weight: 700; color: #1a1a2e; }
.apt-meta { font-size: 0.78rem; color: #888; }
.apt-type-tag { font-size: 0.72rem; background: #e0faf6; color: #00897b; padding: 2px 10px; border-radius: 12px; font-weight: 600; }
.apt-header-right { display: flex; align-items: center; gap: 10px; }
.apt-loading { font-size: 0.75rem; color: #aaa; font-style: italic; }
.apt-rooms-count { font-size: 0.78rem; color: #888; }
.apt-chevron { font-size: 0.8rem; color: #aaa; }
.apt-body { border-top: 1px solid #f0f0f0; padding: 16px 20px; background: #fafafa; }
.apt-body-state { font-size: 0.85rem; color: #bbb; padding: 8px 0; }
.rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.room-card { background: #fff; border-radius: 10px; border: 1px solid #eee; padding: 14px 16px; }
.room-name { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; }
.room-icon { color: #00e5cc; font-size: 0.85rem; }
.services-list { display: flex; flex-direction: column; gap: 6px; }
.no-services { font-size: 0.75rem; color: #ccc; font-style: italic; }
.service-tag { display: flex; justify-content: space-between; align-items: center; background: #f5f5f5; border-radius: 6px; padding: 5px 10px; font-size: 0.78rem; color: #333; }
.service-category { font-size: 0.68rem; color: #aaa; margin-left: 6px; }
</style>
