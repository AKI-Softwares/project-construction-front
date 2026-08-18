import api from './api.js'
import { cachedFetch, invalidateCache } from '../utils/cache.js'

// Lista de empreendimentos muda pouco — cache de 2 minutos evita refetch
// a cada troca de aba/navegação na tela de Empreendimentos.
export async function getBuildings() {
  return cachedFetch('buildings:list', async () => {
    const response = await api.get('/buildings')
    return response.data
  }, 120_000)
}

export async function getBuilding(id) {
  const response = await api.get(`/buildings/${id}`)
  return response.data
}

export async function createBuilding(data) {
  const response = await api.post('/buildings', data)
  invalidateCache('buildings:')
  return response.data
}

export async function updateBuilding(id, data) {
  const response = await api.patch(`/buildings/${id}`, data)
  invalidateCache('buildings:')
  return response.data
}

export async function deleteBuilding(id) {
  const response = await api.delete(`/buildings/${id}`)
  invalidateCache('buildings:')
  return response.data
}
