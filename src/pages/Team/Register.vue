<template>
  <MainLayout titulo="Cadastro">

    <div class="page-header">
      <button class="btn-register active">
        <FontAwesomeIcon :icon="['fas', 'user-plus']" />
        Cadastrar usuário
      </button>
    </div>

    <hr class="divider" />

    <!-- Success message -->
    <div v-if="success" class="alert success">
      <FontAwesomeIcon :icon="['fas', 'circle-check']" />
      Usuário cadastrado com sucesso!
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert error">
      <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
      {{ error }}
    </div>

    <!-- Form -->
    <div class="form-card">
      <div class="form-group">
        <label>Nome</label>
        <input
          v-model="form.name"
          type="text"
          placeholder=""
          :class="{ invalid: errors.name }"
        />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>E-mail</label>
        <input
          v-model="form.email"
          type="email"
          placeholder=""
          :class="{ invalid: errors.email }"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label>Senha</label>
        <input
          v-model="form.password"
          type="password"
          placeholder=""
          :class="{ invalid: errors.password }"
        />
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label>Função</label>
        <div class="select-wrapper">
          <select
            v-model="form.roleId"
            :class="{ invalid: errors.roleId }"
          >
            <option value="" disabled>Selecionar</option>
            <option
              v-for="role in roles"
              :key="role.id"
              :value="role.id"
            >
              {{ translateRole(role.name) }}
            </option>
          </select>
          <FontAwesomeIcon :icon="['fas', 'chevron-down']" class="select-icon" />
        </div>
        <span v-if="errors.roleId" class="field-error">{{ errors.roleId }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button class="btn-save" :disabled="submitting" @click="submit">
        {{ submitting ? 'Salvando...' : 'Salvar' }}
      </button>
      <button class="btn-cancel" @click="cancel">
        Cancelar
      </button>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { createUser } from '../../services/users.js'
import { getRoles } from '../../services/roles.js'

const router = useRouter()

const roles = ref([])
const submitting = ref(false)
const success = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  roleId: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  roleId: '',
})

function translateRole(name) {
  const map = {
    ADMIN: 'Administrador',
    MANAGER: 'Gestor de Sistema',
    INSPECTOR: 'Avaliador',
  }
  return map[name] || name
}

function validate() {
  let valid = true
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.roleId = ''

  if (!form.name || form.name.length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres.'
    valid = false
  }
  if (!form.email || !form.email.includes('@')) {
    errors.email = 'E-mail inválido.'
    valid = false
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres.'
    valid = false
  }
  if (!form.roleId) {
    errors.roleId = 'Selecione uma função.'
    valid = false
  }

  return valid
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.roleId = ''
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.roleId = ''
}

async function submit() {
  error.value = ''
  success.value = false

  if (!validate()) return

  submitting.value = true
  try {
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      roleId: Number(form.roleId),
    })
    success.value = true
    resetForm()
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    if (e.response?.status === 409) {
      errors.email = 'E-mail já cadastrado.'
    } else {
      error.value = e.response?.data?.message || 'Error creating user.'
    }
  } finally {
    submitting.value = false
  }
}

function cancel() {
  router.push('/team')
}

onMounted(async () => {
  try {
    roles.value = await getRoles()
  } catch (e) {
    error.value = 'Error loading roles.'
  }
})
</script>

<style scoped>
.page-header {
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
}

.btn-register.active {
  background: #00e5cc;
  color: #0d0d2b;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 32px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  font-weight: 500;
}

.alert.success {
  background: #e0faf6;
  color: #00897b;
  border: 1px solid #00e5cc;
}

.alert.error {
  background: #fff3f0;
  color: #c0392b;
  border: 1px solid #f99f56;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #eee;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

input, select {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 30px;
  background-color: #e8e8e8;
  font-size: 1rem;
  outline: none;
  color: #333;
  appearance: none;
}

input.invalid, select.invalid {
  border: 2px solid #c0392b;
  background-color: #fff3f0;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #555;
  pointer-events: none;
}

.field-error {
  font-size: 0.8rem;
  color: #c0392b;
  padding-left: 8px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  max-width: 680px;
  justify-content: flex-end;
}

.btn-save {
  padding: 14px 40px;
  background: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  color: #0d0d2b;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 14px 40px;
  background: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  color: #0d0d2b;
  cursor: pointer;
}
</style>