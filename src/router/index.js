// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login/index.vue'
import Dashboard from '../pages/Dashboard/index.vue'
import Buildings from '../pages/Buildings/index.vue'
import Register from '../pages/Register/index.vue'
import Team from '../pages/Team/index.vue'
import TeamRegister from '../pages/Team/Register.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/buildings/:id', component: Buildings, meta: { requiresAuth: true } },
  { path: '/cadastro', component: Register, meta: { requiresAuth: true } },
  { path: '/team', component: Team, meta: { requiresAuth: true } },
  { path: '/team/register', component: TeamRegister, meta: { requiresAuth: true } },
  { path: '/equipe', redirect: '/team' },
  {
    path: '/calendario',
    component: () => import('../pages/EmConstrucao/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    component: () => import('../pages/EmConstrucao/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configuracoes',
    component: () => import('../pages/EmConstrucao/index.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

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