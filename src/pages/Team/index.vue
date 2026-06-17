<template>
  <MainLayout titulo="Equipe">

    <div class="team-header">
      <button class="btn-register" @click="goToRegister">
        <FontAwesomeIcon :icon="['fas', 'user-plus']" />
        Cadastrar usuário
      </button>
    </div>

    <hr class="divider" />

    <div v-if="loading" class="state">Carregando...</div>
    <div v-if="error" class="state error">{{ error }}</div>

    <div v-if="!loading && !error" class="user-list">

      <div v-for="user in users" :key="user.id" class="user-card">
        <FontAwesomeIcon :icon="['fas', 'user']" class="user-icon" />
        <span class="user-name">{{ user.name }}</span>
        <span class="user-separator">-</span>
        <span class="user-role">{{ user.role?.name || '—' }}</span>

        <button
          class="btn-delete"
          @click="confirmDelete(user)"
          title="Excluir usuário"
        >
          <FontAwesomeIcon :icon="['fas', 'trash']" />
        </button>
      </div>

      <div v-if="users.length === 0" class="state">
        Nenhum usuário cadastrado.
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div v-if="userToDelete" class="modal-overlay" @click.self="userToDelete = null">
      <div class="modal">
        <div class="modal-icon">
          <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" />
        </div>
        <h3>Excluir usuário</h3>
        <p>Tem certeza que deseja excluir <strong>{{ userToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn-confirm-delete" :disabled="deleting" @click="doDelete">
            {{ deleting ? 'Excluindo...' : 'Sim, excluir' }}
          </button>
          <button class="btn-cancel" @click="userToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getUsers, deleteUser } from '../../services/users.js'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const users = ref([])
const userToDelete = ref(null)
const deleting = ref(false)

function goToRegister() {
  router.push('/team/register')
}

function confirmDelete(user) {
  userToDelete.value = user
}

async function doDelete() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await deleteUser(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    userToDelete.value = null
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao excluir usuário.'
    userToDelete.value = null
  } finally {
    deleting.value = false
  }
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
.btn-register:hover { background: #1a1a4e; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin-bottom: 32px; }
.state { text-align: center; padding: 40px; color: #555; }
.error { color: red; }

.user-list { display: flex; flex-direction: column; gap: 12px; }

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
.user-icon { font-size: 1.3rem; color: #00e5cc; }
.user-name { font-weight: 500; }
.user-separator { color: rgba(255,255,255,0.5); }
.user-role { color: rgba(255,255,255,0.85); flex: 1; }

.btn-delete {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 1rem;
  padding: 6px 8px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  margin-left: auto;
}
.btn-delete:hover {
  color: #c0392b;
  background: rgba(255,255,255,0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.modal-icon {
  font-size: 2.5rem;
  color: #f99f56;
}
.modal h3 {
  font-size: 1.2rem;
  color: #1a1a2e;
  margin: 0;
}
.modal p {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin: 0;
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.btn-confirm-delete {
  padding: 12px 28px;
  background: #c0392b;
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
}
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel {
  padding: 12px 28px;
  background: #e8e8e8;
  border: none;
  border-radius: 30px;
  color: #333;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
