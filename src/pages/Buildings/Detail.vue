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

      <div class="apt-actions" v-if="authStore.hasPermission('apartments:create')">
        <button :class="['btn-add', { active: aptMode === 'single' }]" @click="aptMode = aptMode === 'single' ? null : 'single'">
          + Adicionar Apartamento individual
        </button>
        <button :class="['btn-batch', { active: aptMode === 'batch' }]" @click="aptMode = aptMode === 'batch' ? null : 'batch'">
          Cadastro em Lote
        </button>
      </div>

      <div v-if="aptMode === 'single'" class="form-card">
        <h3 class="form-title">Novo Apartamento em {{ building?.name }}</h3>
        <div v-if="aptSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Apartamento cadastrado com sucesso!</div>
        <div v-if="aptError" class="alert error">{{ aptError }}</div>
        <select v-model="singleApt.apartmentTypeId" :class="{ invalid: aptErrors.apartmentTypeId }">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in allApartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <span v-if="aptErrors.apartmentTypeId" class="field-error">{{ aptErrors.apartmentTypeId }}</span>
        <div class="form-row">
          <div class="form-col">
            <input v-model="singleApt.identifier" type="text" placeholder="Número (ex: 101 ou 101A)" :class="{ invalid: aptErrors.identifier }" />
            <span v-if="aptErrors.identifier" class="field-error">{{ aptErrors.identifier }}</span>
          </div>
          <div class="form-col">
            <input v-model="singleApt.floor" type="text" placeholder="Andar" />
          </div>
          <div class="form-col">
            <input v-model="singleApt.block" type="text" placeholder="Bloco (ex: A)" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingApt" @click="saveSingleApt">{{ savingApt ? 'Salvando...' : 'Salvar' }}</button>
          <button class="btn-cancel" @click="aptMode = null">Voltar</button>
        </div>
      </div>

      <div v-if="aptMode === 'batch'" class="form-card">
        <h3 class="form-title">Cadastrar em Lote — {{ building?.name }}</h3>
        <div class="info-box">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="info-icon" />
          <div>
            <strong>Como funciona:</strong>
            <ul>
              <li>Bloco B, 4 andares, 3 apts/andar → Gera B101, B102, B103, B201...</li>
              <li>Formato: BlocoAndarNúmero (ex: B101 = Bloco B, 1º andar, apt 01)</li>
            </ul>
          </div>
        </div>
        <div v-if="batchSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> {{ batchSuccess }}</div>
        <div v-if="batchError" class="alert error">{{ batchError }}</div>
        <select v-model="batchForm.apartmentTypeId" :class="{ invalid: batchErrors.apartmentTypeId }">
          <option value="" disabled>Tipo de Apartamento</option>
          <option v-for="t in allApartmentTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <span v-if="batchErrors.apartmentTypeId" class="field-error">{{ batchErrors.apartmentTypeId }}</span>
        <div class="form-row">
          <div class="form-col">
            <input v-model="batchForm.block" type="text" placeholder="Ex: Bloco B" :class="{ invalid: batchErrors.block }" />
            <span v-if="batchErrors.block" class="field-error">{{ batchErrors.block }}</span>
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.floors" type="number" placeholder="Qtd de andares" min="1" :class="{ invalid: batchErrors.floors }" />
            <span v-if="batchErrors.floors" class="field-error">{{ batchErrors.floors }}</span>
          </div>
          <div class="form-col">
            <input v-model.number="batchForm.aptsPerFloor" type="number" placeholder="Apts por andar" min="1" :class="{ invalid: batchErrors.aptsPerFloor }" />
            <span v-if="batchErrors.aptsPerFloor" class="field-error">{{ batchErrors.aptsPerFloor }}</span>
          </div>
        </div>
        <div v-if="batchPreview.length > 0" class="preview">
          <strong>Preview ({{ batchPreview.length }} apartamentos):</strong>
          <div class="preview-list">
            <span v-for="id in batchPreview.slice(0, 20)" :key="id" class="preview-tag">{{ id }}</span>
            <span v-if="batchPreview.length > 20" class="preview-tag more">+{{ batchPreview.length - 20 }} mais</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="savingBatch" @click="saveBatch">
            {{ savingBatch ? `Salvando... (${batchProgress}/${batchPreview.length})` : 'Salvar' }}
          </button>
          <button class="btn-cancel" @click="aptMode = null">Voltar</button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuilding } from '../../services/buildings.js'
import { getApartments, createApartment } from '../../services/apartments.js'
import { getApartmentType, getApartmentTypes } from '../../services/apartmentTypes.js'
import { useAuthStore } from '../../store/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const building = ref(null)
const apartments = ref([])
const apartmentTypes = ref({}) // { [typeId]: typeData } — usado pra exibir cômodos
const allApartmentTypes = ref([]) // lista completa, pro <select> do formulário

const openApt = ref(null)
const aptRooms = ref({})        // { [aptId]: rooms[] }
const loadingAptRooms = ref({}) // { [aptId]: boolean }

// ─── Adicionar apartamento (individual) ────────────────────────
const aptMode = ref(null)
const savingApt = ref(false)
const aptSuccess = ref(false)
const aptError = ref('')
const singleApt = reactive({ apartmentTypeId: '', identifier: '', floor: '', block: '' })
const aptErrors = reactive({ apartmentTypeId: '', identifier: '' })

function validateSingleApt() {
  aptErrors.apartmentTypeId = ''; aptErrors.identifier = ''
  let valid = true
  if (!singleApt.apartmentTypeId) { aptErrors.apartmentTypeId = 'Selecione um tipo.'; valid = false }
  if (!singleApt.identifier) { aptErrors.identifier = 'Número é obrigatório.'; valid = false }
  return valid
}

async function saveSingleApt() {
  if (!validateSingleApt()) return
  savingApt.value = true; aptError.value = ''; aptSuccess.value = false
  try {
    const created = await createApartment({
      buildingId: Number(route.params.id),
      apartmentTypeId: Number(singleApt.apartmentTypeId),
      identifier: singleApt.identifier,
      floor: singleApt.floor ? Number(singleApt.floor) : undefined,
      block: singleApt.block || undefined,
    })
    apartments.value.push(created)
    aptSuccess.value = true
    singleApt.identifier = ''; singleApt.floor = ''; singleApt.block = ''
  } catch (e) {
    if (e.response?.status === 409) aptError.value = 'Número de apartamento já existe neste empreendimento.'
    else aptError.value = e.response?.data?.message || 'Erro ao cadastrar.'
  } finally {
    savingApt.value = false
  }
}

// ─── Adicionar apartamento (em lote) ───────────────────────────
const savingBatch = ref(false)
const batchProgress = ref(0)
const batchSuccess = ref('')
const batchError = ref('')
const batchForm = reactive({ apartmentTypeId: '', block: '', floors: '', aptsPerFloor: '' })
const batchErrors = reactive({ apartmentTypeId: '', block: '', floors: '', aptsPerFloor: '' })

const batchPreview = computed(() => {
  if (!batchForm.block || !batchForm.floors || !batchForm.aptsPerFloor) return []
  const block = batchForm.block.replace('Bloco ', '').trim()
  const floors = Number(batchForm.floors)
  const aptsPerFloor = Number(batchForm.aptsPerFloor)
  if (!floors || !aptsPerFloor || floors < 1 || aptsPerFloor < 1) return []
  const identifiers = []
  for (let floor = 1; floor <= floors; floor++) {
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      identifiers.push(`${block}${floor}${String(apt).padStart(2, '0')}`)
    }
  }
  return identifiers
})

function validateBatch() {
  Object.keys(batchErrors).forEach(k => batchErrors[k] = '')
  let valid = true
  if (!batchForm.apartmentTypeId) { batchErrors.apartmentTypeId = 'Selecione.'; valid = false }
  if (!batchForm.block) { batchErrors.block = 'Obrigatório.'; valid = false }
  if (!batchForm.floors || batchForm.floors < 1) { batchErrors.floors = 'Mínimo 1.'; valid = false }
  if (!batchForm.aptsPerFloor || batchForm.aptsPerFloor < 1) { batchErrors.aptsPerFloor = 'Mínimo 1.'; valid = false }
  return valid
}

async function saveBatch() {
  if (!validateBatch()) return
  savingBatch.value = true; batchProgress.value = 0; batchSuccess.value = ''; batchError.value = ''
  const block = batchForm.block.replace('Bloco ', '').trim()
  const floors = Number(batchForm.floors)
  const aptsPerFloor = Number(batchForm.aptsPerFloor)
  let created = 0; let errors = 0
  for (let floor = 1; floor <= floors; floor++) {
    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      const identifier = `${block}${floor}${String(apt).padStart(2, '0')}`
      try {
        const result = await createApartment({
          buildingId: Number(route.params.id),
          apartmentTypeId: Number(batchForm.apartmentTypeId),
          identifier, floor, block,
        })
        apartments.value.push(result)
        created++
      } catch { errors++ }
      batchProgress.value = created + errors
    }
  }
  savingBatch.value = false
  batchSuccess.value = errors === 0
    ? `${created} cadastrados!`
    : `${created} cadastrados. ${errors} falharam.`
}

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
    const [b, apts, types] = await Promise.all([
      getBuilding(route.params.id),
      getApartments(route.params.id),
      getApartmentTypes(),
    ])
    building.value = b
    apartments.value = Array.isArray(apts) ? apts : (apts?.data || [])
    allApartmentTypes.value = types || []
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

/* ─── Formulários de adicionar apartamento (individual / lote) ─── */
.apt-actions { display: flex; gap: 16px; margin-bottom: 24px; }
.btn-add, .btn-batch { display: inline-flex; align-items: center; gap: 8px; background: #00e5cc; color: #0d0d2b; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-add.active, .btn-batch.active { opacity: 0.7; }

.form-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.form-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.form-card input, .form-card select { width: 100%; padding: 14px 20px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.95rem; outline: none; color: #333; appearance: none; box-sizing: border-box; }
.form-card input.invalid, .form-card select.invalid { border: 2px solid #c0392b; background: #fff3f0; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 4px; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 8px; }
.form-actions { display: flex; gap: 16px; justify-content: flex-end; }
.btn-save { padding: 12px 36px; background: #00e5cc; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #0d0d2b; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 12px 36px; background: #e8e8e8; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: bold; color: #333; cursor: pointer; }
.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.info-box { display: flex; gap: 12px; background: #fff8e1; border-radius: 8px; padding: 16px; font-size: 0.85rem; color: #333; }
.info-icon { color: #f5a623; margin-top: 2px; flex-shrink: 0; }
.info-box ul { margin: 4px 0 0 16px; padding: 0; }
.preview { background: #f4f4f4; border-radius: 8px; padding: 16px; font-size: 0.85rem; }
.preview-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.preview-tag { background: #0d0d2b; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
.preview-tag.more { background: #00e5cc; color: #0d0d2b; }
</style>
