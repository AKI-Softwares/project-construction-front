import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login/index.vue'
import Dashboard from '../pages/Dashboard/index.vue'
import Buildings from '../pages/Buildings/index.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { public: true } },
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
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router