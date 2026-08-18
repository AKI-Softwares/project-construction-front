import api from './api.js'

export async function getServices(category) {
  const params = category ? { category } : {}
  const response = await api.get('/services', { params })
  return response.data
}

export async function createService(data) {
  const response = await api.post('/services', data)
  return response.data
}

export async function updateService(id, data) {
  const response = await api.patch(`/services/${id}`, data)
  return response.data
}

export async function deleteService(id) {
  const response = await api.delete(`/services/${id}`)
  return response.data
}
