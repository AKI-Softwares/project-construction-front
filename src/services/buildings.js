// src/services/buildings.js
import api from './api.js'
import { mockBuildings } from '../mocks/buildings.js'

const USE_MOCK = false

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

export async function createBuilding(data) {
  const response = await api.post('/buildings', data)
  return response.data
}

export async function updateBuilding(id, data) {
  const response = await api.patch(`/buildings/${id}`, data)
  return response.data
}

export async function deleteBuilding(id) {
  const response = await api.delete(`/buildings/${id}`)
  return response.data
}