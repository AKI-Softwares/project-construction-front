<template>
  <div class="auth-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <h2 class="form-title">Recuperar senha</h2>
      <p class="form-subtitle">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>

      <div v-if="error" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
        {{ error }}
      </div>

      <label>E-mail</label>
      <input
        v-model="email"
        type="email"
        placeholder="seu@email.com"
        :class="{ invalid: emailError }"
        @keyup.enter="submit"
      />
      <span v-if="emailError" class="field-error">{{ emailError }}</span>

      <button @click="submit" :disabled="loading" class="btn-submit">
        {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
      </button>

      <router-link to="/login" class="back-link">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
        Voltar ao login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword } from '../../services/auth.js'

const router = useRouter()
const email = ref('')
const emailError = ref('')
const error = ref('')
const loading = ref(false)

function validate() {
  emailError.value = ''
  if (!email.value || !email.value.includes('@')) {
    emailError.value = 'Digite um e-mail válido.'
    return false
  }
  return true
}

async function submit() {
  if (!validate()) return
  loading.value = true
  error.value = ''
  try {
    await forgotPassword(email.value)
    router.push({ path: '/forgot-password/sent', query: { email: email.value } })
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao enviar e-mail. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  height: 100vh;
}
.left-panel {
  width: 40%;
  background-color: #0d0d2b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}
.brand-name { color: #00e5cc; font-size: 2rem; margin-bottom: 16px; }
.brand-slogan { color: #fff; font-size: 1rem; line-height: 1.6; }
.right-panel {
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
}
.form-title { font-size: 2rem; margin-bottom: 8px; color: #1a1a2e; }
.form-subtitle { font-size: 0.9rem; color: #666; margin-bottom: 32px; }
label { font-size: 0.9rem; margin-bottom: 6px; color: #333; }
input {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 30px;
  background-color: #e8e8e8;
  margin-bottom: 8px;
  font-size: 1rem;
  outline: none;
}
input.invalid { border: 2px solid #c0392b; background: #fff3f0; }
.field-error { font-size: 0.8rem; color: #c0392b; padding-left: 8px; margin-bottom: 12px; display: block; }
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.btn-submit {
  width: 100%;
  padding: 16px;
  background-color: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  color: #0d0d2b;
  cursor: pointer;
  margin: 20px 0;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00e5cc;
  text-decoration: none;
  font-size: 0.9rem;
  justify-content: center;
}
</style>