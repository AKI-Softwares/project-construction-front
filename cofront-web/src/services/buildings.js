import api from './api.js'
import { mockBuildings } from '../mocks/buildings.js'

const USE_MOCK = true // muda para false quando o CORS liberar

export async function getBuildings() {
  if (USE_MOCK) return mockBuildings
  const response = await api.get('/buildings')
  return response.data
}

export async function getBuilding(id) {
  if (USE_MOCK) return mockBuildings.find(b => b.id === Number(id))
  const response = await api.get(`/buildings/${id}`)
  return response.data
}