import api from './api.js'

export async function getVisits() {
  const response = await api.get('/visits')
  return response.data
}

export async function getVisit(id) {
  const response = await api.get(`/visits/${id}`)
  return response.data
}

export async function createVisit(checklistId, inspectorId) {
  const response = await api.post(`/checklists/${checklistId}/visits`, {
    inspectorId: Number(inspectorId)
  })
  return response.data
}

// ─── Re-inspeções (usadas pela tela W-15) ──────────────────────
// O back não expõe uma listagem geral de visitas por empresa (GET /visits
// sem filtro de "mine" não existe — ver observações do guia de telas).
// O único endpoint de visão "gestor" disponível hoje é este, que retorna
// apenas re-inspeções SEM inspetor atribuído (NOT_STARTED/ONGOING + inspectorId null).
export async function getAvailableReinspections() {
  const response = await api.get('/visits/available-reinspections')
  return response.data
}

export async function createReinspection(visitId, data = {}) {
  const response = await api.post(`/visits/${visitId}/reinspection`, data)
  return response.data
}

export async function assignInspectorToVisit(visitId, inspectorId) {
  const response = await api.patch(`/visits/${visitId}/inspector`, { inspectorId })
  return response.data
}
