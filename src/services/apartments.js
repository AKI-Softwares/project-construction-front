import api from './api.js'
import { mockApartments } from '../mocks/buildings.js'

const USE_MOCK = false

export async function getApartments(buildingId = null) {
  const url = buildingId ? `/apartments?buildingId=${buildingId}` : '/apartments'
  const { data } = await api.get(url)
  return data
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

export async function getApartmentTypes() {
  try {
    const response = await api.get('/apartment-types')
    return response.data
  } catch (error) {
    return []
  }
}
