import api from './api.js'
import { cachedFetch, invalidateCache } from '../utils/cache.js'

function filtersKey(prefix, filters) {
  const sorted = Object.keys(filters).sort().map((k) => `${k}=${filters[k]}`).join('&')
  return `${prefix}:${sorted}`
}

// Listagem geral de visitas, com filtros opcionais suportados pelo back:
// status, inspectorId, buildingId, from, to, type ('INITIAL' | 'REINSPECTION').
// Cache curto (15s) por combinação de filtros — a tela de Vistorias é
// consultada com frequência, mas os dados mudam rápido durante o uso.
export async function getVisits(filters = {}) {
  return cachedFetch(filtersKey('visits:list', filters), async () => {
    const response = await api.get('/visits', { params: filters })
    return response.data
  }, 15_000)
}

export async function getVisit(id) {
  const response = await api.get(`/visits/${id}`)
  return response.data
}

// Vistoria inicial — o back atribui o inspetor automaticamente (round-robin).
// NÃO enviar inspectorId: o schema é z.object({}) e não aceita nenhum campo.
export async function createVisit(checklistId) {
  const response = await api.post(`/checklists/${checklistId}/visits`, {})
  invalidateCache('visits:')
  return response.data
}

// Re-inspeções — GET /visits?type=REINSPECTION, aceitando os mesmos filtros
// de getVisits (status, inspectorId, buildingId, from, to). Todas as
// re-inspeções já nascem pré-atribuídas na criação: o endpoint antigo
// GET /visits/available-reinspections foi descontinuado e não deve mais
// ser usado (tela "Aguardando atribuição" removida).
export async function getReinspections(filters = {}) {
  return cachedFetch(filtersKey('visits:reinsp', { ...filters, type: 'REINSPECTION' }), async () => {
    const response = await api.get('/visits', { params: { ...filters, type: 'REINSPECTION' } })
    return response.data
  }, 15_000)
}

// scheduledFor é opcional — se omitido, envia payload vazio.
export async function createReinspection(visitId, { scheduledFor } = {}) {
  const body = scheduledFor ? { scheduledFor } : {}
  const response = await api.post(`/visits/${visitId}/reinspection`, body)
  invalidateCache('visits:')
  return response.data
}

// Troca manual de inspetor. O back responde 400 se a visita já estiver
// FINALIZED, e 422 se o usuário-alvo não tiver a permissão 'visits:perform'.
// A UI deve desabilitar esta ação para visitas FINALIZED e filtrar o
// dropdown de inspetores usando utils/permissions.js antes de chamar isto.
export async function assignInspectorToVisit(visitId, inspectorId) {
  const response = await api.patch(`/visits/${visitId}/inspector`, {
    inspectorId: Number(inspectorId),
  })
  invalidateCache('visits:')
  return response.data
}
