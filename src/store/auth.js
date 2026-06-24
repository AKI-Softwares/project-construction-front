import { defineStore } from 'pinia'

// Decodifica o payload de um JWT.
function decodeToken(token) {
  try {
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

    // IMPORTANTE: os getters abaixo leem de `state.token` (e não de
    // localStorage direto) para que o Vue/Pinia rastreie a dependência
    // reativa corretamente. Sem isso, o Vue calcula o valor uma vez, guarda
    // em cache, e nunca recalcula ao trocar de conta na mesma aba (só um F5
    // resolveria). Isso só funciona porque toda gravação de token agora
    // passa pela action setToken() abaixo, que atualiza state.token.

    // Replica a regra do back (checkPermission): isPlatformAdmin e
    // isCompanyAdmin têm acesso total; os demais precisam ter a permissão
    // explícita no array `permissions` do token.
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
