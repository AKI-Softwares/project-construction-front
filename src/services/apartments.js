// src/services/apartments.js
import api from './api.js'
import { mockApartments } from '../mocks/buildings.js'

const USE_MOCK = false

export async function getApartments(buildingId) {
  if (USE_MOCK) {
    if (buildingId) return mockApartments.filter(a => a.buildingId === Number(buildingId))
    return mockApartments
  }
  const url = buildingId ? `/apartments?buildingId=${buildingId}` : '/apartments'
  const response = await api.get(url)
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

export async function updateApartment(id, data) {
  const response = await api.patch(`/apartments/${id}`, data)
  return response.data
}

export async function deleteApartment(id) {
  const response = await api.delete(`/apartments/${id}`)
  return response.data
}