// src/services/users.js
import api from './api.js'

export async function getUsers() {
  const response = await api.get('/users')
  return response.data
}

export async function createUser(data) {
  const response = await api.post('/users', data)
  return response.data
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`)
  return response.data
}
export async function updateUser(id, data) {
  const response = await api.patch(`/users/${id}`, data)
  return response.data
}
export async function resetUserPassword(id) {
  const response = await api.post(`/users/${id}/reset-password`)
  return response.data
}
