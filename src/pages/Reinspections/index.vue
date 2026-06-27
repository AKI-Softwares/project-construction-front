<template>
  <MainLayout titulo="Re-inspeções">

    <div class="info-banner">
      <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" class="info-icon" />
      <div>
        <strong>Aguardando atribuição de inspetor</strong>
        <p>
          Esta lista mostra apenas re-inspeções ainda sem inspetor designado.
          A API atual não possui um endpoint para visualizar re-inspeções já
          em andamento ou finalizadas por toda a empresa — apenas o próprio
          inspetor consegue ver as suas (no app mobile).
        </p>
      </div>
    </div>

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="loadError" class="state error">{{ loadError }}</div>

    <div v-if="!loading && !loadError">
      <div class="table-header">
        <span>Empreendimento</span>
        <span>Apartamento</span>
        <span>Bloco / Andar</span>
        <span>Agendada para</span>
        <span>Criada em</span>
        <span>Atribuir Inspetor</span>
      </div>

      <div v-for="visit in reinspections" :key="visit.id" class="table-row">
        <span class="building-name">{{ visit.apartment?.building?.name || '—' }}</span>
        <span>{{ visit.apartment?.identifier || '—' }}</span>
        <span>{{ formatBlockFloor(visit.apartment) }}</span>
        <span>
          <span v-if="visit.scheduledFor" :class="{ 'overdue': isOverdue(visit.scheduledFor) }">
            {{ formatDate(visit.scheduledFor) }}
            <span v-if="isOverdue(visit.scheduledFor)" class="overdue-tag">Atrasada</span>
          </span>
          <span v-else class="no-date">Sem data definida</span>
        </span>
        <span class="created-at">{{ formatDate(visit.createdAt) }}</span>
        
        <div class="reassign-inline">
          <select :value="visit.inspectorId || ''" @change="assignReinspection(visit, $event.target.value)">
            <option value="">Selecionar...</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="reinspections.length === 0" class="state">
        Nenhuma re-inspeção aguardando inspetor no momento.
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getAvailableReinspections, assignInspectorToVisit } from '../../services/visits.js'
import { getUsers } from '../../services/users.js'

const reinspections = ref([])
const users = ref([])
const loading = ref(true)
const loadError = ref('')

function formatBlockFloor(apt) {
  if (!apt) return '—'
  const parts = []
  if (apt.block) parts.push(`Bloco ${apt.block}`)
  if (apt.floor) parts.push(`${apt.floor}º andar`)
  return parts.length ? parts.join(' · ') : '—'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function isOverdue(date) {
  if (!date) return false
  return new Date(date) < new Date()
}

async function assignReinspection(visit, userId) {
  if (!userId) return
  try {
    await assignInspectorToVisit(visit.id, Number(userId))
    reinspections.value = reinspections.value.filter(r => r.id !== visit.id)
  } catch (e) {
    console.error('Erro ao atribuir inspetor:', e)
    alert('Erro ao atribuir inspetor: ' + (e.response?.data?.message || e.message))
  }
}

onMounted(async () => {
  try {
    const [reinsps, listaUsers] = await Promise.all([
      getAvailableReinspections(),
      getUsers()
    ])
    reinspections.value = reinsps
    users.value = listaUsers
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Erro ao carregar dados de re-inspeção.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.info-banner {
  display: flex;
  gap: 14px;
  background: #fff8e1;
  border: 1px solid #f5d77a;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
  font-size: 0.85rem;
  color: #333;
}
.info-icon { color: #f5a623; font-size: 1.2rem; margin-top: 2px; flex-shrink: 0; }
.info-banner strong { display: block; margin-bottom: 4px; color: #1a1a2e; }
.info-banner p { margin: 0; line-height: 1.5; color: #555; }
.state { text-align: center; padding: 40px; color: #888; }
.error { color: red; }
.table-header { display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1.2fr 1.8fr; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 2px solid #eee; margin-bottom: 4px; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1.2fr 1.8fr; padding: 14px 20px; font-size: 0.88rem; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; background: #fff; border-radius: 8px; margin-bottom: 4px; }
.building-name { font-weight: 600; color: #1a1a2e; }
.created-at { color: #888; font-size: 0.82rem; }
.no-date { color: #bbb; font-style: italic; }
.overdue { color: #c0392b; font-weight: 600; }
.overdue-tag { background: #fff3f0; color: #c0392b; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; margin-left: 6px; font-weight: 700; }

.reassign-inline select {
  width: 100%;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  font-size: 0.82rem;
  color: #333;
  cursor: pointer;
  outline: none;
}
</style>
