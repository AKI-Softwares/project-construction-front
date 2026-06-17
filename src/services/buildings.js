import api from './api.js'

export async function getBuildings() {
  const response = await api.get('/buildings')
  return response.data
}

export async function getBuilding(id) {
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
