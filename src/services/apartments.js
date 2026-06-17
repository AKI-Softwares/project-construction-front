import api from './api.js'
import { mockApartments } from '../mocks/buildings.js'

const USE_MOCK = false

export async function getApartments(buildingId) {
  if (USE_MOCK) return mockApartments
  const response = await api.get(`/apartments?buildingId=${buildingId}`)
  return response.data
}

export async function getApartment(id) {
  if (USE_MOCK) return mockApartments.find(a => a.id === Number(id))
  const response = await api.get(`/apartments/${id}`)
  return response.data
}

// Funções que a página Buildings/index.vue está exigindo:
export async function createApartment(data) {
  const response = await api.post('/apartments', data)
  return response.data
}

export async function getApartmentTypes() {
  // Retorna array vazio ou endpoint correto se houver, para não quebrar a página
  try {
    const response = await api.get('/apartment-types')
    return response.data
  } catch (error) {
    return []
  }
}
