// src/services/auth.js
import api from './api.js'

const USE_MOCK = false

// JWT falso — payload com usuário admin mockado
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb2NrLXVzZXItaWQiLCJjb21wYW55SWQiOjEsImlzUGxhdGZvcm1BZG1pbiI6ZmFsc2UsImlzQ29tcGFueUFkbWluIjp0cnVlLCJyb2xlSWQiOjEsInBlcm1pc3Npb25zIjpbXSwibXVzdENoYW5nZVBhc3N3b3JkIjpmYWxzZX0.mock-signature'

const MOCK_ME = {
  name: 'Usuário Teste',
  role: 'Administrador',
}

export async function login(email, password) {
  if (USE_MOCK) {
    return { token: MOCK_TOKEN }
  }
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function me() {
  if (USE_MOCK) {
    return MOCK_ME
  }
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