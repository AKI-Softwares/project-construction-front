import { defineStore } from 'pinia'

function decodeToken(token) {
  try {
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('token') || null
    const payload = decodeToken(token)
    return {
      token,
      user: payload ? { name: payload.name, email: payload.email, id: payload.sub ?? payload.id } : null,
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (action) => {
      const payload = decodeToken(state.token)
      if (!payload) return false
      if (payload.isPlatformAdmin) return true
      if (payload.isCompanyAdmin) return true
      return Array.isArray(payload.permissions) && payload.permissions.includes(action)
    },
    isPlatformAdmin: (state) => {
      const payload = decodeToken(state.token)
      return !!payload?.isPlatformAdmin
    },
    isCompanyAdmin: (state) => {
      const payload = decodeToken(state.token)
      return !!payload?.isCompanyAdmin
    },
    companyId: (state) => {
      const payload = decodeToken(state.token)
      return payload?.companyId ?? null
    },
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      const payload = decodeToken(token)
      this.user = payload ? { name: payload.name, email: payload.email, id: payload.sub ?? payload.id } : null
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})
