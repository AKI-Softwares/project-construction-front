<template>
  <div class="auth-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <div class="icon-wrapper">
        <FontAwesomeIcon :icon="['fas', 'lock']" class="lock-icon" />
      </div>
      <h2 class="form-title">Troca de senha obrigatória</h2>
      <p class="form-subtitle">
        Por segurança, você precisa criar uma nova senha antes de continuar.
      </p>

      <div v-if="error" class="alert error">
        <FontAwesomeIcon :icon="['fas', 'circle-exclamation']" />
        {{ error }}
      </div>

      <label>Senha temporária</label>
      <div class="input-wrapper">
        <input
          v-model="currentPassword"
          :type="showCurrent ? 'text' : 'password'"
          placeholder="Senha recebida por e-mail"
          :class="{ invalid: currentError }"
        />
        <button class="toggle-password" @click="showCurrent = !showCurrent">
          <FontAwesomeIcon :icon="['fas', showCurrent ? 'eye-slash' : 'eye']" />
        </button>
      </div>
      <span v-if="currentError" class="field-error">{{ currentError }}</span>

      <label>Nova senha</label>
      <div class="input-wrapper">
        <input
          v-model="newPassword"
          :type="showNew ? 'text' : 'password'"
          placeholder="Mínimo 8 caracteres"
          :class="{ invalid: newError }"
        />
        <button class="toggle-password" @click="showNew = !showNew">
          <FontAwesomeIcon :icon="['fas', showNew ? 'eye-slash' : 'eye']" />
        </button>
      </div>
      <span v-if="newError" class="field-error">{{ newError }}</span>

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
        {{ loading ? 'Salvando...' : 'Criar nova senha' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '../../services/auth.js'

const router = useRouter()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const currentError = ref('')
const newError = ref('')
const confirmError = ref('')
const error = ref('')
const loading = ref(false)

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
  return ['', 'Fraca', 'Média', 'Forte'][strengthLevel.value] || ''
})

function validate() {
  currentError.value = ''
  newError.value = ''
  confirmError.value = ''
  let valid = true
  if (!currentPassword.value) { currentError.value = 'Digite a senha temporária.'; valid = false }
  if (!newPassword.value || newPassword.value.length < 8) { newError.value = 'A senha deve ter pelo menos 8 caracteres.'; valid = false }
  if (newPassword.value !== confirmPassword.value) { confirmError.value = 'As senhas não coincidem.'; valid = false }
  if (newPassword.value === currentPassword.value) { newError.value = 'A nova senha deve ser diferente da temporária.'; valid = false }
  return valid
}

async function submit() {
  if (!validate()) return
  loading.value = true
  error.value = ''
  try {
    await changePassword(currentPassword.value, newPassword.value)
    router.push('/reset-password/success')
  } catch (e) {
    if (e.response?.status === 401) {
      currentError.value = 'Senha temporária incorreta.'
    } else {
      error.value = e.response?.data?.message || 'Erro ao alterar senha.'
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
.icon-wrapper { margin-bottom: 16px; }
.lock-icon { font-size: 2.5rem; color: #f5a623; }
.form-title { font-size: 1.8rem; margin-bottom: 8px; color: #1a1a2e; }
.form-subtitle { font-size: 0.9rem; color: #666; margin-bottom: 28px; line-height: 1.5; }
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
.password-strength { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.strength-bars { display: flex; gap: 4px; }
.bar { width: 60px; height: 6px; border-radius: 4px; background: #e0e0e0; transition: background 0.3s; }
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
