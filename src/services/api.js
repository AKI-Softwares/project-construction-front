// src/services/api.js
import axios from 'axios'

function getTokenPayload() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

// Sistema de toast via evento global — sem dependência externa
function showToast(message, type = 'error') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  const payload = getTokenPayload()

  // Usuário comum — usa o companyId do próprio JWT
  if (payload?.companyId) {
    config.headers['X-Company-Id'] = payload.companyId
  }
  // Platform Admin — usa a empresa ativa selecionada manualmente
  else if (payload?.isPlatformAdmin) {
    const activeCompanyId = localStorage.getItem('activeCompanyId')
    if (activeCompanyId) {
      config.headers['X-Company-Id'] = activeCompanyId
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sem resposta = sem internet ou timeout
    if (!error.response) {
      showToast('Sem conexão com o servidor. Verifique sua internet.')
      return Promise.reject(error)
    }

    const status = error.response.status

    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      showToast('Você não tem permissão para realizar esta ação.')
      return Promise.reject(error)
    }

    if (status >= 500) {
      showToast('Erro interno no servidor. Tente novamente em instantes.')
      return Promise.reject(error)
    }

    // 400, 404, etc — deixa o componente tratar
    return Promise.reject(error)
  }
)

export default api
