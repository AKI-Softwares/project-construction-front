import { defineStore } from 'pinia'

// Decodifica o payload do JWT salvo no localStorage.
// É a mesma lógica usada em services/api.js — lemos direto do localStorage
// (e não do state da store) porque o login grava o token via localStorage.setItem
// sem passar pela store, então o state.token pode ficar desatualizado.
function getTokenPayload() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,

    // Replica a regra do back (checkPermission): isPlatformAdmin e
    // isCompanyAdmin têm acesso total; os demais precisam ter a permissão
    // explícita no array `permissions` do token.
    hasPermission: () => (action) => {
      const payload = getTokenPayload()
      if (!payload) return false
      if (payload.isPlatformAdmin) return true
      if (payload.isCompanyAdmin) return true
      return Array.isArray(payload.permissions) && payload.permissions.includes(action)
    },

    isPlatformAdmin: () => {
      const payload = getTokenPayload()
      return !!payload?.isPlatformAdmin
    },
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})
