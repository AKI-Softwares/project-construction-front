<template>
  <div class="login-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <h2 class="form-title">Login</h2>

      <label>E-mail</label>
      <input type="email" v-model="email" />

      <label>Senha</label>
      <input type="password" v-model="senha" @keyup.enter="entrar" />

      <router-link to="/forgot-password" class="forgot-link">Esqueceu a senha?</router-link>

      <p class="erro" v-if="erro">{{ erro }}</p>

      <button @click="entrar" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>

      <p>Não tem uma conta? <a href="#">Cadastre-se</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../services/auth.js'
import { useAuthStore } from '../../store/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}

async function entrar() {
  erro.value = ''
  carregando.value = true
  try {
    const data = await login(email.value, senha.value)
    // Usa a action da store (e não localStorage.setItem direto) para que o
    // state.token reativo seja atualizado — isso é o que permite os getters
    // hasPermission/isPlatformAdmin recalcularem corretamente ao trocar de
    // conta na mesma aba, sem precisar de F5.
    authStore.setToken(data.token)

    // Verifica se precisa trocar senha
    const payload = decodeToken(data.token)
    if (payload.mustChangePassword) {
      router.push('/change-password')
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    erro.value = e.response?.data?.message || 'E-mail ou senha incorretos.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.login-page { display: flex; height: 100vh; }
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
.brand-slogan { color: #ffffff; font-size: 1rem; line-height: 1.6; }
.right-panel {
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
}
.form-title { font-size: 2rem; margin-bottom: 32px; color: #1a1a2e; }
label { font-size: 0.9rem; margin-bottom: 6px; color: #333; }
input {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 30px;
  background-color: #e8e8e8;
  margin-bottom: 20px;
  font-size: 1rem;
  outline: none;
}
.forgot-link { color: #00e5cc; text-decoration: none; font-size: 0.9rem; margin-bottom: 4px; display: block; text-align: right; }
a { color: #00e5cc; text-decoration: none; font-size: 0.9rem; }
button {
  width: 100%;
  padding: 16px;
  background-color: #00e5cc;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  margin: 20px 0;
}
button:disabled { opacity: 0.7; cursor: not-allowed; }
.erro { color: red; font-size: 0.85rem; text-align: left; margin-bottom: 8px; }
p { text-align: center; font-size: 0.9rem; color: #555; }
</style>
