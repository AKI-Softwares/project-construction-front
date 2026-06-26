<template>
  <div class="login-container">
    <!-- Lado Esquerdo: Branding -->
    <div class="brand-side">
      <div class="brand-content">
        <!-- Logo puxando da pasta assets -->
        <img 
          src="../../assets/logo_check_obra.png" 
          alt="CheckObra Logo" 
          class="main-logo"
        />
        <p class="tagline">
          Transformando a vistoria de obras em processo digital
        </p>
      </div>
    </div>

    <!-- Lado Direito: Formulário -->
    <div class="form-side">
      <div class="login-box">
        <h2>Login</h2>
        
        <div class="form-wrapper">
          <div class="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Digite seu e-mail"
            />
          </div>

          <div class="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              v-model="senha" 
              placeholder="Digite sua senha"
              @keyup.enter="entrar" 
            />
          </div>

          <!-- Mensagem de erro original tratada no layout novo -->
          <p class="erro" v-if="erro">{{ erro }}</p>

          <!-- Centralizado conforme pedido -->
          <div class="forgot-password-container">
            <router-link to="/forgot-password" class="forgot-password">
              Esqueceu a senha?
            </router-link>
          </div>

          <button @click="entrar" :disabled="carregando" class="btn-submit">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>

          <!-- Links inferiores originais mantidos -->
          <p class="register-text">
            Não tem uma conta? <a href="#">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../services/auth.js'

const router = useRouter()
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
    localStorage.setItem('token', data.token)

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
/* Remove qualquer margem, padding ou scroll vindo de fora */
:global(html), :global(body), :global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  background-color: #0b1120;
}

/* Container travado no tamanho exato da tela, sem scroll e sem bordas */
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  overflow: hidden;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

/* Lado Esquerdo: Branco */
.brand-side {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.brand-content {
  text-align: center;
  max-width: 400px;
}

.main-logo {
  max-width: 280px;
  width: 100%;
  height: auto;
  margin-bottom: 2rem;
}

.tagline {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
}

/* Lado Direito: Escuro */
.form-side {
  flex: 1;
  background-color: #0b1120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  color: #ffffff;
  font-size: 2.25rem;
  font-weight: 400;
  margin-top: 0;
  margin-bottom: 2rem;
}

/* Inputs e Labels */
.input-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.input-group label {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: left;
}

.input-group input {
  background-color: #1e293b;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.2s;
}

/* Evita o fundo branco do autofill do Chrome */
.input-group input:-webkit-autofill,
.input-group input:-webkit-autofill:hover, 
.input-group input:-webkit-autofill:focus {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0px 1000px #1e293b inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.input-group input:focus {
  background-color: #273549;
}

/* Mensagem de Erro */
.erro {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: left;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

/* Link Centralizado */
.forgot-password-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}

.forgot-password {
  color: #9ca3af;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #ffffff;
}

/* Botão de Entrar */
.btn-submit {
  width: 100%;
  background-color: #0099b8;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #00b0d4;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Texto de Cadastro Inferior */
.register-text {
  text-align: center;
  font-size: 0.9rem;
  color: #9ca3af;
  margin-top: 1.5rem;
}

.register-text a {
  color: #0099b8;
  text-decoration: none;
  font-weight: 500;
}

.register-text a:hover {
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  .brand-side, .form-side {
    flex: 1;
    height: 50vh;
  }
  .main-logo {
    max-width: 200px;
    margin-bottom: 1rem;
  }
}
</style>
