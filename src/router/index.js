import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login/index.vue'
import Dashboard from '../pages/Dashboard/index.vue'
import Buildings from '../pages/Buildings/index.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { public: true } },

  // Password flows — public
  { path: '/forgot-password', component: () => import('../pages/ForgotPassword/index.vue'), meta: { public: true } },
  { path: '/forgot-password/sent', component: () => import('../pages/ForgotPassword/Sent.vue'), meta: { public: true } },
  { path: '/reset-password', component: () => import('../pages/ResetPassword/index.vue'), meta: { public: true } },
  { path: '/reset-password/success', component: () => import('../pages/ResetPassword/Success.vue'), meta: { public: true } },

  // Change password — requires auth (mustChangePassword flow)
  { path: '/change-password', component: () => import('../pages/ChangePassword/index.vue'), meta: { requiresAuth: true } },

  // App routes
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/buildings/:id', component: Buildings, meta: { requiresAuth: true } },
  // rotas ainda não feitas — mostram tela em construção
  { path: '/cadastro', component: () => import('../pages/EmConstrucao/index.vue'), meta: { requiresAuth: true } },
  { path: '/calendario', component: () => import('../pages/EmConstrucao/index.vue'), meta: { requiresAuth: true } },
  { path: '/equipe', component: () => import('../pages/EmConstrucao/index.vue'), meta: { requiresAuth: true } },
  { path: '/relatorios', component: () => import('../pages/EmConstrucao/index.vue'), meta: { requiresAuth: true } },
  { path: '/configuracoes', component: () => import('../pages/EmConstrucao/index.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { path: '/login' }
  }
  if (to.path === '/login' && token) {
    return { path: '/dashboard' }
  }
  return true
})

export default router
