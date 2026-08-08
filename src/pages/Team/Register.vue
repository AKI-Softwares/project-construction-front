<template>
  <MainLayout titulo="Cadastrar Usuário">

    <div class="register-card">
      <div class="register-header">
        <button class="btn-back" @click="router.push('/team')">
          <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar para Equipe
        </button>
        <h2>Novo Usuário</h2>
        <p>Preencha os dados abaixo para criar um novo usuário na equipe.</p>
      </div>

      <div v-if="success" class="alert success">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" />
        Usuário criado com sucesso! <a @click="router.push('/team')" class="link">Ver equipe</a>
      </div>

      <div v-if="error" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" /> {{ error }}
      </div>

      <div class="form-body">

        <div class="form-group">
          <label>Nome completo <span class="required">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex: João Silva"
            :class="{ invalid: errors.name }"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>E-mail <span class="required">*</span></label>
          <input
            v-model="form.email"
            type="email"
            placeholder="joao@empresa.com"
            :class="{ invalid: errors.email }"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>Senha <span class="required">*</span></label>
          <div class="input-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              :class="{ invalid: errors.password }"
            />
            <button class="toggle-password" type="button" @click="showPassword = !showPassword">
              <FontAwesomeIcon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>Função <span class="required">*</span></label>
          <select v-model="form.roleId" :class="{ invalid: errors.roleId }">
            <option value="">— Selecione uma função —</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <span v-if="errors.roleId" class="field-error">{{ errors.roleId }}</span>
          <span v-if="!loadingRoles && roles.length === 0" class="field-hint">
            Nenhuma função cadastrada. <a @click="router.push('/team')" class="link">Crie uma função primeiro.</a>
          </span>
        </div>

        <div class="form-actions">
          <button class="btn-save" :disabled="submitting" @click="submit">
            {{ submitting ? 'Criando usuário...' : 'Criar usuário' }}
          </button>
          <button class="btn-cancel" @click="router.push('/team')">Cancelar</button>
        </div>

      </div>
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
const loadingRoles = ref(true)
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const showPassword = ref(false)

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

function validate() {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.roleId = ''
  let valid = true

  if (!form.name || form.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres.'
    valid = false
  }
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (!form.password || form.password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.'
    valid = false
  }
  if (!form.roleId) {
    errors.roleId = 'Selecione uma função para o usuário.'
    valid = false
  }

  return valid
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  error.value = ''
  success.value = false

  try {
    await createUser({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      roleId: Number(form.roleId),
    })
    success.value = true
    form.name = ''
    form.email = ''
    form.password = ''
    form.roleId = ''
  } catch (e) {
    if (e.response?.status === 409) {
      errors.email = 'Este e-mail já está em uso.'
    } else {
      error.value = e.response?.data?.message || 'Erro ao criar usuário. Tente novamente.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    roles.value = await getRoles()
  } catch (e) {
    console.error('Erro ao carregar funções:', e)
  } finally {
    loadingRoles.value = false
  }
})
</script>

<style scoped>
.register-card {
  background: #fff;
  border-radius: 12px;
  padding: 36px;
  border: 1px solid #eee;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.register-header { display: flex; flex-direction: column; gap: 8px; }
.btn-back { background: none; border: none; color: #666; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 4px; width: fit-content; }
.btn-back:hover { color: #00897b; }
.register-header h2 { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0; }
.register-header p { font-size: 0.88rem; color: #777; margin: 0; }

.alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }

.form-body { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.88rem; font-weight: 600; color: #2d3748; }
.required { color: #c0392b; }

input[type="text"], input[type="email"], input[type="password"] {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9f9f9;
  font-size: 0.92rem;
  outline: none;
  color: #333;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
input:focus { border-color: #00e5cc; background: #fff; }
input.invalid { border-color: #c0392b; background: #fff3f0; }

select {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9f9f9;
  font-size: 0.92rem;
  outline: none;
  color: #333;
  cursor: pointer;
  box-sizing: border-box;
}
select:focus { border-color: #00e5cc; }
select.invalid { border-color: #c0392b; background: #fff3f0; }

.input-wrapper { position: relative; }
.input-wrapper input { padding-right: 48px; }
.toggle-password { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #888; cursor: pointer; font-size: 1rem; padding: 0; }
.toggle-password:hover { color: #333; }

.field-error { font-size: 0.78rem; color: #c0392b; font-weight: 500; }
.field-hint { font-size: 0.78rem; color: #888; }
.link { color: #00897b; cursor: pointer; text-decoration: underline; margin-left: 4px; }

.form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; }
.btn-save { padding: 12px 32px; background: #00e5cc; border: none; border-radius: 8px; font-size: 0.92rem; font-weight: 700; color: #0b1120; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel { padding: 12px 32px; background: #e8e8e8; border: none; border-radius: 8px; font-size: 0.92rem; font-weight: 600; color: #333; cursor: pointer; }
</style>
