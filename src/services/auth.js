// src/services/auth.js
import api from './api.js'

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function me() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token, newPassword) {
  const response = await api.post('/auth/reset-password', { token, newPassword })
  return response.data
}

export async function changePassword(currentPassword, newPassword) {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword })
  return response.data
}