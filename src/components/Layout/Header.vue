<template>
  <div class="header">
    <div class="header-left">
      <img 
        src="../../assets/logo_check_hotizontal.png" 
        alt="CheckObra Logo" 
        class="header-logo" 
      />
      <h1 class="titulo">{{ titulo }}</h1>
    </div>

    <div class="perfil">
      <div class="perfil-info">
        <span class="perfil-nome">{{ user.name || '...' }}</span>
        <span class="perfil-cargo">{{ user.role?.name || '...' }}</span>
      </div>
      <div class="perfil-avatar">{{ initials }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { me } from '../../services/auth.js'

defineProps({
  titulo: { type: String, default: 'Dashboard' }
})

const user = ref({ name: '', role: null })

const initials = computed(() => {
  if (!user.value.name) return '?'
  return user.value.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

onMounted(async () => {
  try {
    user.value = await me()
  } catch (e) {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        user.value = { name: payload.name || 'Usuário', role: { name: payload.role || '' } }
      }
    } catch {}
  }
})
</script>

<style scoped>
.header {
  height: 60px;
  background-color: #46C7D5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px 0 0;
  position: fixed;
  top: 0;
  left: 60px;
  right: 0;
  z-index: 100;
  box-sizing: border-box;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-logo {
  height: 42px;
  width: auto;
  object-fit: contain;
  padding-left: 12px;
}
.titulo { color: #00e5cc; font-size: 1.4rem; font-weight: 600; }
.perfil { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.perfil-info { display: flex; flex-direction: column; align-items: flex-end; }
.perfil-nome { color: #ffffff; font-size: 0.9rem; font-weight: 600; }
.perfil-cargo { color: rgba(255,255,255,0.5); font-size: 0.75rem; }
.perfil-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #00e5cc;
  color: #46C7D5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}
</style>
