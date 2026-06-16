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
