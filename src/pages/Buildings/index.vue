<template>
  <MainLayout titulo="Empreendimentos">

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'buildings' }]" @click="activeTab = 'buildings'">
        Empreendimentos
      </button>
      <button :class="['tab-btn', { active: activeTab === 'apartments' }]" @click="activeTab = 'apartments'">
        Apartamentos
      </button>
    </div>

    <hr class="divider" />

    <div v-if="activeTab === 'buildings'">
      <button v-if="authStore.hasPermission('buildings:create')" class="btn-add" @click="showBuildingForm = !showBuildingForm">
        + Adicionar empreendimento
      </button>

      <div v-if="showBuildingForm" class="form-card">
        <h3 class="form-title">Novo Empreendimento</h3>
        <div v-if="buildingSuccess" class="alert success"><FontAwesomeIcon :icon="['fas', 'circle-check']" /> Empreendimento cadastrado!</div>
        <div v-if="buildingError" class="alert error"><FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ buildingError }}</div>
        
        <input v-model="buildingForm.name" type="text" placeholder="Nome do Empreendimento" :class="{ invalid: buildingErrors.name }" />
        <span v-if="buildingErrors.name" class="field-error">{{ buildingErrors.name }}</span>
        
        <input v-model="buildingForm.address" type="text" placeholder="Endereço" :class="{ invalid: buildingErrors.address }" />
        <span v-if="buildingErrors.address" class="field-error">{{ buildingErrors.address }}</span>

        <div class="form-actions">
          <button class="btn-save" :disabled="savingBuilding" @click="saveBuilding">Salvar</button>
          <button class="btn-cancel" @click="cancelBuilding">Cancelar</button>
        </div>
      </div>

      <div class="item-list">
        <div v-for="building in buildings" :key="building.id" class="item-card" @click="selectBuilding(building)">
          <div class="building-card-info">
            <span class="building-card-name">{{ building.name }}</span>
            <span class="building-card-count">
              {{ apartments.filter(a => a.buildingId === building.id).length }} apartamento(s)
            </span>
          </div>
          <span class="building-card-arrow">→</span>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'apartments'">
      <div v-if="!aptMode">
        <div v-if="selectedBuildingId" class="filter-active">
          <FontAwesomeIcon :icon="['fas', 'filter']" />
          Filtrando por: <strong>{{ buildings.find(b => b.id === selectedBuildingId)?.name }}</strong>
          <button class="btn-clear-filter" @click="selectedBuildingId = null">✕ Ver todos</button>
        </div>

        <div class="apt-table-header">
          <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador Atribuído</span>
        </div>

        <div class="item-list">
          <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
            <div class="apt-click-area" @click="openChecklist(apt)">
              <span>{{ getBuildingName(apt.buildingId) }}</span>
              <span>{{ apt.identifier }}</span>
              <span>{{ apt.block || '—' }}</span>
              <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
            </div>

            <div class="apt-assign-inline">
              <select :value="apt.currentInspectorId || ''" @change="assignInline(apt, $event.target.value)">
                <option value="">Não atribuído</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ChecklistModal 
      v-if="selectedChecklist" 
      :checklist="selectedChecklist" 
      :available-users="users"
      @fechar="selectedChecklist = null" 
    />

  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import ChecklistModal from '../../components/Layout/ChecklistModal.vue'
import { getBuildings, createBuilding } from '../../services/buildings.js'
import { getApartments, createApartment } from '../../services/apartments.js'
import { getChecklistByApartment } from '../../services/checklists.js'
import { createVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'
import { groupChecklistByRoom } from '../../utils/checklist.js'
import { useAuthStore } from '../../store/auth.js'
import { getApartmentTypes } from '../../services/apartmentTypes.js'

const authStore = useAuthStore()
const activeTab = ref('buildings')
const buildings = ref([])
const apartments = ref([])
const apartmentTypes = ref([])
const users = ref([])

const selectedChecklist = ref(null)

// Função de Atribuição Direta/Rápida pela linha da tabela
async function assignInline(apt, userId) {
  if (!userId) return
  try {
    // Busca o checklist do apartamento para ter o ID do checklist
    const chk = await getChecklistByApartment(apt.id)
    if (chk && chk.id) {
      await createVisit(chk.id, userId)
      apt.currentInspectorId = userId // atualiza o estado visual
      alert('Vistoriador atribuído com sucesso para este apartamento!')
    }
  } catch (e) {
    alert('Erro ao atribuir vistoriador: ' + (e.response?.data?.message || e.message))
  }
}

async function openChecklist(apt) {
  try {
    let detail = await getChecklistByApartment(apt.id)
    if (!detail) return
    // Injeta referências extras para o modal controlar o estado interno
    detail.apartmentId = apt.id 
    selectedChecklist.value = groupChecklistByRoom(detail)
  } catch (e) {
    console.error(e)
  }
}

// ... Mantidas as lógicas de validação, filtros, cadastros individuais e em lote ...

onMounted(async () => {
  try {
    const [b, a, t, u] = await Promise.all([getBuildings(), getApartments(), getApartmentTypes(), getUsers()])
    buildings.value = b
    apartments.value = a
    apartmentTypes.value = t
    users.value = u
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>

  <!-- Dentro do seu v-for de apartamentos -->
<div v-for="apt in apartmentsFiltered" :key="apt.id" class="sua-classe-original-de-linha">
  
  <!-- Sua área de clique original para abrir o checklist -->
  <div @click="openChecklist(apt)">
    <span>{{ getBuildingName(apt.buildingId) }} - Apt {{ apt.identifier }}</span>
  </div>

  <!-- APENAS ESTA INCLUSÃO: O seletor rápido sem alterar seu estilo -->
  <select 
    :value="apt.currentInspectorId || ''" 
    @change="assignInline(apt, $event.target.value)"
    style="margin-left: 10px; padding: 4px; border-radius: 4px;"
  >
    <option value="">Sem vistoriador</option>
    <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
  </select>

</div>
/* Redefinição do grid de colunas para abrir espaço para o seletor inline */
.apt-table-header, .apt-row { 
  display: grid; 
  grid-template-columns: 1.5fr 1fr 1fr 1fr 2fr; 
  align-items: center;
  gap: 12px;
}
.apt-click-area {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  grid-column: span 4;
  cursor: pointer;
  height: 100%;
  align-items: center;
}
.apt-row { background: #6b6b6b; border-radius: 10px; padding: 12px 24px; color: #fff; margin-bottom: 8px; }
.apt-assign-inline select { padding: 8px 16px; background: #fff; color: #333; border-radius: 20px; font-size: 0.85rem; }
/* ... Seus estilos base ... */
</style>
