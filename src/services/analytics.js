import api from './api.js'

// Todos os endpoints de /analytics exigem isCompanyAdmin no back
// (requireCompanyAdmin). Sem período explícito, o back assume os últimos 30 dias.

export async function getOverview(params = {}) {
  const response = await api.get('/analytics/overview', { params })
  return response.data
}

export async function getBuildingRanking(params = {}) {
  const response = await api.get('/analytics/ranking/buildings', { params })
  return response.data
}

export async function getQuality(params = {}) {
  const response = await api.get('/analytics/quality', { params })
  return response.data
}
