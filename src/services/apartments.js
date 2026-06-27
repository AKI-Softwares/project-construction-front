import api from './api.js'
import { mockApartments } from '../mocks/buildings.js'

const USE_MOCK = false

export async function getApartments(buildingId) {
  if (USE_MOCK) return mockApartments
  const params = buildingId ? { buildingId } : {}
  const response = await api.get('/apartments', { params })
  return response.data
}

export async function getApartment(id) {
  if (USE_MOCK) return mockApartments.find(a => a.id === Number(id))
  const response = await api.get(`/apartments/${id}`)
  return response.data
}

export async function createApartment(data) {
  const response = await api.post('/apartments', data)
  return response.data
}
