import api from './api.js'

// Todos os endpoints de /analytics exigem isCompanyAdmin no back
// (requireCompanyAdmin). Sem período explícito, o back assume os últimos 30 dias.
//
// silentErrors: true — o Dashboard já trata o 403 graciosamente (esconde
// os cards quando quem está logado não é admin), então não precisamos do
// toast genérico de "sem permissão" por cima disso.

export async function getOverview(params = {}) {
  const response = await api.get('/analytics/overview', { params, silentErrors: true })
  return response.data
}

export async function getBuildingRanking(params = {}) {
  const response = await api.get('/analytics/ranking/buildings', { params, silentErrors: true })
  return response.data
}

export async function getQuality(params = {}) {
  const response = await api.get('/analytics/quality', { params, silentErrors: true })
  return response.data
}
