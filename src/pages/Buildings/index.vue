<template>
  <MainLayout titulo="Empreendimentos">

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'buildings' }]" @click="activeTab = 'buildings'">
        Empreendimentos
      </button>
      <button :class="['tab-btn', { active: activeTab === 'apartments' }]" @click="activeTab = 'apartments'">
        Atribuir Vistorias
      </button>
    </div>

    <hr class="divider" />

    <!-- ===== TAB: EMPREENDIMENTOS ===== -->
    <div v-if="activeTab === 'buildings'">

      <div style="margin-bottom: 20px;">
        <button v-if="authStore.hasPermission('buildings:create')" class="btn-add" @click="showBuildingForm = !showBuildingForm">
          + Adicionar empreendimento
        </button>
      </div>

      <div v-if="showBuildingForm" class="form-card">
        <h3 class="form-title">Novo Empreendimento</h3>
        <div v-if="buildingSuccess" class="alert success">
          <FontAwesomeIcon :icon="['fas', 'circle-check']" /> Empreendimento cadastrado com sucesso!
        </div>
        <div v-if="buildingError" class="alert error">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ buildingError }}
        </div>
        <input v-model="buildingForm.name" type="text" placeholder="Nome do Empreendimento" :class="{ invalid: buildingErrors.name }" />
        <span v-if="buildingErrors.name" class="field-error">{{ buildingErrors.name }}</span>

        <div class="form-row">
          <div class="form-col">
            <input
              v-model="cepInput"
              type="text"
              placeholder="CEP (ex: 87013-000)"
              maxlength="9"
              :class="{ invalid: buildingErrors.address }"
              @input="onCepInput"
              @blur="buscarCep"
            />
            <span v-if="cepLoading" class="field-hint">Buscando endereço...</span>
            <span v-if="cepError" class="field-error">{{ cepError }}</span>
          </div>
          <div class="form-col">
            <input v-model="enderecoForm.numero" type="text" placeholder="Número" />
          </div>
        </div>

        <input v-model="enderecoForm.rua" type="text" placeholder="Rua / Logradouro (preenchido pelo CEP, editável)" />
        <div class="form-row">
          <div class="form-col">
            <input v-model="enderecoForm.bairro" type="text" placeholder="Bairro" />
          </div>
          <div class="form-col">
            <input v-model="enderecoForm.cidade" type="text" placeholder="Cidade" />
          </div>
          <div class="form-col">
            <input v-model="enderecoForm.uf" type="text" placeholder="UF" maxlength="2" />
          </div>
        </div>
        <input v-model="enderecoForm.complemento" type="text" placeholder="Complemento (opcional)" />
        <span v-if="buildingErrors.address" class="field-error">{{ buildingErrors.address }}</span>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingBuilding" @click="saveBuilding">
            {{ savingBuilding ? 'Salvando...' : 'Salvar' }}
          </button>
          <button class="btn-cancel" @click="cancelBuilding">Cancelar</button>
        </div>
      </div>

      <div class="item-list">
        <div v-for="building in buildings" :key="building.id" class="item-card" @click="router.push(`/buildings/${building.id}`)">
          <div class="building-card-info">
            <span class="building-card-name">{{ building.name }}</span>
            <span class="building-card-count">
              {{ apartments.filter(a => a.buildingId === building.id).length }} apartamento(s)
            </span>
          </div>
          <div class="building-card-right">
            <button class="btn-card-delete" title="Excluir empreendimento" @click.stop="confirmDeleteBuilding(building)">
              <FontAwesomeIcon :icon="['fas', 'trash']" />
            </button>
            <span class="building-card-arrow">→</span>
          </div>
        </div>
        <div v-if="buildings.length === 0 && !loadingBuildings" class="empty">Nenhum empreendimento cadastrado.</div>
        <div v-if="loadingBuildings" class="empty">Carregando...</div>
      </div>

    </div>

    <!-- ===== TAB: APARTAMENTOS ===== -->
    <div v-if="activeTab === 'apartments'">

      <div class="apartments-tab-intro">
        <FontAwesomeIcon :icon="['fas', 'circle-info']" />
        Para adicionar apartamentos, abra o empreendimento desejado na aba
        "Empreendimentos" — o cadastro individual e em lote agora fica lá.
      </div>

      <div>

        <div v-if="selectedBuildingId" class="back-action-container">
          <button class="btn-back" @click="goBackToBuildings">← Voltar para Empreendimentos</button>
        </div>

        <div v-if="selectedBuildingId" class="building-header">
          <div class="building-header-top">
            <span class="building-title">
              <FontAwesomeIcon :icon="['fas', 'building']" />
              {{ buildings.find(b => b.id === selectedBuildingId)?.name }}
            </span>
          </div>
          <p class="apartments-tab-hint">
            Esta aba mostra o status de cada apartamento. Para atribuir um vistoriador
            e abrir uma nova vistoria, use a tela
            <router-link :to="`/visits?tab=assign&buildingId=${selectedBuildingId}`">Vistorias</router-link>.
          </p>
          <div class="building-header-info">
            <span><strong>Total de apts:</strong> {{ apartmentsFiltered.length }}</span>
            <span>
              <strong>Vistoriadores atuando:</strong>
              <span v-if="buildingInspectors.length > 0">{{ buildingInspectors.join(', ') }}</span>
              <span v-else class="text-muted">Nenhum</span>
            </span>
          </div>
        </div>

        <div class="apt-table-header">
          <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span><span></span>
        </div>

        <div class="item-list">
          <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
            <div class="apt-row-clickable-wrapper" @click="openChecklist(apt)">
              <span>{{ getBuildingName(apt.buildingId) }}</span>
              <span>{{ apt.identifier }}</span>
              <span>{{ apt.block || '—' }}</span>
              <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
            </div>

            <div class="apt-assign-inline">
              <span v-if="apartmentVisitInfo(apt).finalized" class="apt-status-badge finalized">
                <FontAwesomeIcon :icon="['fas', 'circle-check']" />
                Vistoria finalizada
              </span>
              <span v-else-if="apartmentVisitInfo(apt).activeInspectorName" class="apt-status-badge active">
                <FontAwesomeIcon :icon="['fas', 'user-clock']" />
                {{ apartmentVisitInfo(apt).activeInspectorName }}
              </span>
              <router-link
                v-else
                :to="`/visits?tab=assign&buildingId=${apt.buildingId}`"
                class="apt-status-badge free"
                @click.stop
              >
                <FontAwesomeIcon :icon="['fas', 'plus']" />
                Sem vistoria — Atribuir
              </router-link>
            </div>

            <div class="apt-delete-cell">
              <button class="btn-apt-delete" title="Remover apartamento" @click.stop="confirmDeleteApt(apt)">
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
          <div v-if="apartmentsFiltered.length === 0 && !loadingApts" class="empty">Nenhum apartamento cadastrado.</div>
          <div v-if="loadingApts" class="empty">Carregando...</div>
        </div>
      </div>

    </div>

    <!-- Modal: excluir empreendimento -->
    <div v-if="buildingToDelete" class="modal-overlay" @click.self="buildingToDelete = null">
      <div class="modal-confirm">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Excluir empreendimento</h3>
        <p>Excluir <strong>{{ buildingToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
        <p v-if="buildingDeleteError" class="modal-error">{{ buildingDeleteError }}</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingBuilding" @click="doDeleteBuilding">
            {{ deletingBuilding ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="buildingToDelete = null; buildingDeleteError = ''">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal: excluir apartamento -->
    <div v-if="aptToDelete" class="modal-overlay" @click.self="aptToDelete = null">
      <div class="modal-confirm">
        <div class="modal-icon"><FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" /></div>
        <h3>Remover apartamento</h3>
        <p>Remover o apartamento <strong>{{ aptToDelete.identifier }}</strong> da lista? Esta ação não pode ser desfeita.</p>
        <p v-if="deleteAptError" class="modal-error">{{ deleteAptError }}</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deletingApt" @click="doDeleteApt">
            {{ deletingApt ? 'Removendo...' : 'Sim, remover' }}
          </button>
          <button class="btn-cancel" @click="aptToDelete = null; deleteAptError = ''">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="loadingChecklist" class="checklist-overlay-state">Carregando checklist...</div>
    <div v-if="checklistError" class="checklist-overlay-state error">
      {{ checklistError }}
      <button class="btn-cancel" @click="checklistError = ''">Fechar</button>
    </div>

    <ChecklistModal v-if="selectedChecklist" :checklist="selectedChecklist" :available-users="users" @fechar="selectedChecklist = null" />

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { getBuildings, createBuilding, deleteBuilding } from '../../services/buildings.js'
import { getApartments, deleteApartment } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { getVisits } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const router = useRouter()
const authStore = useAuthStore()
const selectedChecklist = ref(null)
const loadingChecklist = ref(false)
const checklistError = ref('')
const users = ref([])
const allVisits = ref([])

// GET /visits não retorna apartmentId — só identifier/block/floor/building
// dentro de checklist.apartment. Como (buildingId, identifier) é único
// (constraint no back), usamos essa combinação como chave de cruzamento.
// Esta tela é apenas leitura de status: a ação de atribuir inspetor foi
// movida para /visits?tab=assign (domínio de Vistorias).
function lookupVisitInfo(apt, visitsList) {
  const visitsForApt = visitsList.filter(
    (v) => v.checklist?.apartment?.building?.id === apt.buildingId
      && v.checklist?.apartment?.identifier === apt.identifier
  )
  const activeVisit = visitsForApt.find((v) => v.status === 'NOT_STARTED' || v.status === 'ONGOING')
  // Sem vistoria ativa, mas já existe pelo menos uma finalizada: trata como
  // concluído nesta tela (reinspeção, se necessária, é aberta por
  // "Atribuir / Solicitar Re-inspeção" em Não-Conformidades, não aqui).
  const finalized = !activeVisit && visitsForApt.some((v) => v.status === 'FINALIZED')
  return {
    activeInspectorId: activeVisit?.inspectorId || null,
    activeInspectorName: activeVisit?.inspector?.name || null,
    finalized,
  }
}

function apartmentVisitInfo(apt) {
  return lookupVisitInfo(apt, allVisits.value)
}

async function openChecklist(apt) {
  checklistError.value = ''
  loadingChecklist.value = true
  try {
    const detail = await getChecklistByApartment(apt.id)

    if (!detail || !detail.items?.length) {
      // Sem checklist ou checklist vazio — monta estrutura de fallback a partir do tipo
      const tipoDoApt = apartmentTypes.value.find(t => t.id === apt.apartmentTypeId)
      if (tipoDoApt?.rooms?.length) {
        selectedChecklist.value = {
          identifier: apt.identifier,
          block: apt.block || '—',
          rooms: tipoDoApt.rooms.map(room => ({ id: room.id, name: room.name, items: [] })),
        }
      } else {
        checklistError.value = 'Este apartamento ainda não tem checklist gerado.'
      }
      return
    }

    // Checklist com itens — agrupa por cômodo
    selectedChecklist.value = groupChecklistByRoom(detail)
  } catch (e) {
    checklistError.value = e.response?.data?.message || 'Erro ao carregar o checklist.'
  } finally {
    loadingChecklist.value = false
  }
}

const activeTab = ref('buildings')
const buildings = ref([])
const apartments = ref([])
const apartmentTypes = ref([])
const loadingBuildings = ref(false)
const loadingApts = ref(false)
const showBuildingForm = ref(false)
const savingBuilding = ref(false)
const buildingSuccess = ref(false)
const buildingError = ref('')
const buildingForm = reactive({ name: '' })
const buildingErrors = reactive({ name: '', address: '' })

// ─── Busca de CEP (ViaCEP — gratuito, sem chave de API) ────────
const cepInput = ref('')
const cepLoading = ref(false)
const cepError = ref('')
const enderecoForm = reactive({ rua: '', bairro: '', cidade: '', uf: '', numero: '', complemento: '' })

function onCepInput() {
  let v = cepInput.value.replace(/\D/g, '').slice(0, 8)
  if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`
  cepInput.value = v
  cepError.value = ''
}

async function buscarCep() {
  const cepLimpo = cepInput.value.replace(/\D/g, '')
  if (cepLimpo.length !== 8) return
  cepLoading.value = true
  cepError.value = ''
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await response.json()
    if (data.erro) {
      cepError.value = 'CEP não encontrado.'
      return
    }
    enderecoForm.rua = data.logradouro || ''
    enderecoForm.bairro = data.bairro || ''
    enderecoForm.cidade = data.localidade || ''
    enderecoForm.uf = data.uf || ''
  } catch (e) {
    cepError.value = 'Erro ao buscar o CEP. Preencha o endereço manualmente.'
  } finally {
    cepLoading.value = false
  }
}

// Monta a string única "address" que o back espera (só tem uma coluna de
// texto livre — não há colunas próprias pra rua/cidade/etc).
function montarEndereco() {
  const partes = []
  if (enderecoForm.rua) partes.push(enderecoForm.numero ? `${enderecoForm.rua}, ${enderecoForm.numero}` : enderecoForm.rua)
  else if (enderecoForm.numero) partes.push(`Nº ${enderecoForm.numero}`)
  if (enderecoForm.complemento) partes.push(enderecoForm.complemento)
  if (enderecoForm.bairro) partes.push(enderecoForm.bairro)
  if (enderecoForm.cidade) partes.push(enderecoForm.uf ? `${enderecoForm.cidade} - ${enderecoForm.uf}` : enderecoForm.cidade)
  if (cepInput.value) partes.push(`CEP: ${cepInput.value}`)
  return partes.join(', ')
}

function limparEnderecoForm() {
  cepInput.value = ''
  cepError.value = ''
  enderecoForm.rua = ''; enderecoForm.bairro = ''; enderecoForm.cidade = ''
  enderecoForm.uf = ''; enderecoForm.numero = ''; enderecoForm.complemento = ''
}

function cancelBuilding() {
  showBuildingForm.value = false
  buildingForm.name = ''
  buildingErrors.name = ''; buildingErrors.address = ''
  buildingSuccess.value = false; buildingError.value = ''
  limparEnderecoForm()
}

function validateBuilding() {
  buildingErrors.name = ''; buildingErrors.address = ''
  let valid = true
  if (!buildingForm.name || buildingForm.name.length < 2) { buildingErrors.name = 'Nome deve ter pelo menos 2 caracteres.'; valid = false }
  if (!enderecoForm.rua && !enderecoForm.numero && !enderecoForm.cidade) {
    buildingErrors.address = 'Informe ao menos o CEP (ou rua/cidade) e o número.'
    valid = false
  }
  return valid
}

async function saveBuilding() {
  if (!validateBuilding()) return
  savingBuilding.value = true; buildingError.value = ''; buildingSuccess.value = false
  try {
    const created = await createBuilding({ name: buildingForm.name, address: montarEndereco() })
    buildings.value.push(created)
    buildingSuccess.value = true
    buildingForm.name = ''
    limparEnderecoForm()
    // Próximo passo natural: já leva pra tela do empreendimento pra
    // cadastrar os apartamentos, em vez de deixar solto na lista.
    setTimeout(() => router.push(`/buildings/${created.id}`), 800)
  } catch (e) {
    buildingError.value = e.response?.data?.message || 'Erro ao cadastrar empreendimento.'
  } finally {
    savingBuilding.value = false
  }
}

// ─── Excluir empreendimento ───────────────────────────────────
const buildingToDelete = ref(null)
const deletingBuilding = ref(false)

const buildingDeleteError = ref('')

function confirmDeleteBuilding(building) { buildingToDelete.value = building; buildingDeleteError.value = '' }

async function doDeleteBuilding() {
  if (!buildingToDelete.value) return
  deletingBuilding.value = true
  buildingDeleteError.value = ''
  try {
    await deleteBuilding(buildingToDelete.value.id)
    // Só remove da lista local se a API confirmou a exclusão.
    buildings.value = buildings.value.filter(b => b.id !== buildingToDelete.value.id)
    apartments.value = apartments.value.filter(a => a.buildingId !== buildingToDelete.value.id)
    if (selectedBuildingId.value === buildingToDelete.value.id) selectedBuildingId.value = null
    buildingToDelete.value = null
  } catch (e) {
    const status = e.response?.status
    const backendMessage = e.response?.data?.message
    if (status === 409) {
      buildingDeleteError.value = backendMessage?.includes('apartment')
        ? 'Este empreendimento ainda possui apartamentos cadastrados e não pode ser excluído. Exclua os apartamentos primeiro.'
        : (backendMessage || 'Não foi possível excluir: existem dados vinculados a este empreendimento.')
    } else if (status === 404) {
      // Já não existe no back — aí sim é seguro remover da lista local.
      buildings.value = buildings.value.filter(b => b.id !== buildingToDelete.value.id)
      if (selectedBuildingId.value === buildingToDelete.value.id) selectedBuildingId.value = null
      buildingToDelete.value = null
    } else {
      buildingDeleteError.value = backendMessage || 'Erro ao excluir empreendimento. Tente novamente.'
    }
    console.error('Erro ao excluir empreendimento na API:', e)
  } finally {
    deletingBuilding.value = false
  }
}

// ─── Excluir apartamento ──────────────────────────────────────
const aptToDelete = ref(null)
const deletingApt = ref(false)
const deleteAptError = ref('')

function confirmDeleteApt(apt) { aptToDelete.value = apt; deleteAptError.value = '' }

async function doDeleteApt() {
  if (!aptToDelete.value) return
  deletingApt.value = true
  deleteAptError.value = ''
  try {
    await deleteApartment(aptToDelete.value.id)
    // Só remove da lista local se a API confirmou a exclusão.
    apartments.value = apartments.value.filter(a => a.id !== aptToDelete.value.id)
    aptToDelete.value = null
  } catch (e) {
    const status = e.response?.status
    const backendMessage = e.response?.data?.message
    if (status === 409) {
      deleteAptError.value = backendMessage?.includes('checklist')
        ? 'Este apartamento já possui uma vistoria/checklist vinculado e não pode ser excluído.'
        : (backendMessage || 'Não foi possível excluir: existem dados vinculados a este apartamento.')
    } else if (status === 404) {
      // Já não existe no back — aí sim é seguro remover da lista local.
      apartments.value = apartments.value.filter(a => a.id !== aptToDelete.value.id)
      aptToDelete.value = null
    } else {
      deleteAptError.value = backendMessage || 'Erro ao excluir apartamento. Tente novamente.'
    }
    console.error('Erro ao excluir apartamento na API:', e)
  } finally {
    deletingApt.value = false
  }
}

const selectedBuildingId = ref(null)

const apartmentsFiltered = computed(() =>
  selectedBuildingId.value
    ? apartments.value.filter(a => a.buildingId === selectedBuildingId.value)
    : apartments.value
)

const buildingInspectors = computed(() => {
  if (!selectedBuildingId.value) return []
  const inspectorIds = new Set(
    apartmentsFiltered.value.filter(a => a.currentInspectorId).map(a => a.currentInspectorId)
  )
  return Array.from(inspectorIds).map(id => {
    const u = users.value.find(user => user.id === id)
    return u ? u.name : 'Desconhecido'
  })
})

function goBackToBuildings() {
  selectedBuildingId.value = null
  activeTab.value = 'buildings'
}

function getBuildingName(buildingId) {
  const b = buildings.value.find(b => b.id === buildingId)
  return b ? b.name : '—'
}

onMounted(async () => {
  loadingBuildings.value = true; loadingApts.value = true
  try {
    const [b, a, t, u, v] = await Promise.all([
      getBuildings(), getApartments(), getApartmentTypes(), getUsers(), getVisits(),
    ])
    buildings.value = b; apartmentTypes.value = t; users.value = u
    allVisits.value = v || []

    // Popula o status de cada apartamento a partir das vistorias já
    // existentes, em vez de assumir "livre" pra tudo (GET /apartments não
    // retorna esse dado — só sabemos disso cruzando com GET /visits).
    apartments.value = (a || []).map((apt) => {
      const info = lookupVisitInfo(apt, v || [])
      return { ...apt, currentInspectorId: info.activeInspectorId || null }
    })
  } catch (e) {
    console.error('Erro ao carregar dados', e)
  } finally {
    loadingBuildings.value = false; loadingApts.value = false
  }
})
</script>

<style scoped>
.tabs { display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 16px; }
.tab-btn { padding: 12px 28px; border-radius: 30px; border: none; background: #46C7D5; color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.tab-btn.active { background: #00e5cc; color: #0b1120; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin-bottom: 28px; }

.btn-add, .btn-batch { display: inline-flex; align-items: center; gap: 8px; background: #00e5cc; color: #0b1120; border: none; border-radius: 30px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-add.active, .btn-batch.active { opacity: 0.7; }
.apt-actions { display: flex; gap: 16px; margin-bottom: 20px; }
.apartments-tab-intro { display: flex; align-items: center; gap: 10px; background: #e8f7ff; color: #0d47a1; border: 1px solid #b3e0ff; border-radius: 10px; padding: 14px 18px; font-size: 0.88rem; margin-bottom: 20px; }

.form-card { background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #eee; max-width: 860px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.form-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
input, select { width: 100%; padding: 14px 20px; border: none; border-radius: 30px; background: #e8e8e8; font-size: 0.95rem; outline: none; color: #333; appearance: none; box-sizing: border-box; }
input.invalid, select.invalid { border: 2px solid #c0392b; background: #fff3f0; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 4px; }
.field-error { font-size: 0.78rem; color: #c0392b; padding-left: 8px; }
.field-hint { font-size: 0.78rem; color: #888; padding-left: 8px; font-style: italic; }
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
.preview-tag { background: #46C7D5; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; }
.preview-tag.more { background: #00e5cc; color: #0b1120; }

/* Lista de empreendimentos */
.item-list { display: flex; flex-direction: column; gap: 10px; }
.item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 18px 24px;
  color: #1a1a2e;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}
.item-card:hover {
  border-color: #00e5cc;
  box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
  transform: translateY(-1px);
}
.building-card-info { display: flex; flex-direction: column; gap: 4px; }
.building-card-name { font-size: 1rem; font-weight: 600; color: #1a1a2e; }
.building-card-count { font-size: 0.8rem; color: #888; }
.building-card-right { display: flex; align-items: center; gap: 12px; }
.building-card-arrow { font-size: 1.2rem; color: #00c2a8; }
.btn-card-delete { background: none; border: none; color: #cbd5e0; cursor: pointer; font-size: 0.9rem; padding: 6px 8px; border-radius: 6px; transition: color 0.2s, background 0.2s; flex-shrink: 0; }
.btn-card-delete:hover { color: #c0392b; background: #fdecea; }

/* Botão voltar */
.back-action-container { margin-bottom: 12px; }
.btn-back { background: #e8e8e8; border: none; border-radius: 20px; padding: 8px 16px; font-size: 0.85rem; font-weight: bold; color: #333; cursor: pointer; }
.btn-back:hover { background: #d0d0d0; }

.building-header { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 16px; }
.building-header-top { display: flex; align-items: center; gap: 16px; }
.building-title { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; margin: 0; }
.apartments-tab-hint { font-size: 0.85rem; color: #666; margin: 6px 0 12px; }
.apartments-tab-hint a { color: #00897b; font-weight: 600; text-decoration: none; }
.apartments-tab-hint a:hover { text-decoration: underline; }
.building-header-info { display: flex; gap: 32px; font-size: 0.9rem; color: #444; background: #f4f4f4; padding: 14px 20px; border-radius: 8px; }
.text-muted { color: #999; font-style: italic; }

/* Tabela de apartamentos */
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 40px; padding: 8px 24px; font-size: 0.85rem; color: #555; font-weight: 600; margin-bottom: 8px; }
.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr 40px; background: #6b6b6b; border-radius: 10px; padding: 14px 24px; color: #fff; font-size: 0.9rem; margin-bottom: 8px; align-items: center; }
.apt-row-clickable-wrapper { display: contents; cursor: pointer; }
.apt-row-clickable-wrapper > span { cursor: pointer; }
.apt-row-clickable-wrapper > span:hover { opacity: 0.8; }

.apt-assign-inline { display: flex; justify-content: flex-start; }
.apt-assign-inline select { width: 100%; max-width: 160px; padding: 8px 16px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.5); background: transparent; font-size: 0.85rem; color: #fff; cursor: pointer; outline: none; appearance: none; transition: all 0.2s ease; }
.apt-assign-inline select:not(:disabled):hover { border-color: #00e5cc; color: #00e5cc; background: rgba(0,229,204,0.1); }
.apt-assign-inline select.is-assigned { background: #00e5cc; border: 1px solid #00e5cc; color: #0b1120; font-weight: bold; }
.apt-assign-inline select:disabled { opacity: 1; cursor: default; }
.apt-status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; white-space: nowrap; text-decoration: none; }
.apt-status-badge.finalized { background: rgba(0,229,204,0.15); color: #00e5cc; }
.apt-status-badge.active { background: rgba(255,255,255,0.1); color: #fff; }
.apt-status-badge.free { background: transparent; border: 1px dashed rgba(255,255,255,0.5); color: #fff; cursor: pointer; transition: all 0.2s ease; }
.apt-status-badge.free:hover { border-color: #00e5cc; color: #00e5cc; background: rgba(0,229,204,0.1); }

.apt-delete-cell { display: flex; align-items: center; justify-content: center; }
.btn-apt-delete { background: none; border: none; color: rgba(255,255,255,0.35); cursor: pointer; font-size: 0.85rem; padding: 6px; border-radius: 6px; transition: color 0.2s; }
.btn-apt-delete:hover { color: #f87171; }

/* Modais */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-confirm { background: #fff; border-radius: 16px; padding: 40px; width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.modal-icon { font-size: 2.5rem; color: #f99f56; }
.modal-confirm h3 { font-size: 1.1rem; color: #1a1a2e; margin: 0; }
.modal-confirm p { font-size: 0.88rem; color: #555; line-height: 1.5; margin: 0; }
.modal-error { background: #fdecea; color: #c0392b; border-radius: 8px; padding: 10px 14px; font-weight: 500; }
.modal-actions { display: flex; gap: 12px; }
.btn-confirm-delete { padding: 10px 24px; background: #c0392b; border: none; border-radius: 30px; color: #fff; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }

.checklist-overlay-state { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; color: #fff; font-size: 1rem; flex-direction: column; gap: 16px; }
.checklist-overlay-state.error { color: #fff; }
.checklist-overlay-state.error .btn-cancel { padding: 10px 28px; }
.empty { text-align: center; padding: 40px; color: #888; }
</style>
