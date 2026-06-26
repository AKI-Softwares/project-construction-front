<template>
  <header class="header">
    <h1 class="titulo">{{ titulo }}</h1>

    <div class="perfil">
      <div class="perfil-info">
        <span class="perfil-nome">{{ user.name || '...' }}</span>
        <span class="perfil-cargo">{{ user.role?.name || '...' }}</span>
      </div>
      <div class="perfil-avatar">{{ initials }}</div>
    </div>
  </header>
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
    // fallback: lê do token JWT salvo no localStorage
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
  background-color: #0b1120; /* Ajustado para o azul escuro oficial, eliminando o roxo */
  border-bottom: 1px solid #1e293b; /* Linha sutil divisória para dar acabamento */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  
  /* Mudança crucial: removemos o position fixed e left fixo.
     Quem gerencia o espaço agora é o Flexbox do MainLayout, 
     evitando que as coisas fiquem embaixo do header ou sumam. */
  width: 100%; 
  box-sizing: border-box;
}

.titulo { 
  color: #00d5cc; /* Tom ciano limpo alinhado com a marca */
  font-size: 1.4rem; 
  font-weight: 600; 
}

.perfil { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  cursor: pointer; 
}

.perfil-info { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
}

.perfil-nome { 
  color: #ffffff; 
  font-size: 0.9rem; 
  font-weight: 600; 
}

.perfil-cargo { 
  color: #9ca3af; /* Cinza claro com boa leitura sobre o fundo escuro */
  font-size: 0.75rem; 
}

.perfil-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #00d5cc; /* Ciano de destaque */
  color: #0b1120; /* Texto escuro por dentro para legibilidade extrema */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}
</style>
