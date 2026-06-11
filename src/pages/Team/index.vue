<template>
  <MainLayout titulo="Equipe">

    <div class="team-header">
      <button class="btn-register" @click="goToRegister">
        <FontAwesomeIcon :icon="['fas', 'user-plus']" />
        Cadastrar usuário
      </button>
    </div>

    <hr class="divider" />

    <!-- Loading -->
    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <!-- User list -->
    <div v-if="!loading && !error" class="user-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card"
      >
        <FontAwesomeIcon :icon="['fas', 'user']" class="user-icon" />
        <span class="user-name">{{ user.name }}</span>
        <span class="user-separator">-</span>
        <span class="user-role">{{ user.role?.name || '—' }}</span>
      </div>

      <div v-if="users.length === 0" class="state">
        Nenhum usuário cadastrado.
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getUsers } from '../../services/users.js'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const users = ref([])

function goToRegister() {
  router.push('/team/register')
}

onMounted(async () => {
  try {
    users.value = await getUsers()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error loading users.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.team-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d0d2b;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-register:hover {
  background: #1a1a4e;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 32px;
}

.state {
  text-align: center;
  padding: 40px;
  color: #555;
}
.error { color: red; }

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #6b6b6b;
  border-radius: 12px;
  padding: 20px 24px;
  color: #fff;
  font-size: 1rem;
}

.user-icon {
  font-size: 1.3rem;
  color: #00e5cc;
}

.user-name {
  font-weight: 500;
}

.user-separator {
  color: rgba(255,255,255,0.5);
}

.user-role {
  color: rgba(255,255,255,0.85);
}
</style>