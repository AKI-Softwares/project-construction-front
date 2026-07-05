<template>
  <div class="register-page">
    <div class="register-card">

      <div class="logo">
        <span class="logo-check">✓</span>
        <span class="logo-text">CheckObra</span>
      </div>
      <h1 class="title">Criar conta</h1>
      <p class="subtitle">Cadastre sua empresa e comece a usar o sistema.</p>

      <div v-if="success" class="alert success">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" />
        Empresa cadastrada! Redirecionando para o login...
      </div>
      <div v-if="error" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
        {{ error }}
      </div>

      <div class="section-label">Dados da empresa</div>

      <div class="field">
        <input
          v-model="form.companyName"
          type="text"
          placeholder="Nome da empresa"
          :class="{ invalid: errors.companyName }"
          @input="generateSlug"
        />
        <span v-if="errors.companyName" class="field-error">{{ errors.companyName }}</span>
      </div>

      <div class="field">
        <input
          v-model="form.slug"
          type="text"
          placeholder="Identificador (ex: minha-empresa)"
          :class="{ invalid: errors.slug }"
        />
        <span class="field-hint">Apenas letras minúsculas, números e hífens.</span>
        <span v-if="errors.slug" class="field-error">{{ errors.slug }}</span>
      </div>

      <div class="section-label">Dados do administrador</div>

      <div class="field">
        <input
          v-model="form.adminName"
          type="text"
          placeholder="Seu nome"
          :class="{ invalid: errors.adminName }"
        />
        <span v-if="errors.adminName" class="field-error">{{ errors.adminName }}</span>
      </div>

      <div class="field">
        <input
          v-model="form.email"
          type="email"
          placeholder="E-mail"
          :class="{ invalid: errors.email }"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <div class="input-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha (mínimo 8 caracteres)"
            :class="{ invalid: errors.password }"
          />
          <button class="toggle-password" type="button" @click="showPassword = !showPassword">
            <FontAwesomeIcon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
          </button>
        </div>
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <button class="btn-submit" :disabled="submitting" @click="submit">
        {{ submitting ? 'Cadastrando...' : 'Criar conta' }}
      </button>

      <p class="login-link">
        Já tem conta? <a @click="router.push('/login')">Entrar</a>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { registerCompany } from '../../services/auth.js'

const router = useRouter()
const submitting = ref(false)
const showPassword = ref(false)
const success = ref(false)
const error = ref('')

const form = reactive({
  companyName: '',
  slug: '',
  adminName: '',
  email: '',
  password: '',
})

const errors = reactive({
  companyName: '',
  slug: '',
  adminName: '',
  email: '',
  password: '',
})

function generateSlug() {
  form.slug = form.companyName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let valid = true
  if (!form.companyName || form.companyName.length < 2) {
    errors.companyName = 'Nome deve ter pelo menos 2 caracteres.'
    valid = false
  }
  if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) {
    errors.slug = 'Apenas letras minúsculas, números e hífens.'
    valid = false
  }
  if (!form.adminName || form.adminName.length < 2) {
    errors.adminName = 'Nome deve ter pelo menos 2 caracteres.'
    valid = false
  }
  if (!form.email || !form.email.includes('@')) {
    errors.email = 'E-mail inválido.'
    valid = false
  }
  if (!form.password || form.password.length < 8) {
    errors.password = 'Senha deve ter pelo menos 8 caracteres.'
    valid = false
  }
  return valid
}

async function submit() {
  error.value = ''
  if (!validate()) return
  submitting.value = true
  try {
    await registerCompany({
      company: { name: form.companyName, slug: form.slug },
      admin: { name: form.adminName, email: form.email, password: form.password },
    })
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    if (e.response?.status === 409) {
      const msg = e.response.data?.message || ''
      if (msg.toLowerCase().includes('slug')) errors.slug = 'Este identificador já está em uso.'
      else if (msg.toLowerCase().includes('email')) errors.email = 'Este e-mail já está cadastrado.'
      else error.value = msg
    } else {
      error.value = e.response?.data?.message || 'Erro ao criar conta. Tente novamente.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #0d0d2b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.register-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.logo-check {
  background: #00e5cc;
  color: #0d0d2b;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0d0d2b;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d0d2b;
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #999;
  margin-top: 8px;
}

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper input { flex: 1; }
.toggle-password { position: absolute; right: 16px; background: none; border: none; color: #888; cursor: pointer; font-size: 1rem; padding: 0; }
.toggle-password:hover { color: #333; }

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input {
  padding: 14px 20px;
  border: none;
  border-radius: 30px;
  background: #e8e8e8;
  font-size: 0.95rem;
  outline: none;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}

input.invalid {
  border: 2px solid #c0392b;
  background: #fff3f0;
}

.field-hint {
  font-size: 0.75rem;
  color: #aaa;
  padding-left: 8px;
}

.field-error {
  font-size: 0.78rem;
  color: #c0392b;
  padding-left: 8px;
}

.btn-submit {
  margin-top: 8px;
  padding: 14px;
  background: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  color: #0d0d2b;
  cursor: pointer;
  width: 100%;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}
.alert.success { background: #e0faf6; color: #00897b; border: 1px solid #00e5cc; }
.alert.error   { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }

.login-link {
  text-align: center;
  font-size: 0.88rem;
  color: #666;
  margin: 0;
}

.login-link a {
  color: #00897b;
  font-weight: 600;
  cursor: pointer;
}
</style>
