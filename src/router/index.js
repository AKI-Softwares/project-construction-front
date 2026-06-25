import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login/index.vue'
import Dashboard from '../pages/Dashboard/index.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/forgot-password', component: () => import('../pages/ForgotPassword/index.vue'), meta: { public: true } },
  { path: '/forgot-password/sent', component: () => import('../pages/ForgotPassword/Sent.vue'), meta: { public: true } },
  { path: '/reset-password', component: () => import('../pages/ResetPassword/index.vue'), meta: { public: true } },
  { path: '/reset-password/success', component: () => import('../pages/ResetPassword/Success.vue'), meta: { public: true } },
  { path: '/register', component: () => import('../pages/Register/index.vue'), meta: { public: true } },
  { path: '/change-password', component: () => import('../pages/ChangePassword/index.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/buildings', component: () => import('../pages/Buildings/index.vue'), meta: { requiresAuth: true } },
  { path: '/buildings/:id', component: () => import('../pages/Buildings/index.vue'), meta: { requiresAuth: true } },
  { path: '/apartment-types', component: () => import('../pages/ApartmentTypes/index.vue'), meta: { requiresAuth: true } },
  { path: '/services', component: () => import('../pages/Services/index.vue'), meta: { requiresAuth: true } },
  { path: '/reinspections', component: () => import('../pages/Reinspections/index.vue'), meta: { requiresAuth: true } },
  { path: '/visits', component: () => import('../pages/Visits/index.vue'), meta: { requiresAuth: true } },
  { path: '/visits/:id', component: () => import('../pages/Visits/Detail.vue'), meta: { requiresAuth: true } },
  { path: '/non-conformities', component: () => import('../pages/NonConformities/index.vue'), meta: { requiresAuth: true } },
  { path: '/platform/companies', component: () => import('../pages/Platform/Companies/index.vue'), meta: { requiresAuth: true } },
  { path: '/platform/companies/:id', component: () => import('../pages/Platform/CompanyDetail/index.vue'), meta: { requiresAuth: true } },
  { path: '/platform/role-templates', component: () => import('../pages/Platform/RoleTemplates/index.vue'), meta: { requiresAuth: true } },
  { path: '/platform/catalog', component: () => import('../pages/Platform/Catalog/index.vue'), meta: { requiresAuth: true } },
  { path: '/platform/dashboard', component: () => import('../pages/Platform/Dashboard/index.vue'), meta: { requiresAuth: true } },
  { path: '/team/register', component: () => import('../pages/Team/Register.vue'), meta: { requiresAuth: true } },
  { path: '/team', component: () => import('../pages/Team/index.vue'), meta: { requiresAuth: true } },
  { path: '/equipe', redirect: '/team' },
  
  // Atualizado: Rota mapeada para o novo componente de Relatório PEO 19
  { path: '/relatorios', component: () => import('../pages/Visits/Report.vue'), meta: { requiresAuth: true } },
  
  { path: '/configuracoes', component: () => import('../pages/Settings/index.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Função utilitária para decodificar o payload do JWT com segurança
function isPasswordChangeRequired(token) {
  if (!token) return false
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    return !!payload.mustChangePassword
  } catch (error) {
    console.error('Erro ao decodificar JWT Payload:', error)
    return false
  }
}

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  // 1. Bloqueio de rota privada se não houver token
  if (to.meta.requiresAuth && !token) return { path: '/login' }

  // 2. Se houver token, verifica a flag de troca de senha obrigatória
  if (token) {
    const mustChange = isPasswordChangeRequired(token)
    
    // Se a troca for obrigatória e o usuário tentar ir para outra rota que não seja /change-password
    if (mustChange && to.path !== '/change-password') {
      return { path: '/change-password' }
    }
    
    // Se o usuário já trocou a senha (ou não precisa) e tenta forçar entrada na tela de login
    if (to.path === '/login' && !mustChange) {
      return { path: '/dashboard' }
    }
  }

  return true
})

export default router
