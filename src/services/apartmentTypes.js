import api from './api.js'

export async function getApartmentTypes() {
  const response = await api.get('/apartment-types')
  return response.data
}

export async function getApartmentType(id) {
  const response = await api.get(`/apartment-types/${id}`)
  return response.data
}

export async function createApartmentType(data) {
  const response = await api.post('/apartment-types', data)
  return response.data
}

export async function updateApartmentType(id, data) {
  const response = await api.patch(`/apartment-types/${id}`, data)
  return response.data
}

export async function deleteApartmentType(id) {
  const response = await api.delete(`/apartment-types/${id}`)
  return response.data
}

export async function addRoom(typeId, name) {
  const response = await api.post(`/apartment-types/${typeId}/rooms`, { name })
  return response.data
}

export async function deleteRoom(typeId, roomId) {
  const response = await api.delete(`/apartment-types/${typeId}/rooms/${roomId}`)
  return response.data
}

export async function getRoomServices(typeId, roomId) {
  const response = await api.get(`/apartment-types/${typeId}/rooms/${roomId}/services`)
  return response.data
}

export async function addRoomService(typeId, roomId, serviceId) {
  const response = await api.post(`/apartment-types/${typeId}/rooms/${roomId}/services`, { serviceId })
  return response.data
}

export async function deleteRoomService(typeId, roomId, serviceId) {
  const response = await api.delete(`/apartment-types/${typeId}/rooms/${roomId}/services/${serviceId}`)
  return response.data
}
