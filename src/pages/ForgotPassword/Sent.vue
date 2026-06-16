<template>
  <div class="auth-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <div class="icon-wrapper">
        <FontAwesomeIcon :icon="['fas', 'envelope-circle-check']" class="sent-icon" />
      </div>

      <h2 class="form-title">E-mail enviado!</h2>
      <p class="form-subtitle">
        Enviamos um link de recuperação para <strong>{{ email }}</strong>.
        Verifique sua caixa de entrada e o spam.
      </p>
      <p class="form-note">O link expira em <strong>1 hora</strong>.</p>

      <router-link to="/login" class="btn-submit">
        Voltar ao login
      </router-link>

      <button @click="resend" :disabled="resending || countdown > 0" class="btn-resend">
        {{ countdown > 0 ? `Reenviar em ${countdown}s` : resending ? 'Reenviando...' : 'Não recebi o e-mail — Reenviar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { forgotPassword } from '../../services/auth.js'

const route = useRoute()
const email = ref(route.query.email || '')
const resending = ref(false)
const countdown = ref(60)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else clearInterval(timer)
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

async function resend() {
  if (!email.value) return
  resending.value = true
  try {
    await forgotPassword(email.value)
    countdown.value = 60
    timer = setInterval(() => {
      if (countdown.value > 0) countdown.value--
      else clearInterval(timer)
    }, 1000)
  } finally {
    resending.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; height: 100vh; }
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
  align-items: center;
  padding: 60px 80px;
  text-align: center;
}
.icon-wrapper { margin-bottom: 24px; }
.sent-icon { font-size: 4rem; color: #00e5cc; }
.form-title { font-size: 2rem; margin-bottom: 12px; color: #1a1a2e; }
.form-subtitle { font-size: 0.95rem; color: #555; margin-bottom: 8px; max-width: 400px; line-height: 1.6; }
.form-note { font-size: 0.85rem; color: #888; margin-bottom: 32px; }
.btn-submit {
  width: 100%;
  max-width: 400px;
  padding: 16px;
  background-color: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  color: #0d0d2b;
  cursor: pointer;
  margin-bottom: 16px;
  text-decoration: none;
  display: block;
}
.btn-resend {
  background: none;
  border: none;
  color: #00e5cc;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}
.btn-resend:disabled { color: #aaa; cursor: not-allowed; text-decoration: none; }
</style>