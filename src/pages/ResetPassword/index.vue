<template>
  <div class="auth-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <h2 class="form-title">Redefinir senha</h2>
      <p class="form-subtitle">Digite sua nova senha abaixo.</p>

      <!-- Token inválido -->
      <div v-if="tokenInvalid" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
        Link inválido ou expirado. Solicite um novo link de recuperação.
        <router-link to="/forgot-password">Solicitar novo link</router-link>
      </div>

      <div v-else>
        <div v-if="error" class="alert error">
          <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
          {{ error }}
        </div>

        <label>Nova senha</label>
        <div class="input-wrapper">
          <input
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mínimo 8 caracteres"
            :class="{ invalid: passwordError }"
          />
          <button class="toggle-password" @click="showPassword = !showPassword">
            <FontAwesomeIcon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
          </button>
        </div>
        <span v-if="passwordError" class="field-error">{{ passwordError }}</span>

        <label>Confirmar nova senha</label>
        <div class="input-wrapper">
          <input
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Repita a nova senha"
            :class="{ invalid: confirmError }"
            @keyup.enter="submit"
          />
          <button class="toggle-password" @click="showConfirm = !showConfirm">
            <FontAwesomeIcon :icon="['fas', showConfirm ? 'eye-slash' : 'eye']" />
          </button>
        </div>
        <span v-if="confirmError" class="field-error">{{ confirmError }}</span>

        <!-- Força da senha -->
        <div class="password-strength">
          <div class="strength-bars">
            <div :class="['bar', strengthLevel >= 1 ? `level-${strengthLevel}` : '']"></div>
            <div :class="['bar', strengthLevel >= 2 ? `level-${strengthLevel}` : '']"></div>
            <div :class="['bar', strengthLevel >= 3 ? `level-${strengthLevel}` : '']"></div>
          </div>
          <span class="strength-label">{{ strengthLabel }}</span>
        </div>

        <button @click="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Salvando...' : 'Redefinir senha' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { resetPassword } from '../../services/auth.js'

const router = useRouter()
const route = useRoute()

const token = ref('')
const tokenInvalid = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const passwordError = ref('')
const confirmError = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) tokenInvalid.value = true
})

const strengthLevel = computed(() => {
  const p = newPassword.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Fraca', 'Média', 'Forte']
  return labels[strengthLevel.value] || ''
})

function validate() {
  passwordError.value = ''
  confirmError.value = ''
  let valid = true
  if (!newPassword.value || newPassword.value.length < 8) {
    passwordError.value = 'A senha deve ter pelo menos 8 caracteres.'
    valid = false
  }
  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = 'As senhas não coincidem.'
    valid = false
  }
  return valid
}

async function submit() {
  if (!validate()) return
  loading.value = true
  error.value = ''
  try {
    await resetPassword(token.value, newPassword.value)
    router.push('/reset-password/success')
  } catch (e) {
    if (e.response?.status === 400 || e.response?.status === 404) {
      tokenInvalid.value = true
    } else {
      error.value = e.response?.data?.message || 'Erro ao redefinir senha.'
    }
  } finally {
    loading.value = false
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
  padding: 60px 80px;
}
.form-title { font-size: 2rem; margin-bottom: 8px; color: #1a1a2e; }
.form-subtitle { font-size: 0.9rem; color: #666; margin-bottom: 32px; }
label { font-size: 0.9rem; margin-bottom: 6px; color: #333; display: block; }
.input-wrapper { position: relative; margin-bottom: 8px; }
input {
  width: 100%;
  padding: 14px 48px 14px 20px;
  border: none;
  border-radius: 30px;
  background-color: #e8e8e8;
  font-size: 1rem;
  outline: none;
}
input.invalid { border: 2px solid #c0392b; background: #fff3f0; }
.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
}
.field-error { font-size: 0.8rem; color: #c0392b; padding-left: 8px; margin-bottom: 16px; display: block; }
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  flex-wrap: wrap;
}
.alert.error { background: #fff3f0; color: #c0392b; border: 1px solid #f99f56; }
.alert a { color: #c0392b; margin-left: 4px; }
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.strength-bars { display: flex; gap: 4px; }
.bar {
  width: 60px;
  height: 6px;
  border-radius: 4px;
  background: #e0e0e0;
  transition: background 0.3s;
}
.bar.level-1 { background: #c0392b; }
.bar.level-2 { background: #f5a623; }
.bar.level-3 { background: #00e5cc; }
.strength-label { font-size: 0.8rem; color: #555; }
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
  margin-top: 8px;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>