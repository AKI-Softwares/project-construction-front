import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login/index.vue'
import Dashboard from '../pages/Dashboard/index.vue'
import Buildings from '../pages/Buildings/index.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/buildings/:id', component: Buildings },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})