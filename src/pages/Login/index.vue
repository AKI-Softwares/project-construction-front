<template>
  <div class="login-container">
    <!-- Lado Esquerdo: Branding -->
    <div class="brand-side">
      <div class="brand-content">
        <!-- Caminho relativo corrigido para passar direto no build -->
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
        
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Digite seu e-mail" 
              required
            />
          </div>

          <div class="input-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Digite sua senha" 
              required
            />
          </div>

          <!-- Centralizado perfeitamente -->
          <div class="forgot-password-container">
            <a href="#" class="forgot-password">Esqueceu a senha?</a>
          </div>

          <button type="submit" class="btn-submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
function handleLogin() {
  console.log('Tentativa de login enviada');
}
</script>

<style scoped>
/* Reset local para garantir que nada herde margens externas que gerem scroll */
:deep(body), :deep(html) {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

/* Container travado no tamanho exato da tela visível */
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh; /* Evita quebras em navegadores mobile e desktop */
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  overflow: hidden; /* Força o sumiço de qualquer barra de rolagem */
  box-sizing: border-box;
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
  margin-bottom: 1.5rem;
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

/* Solução para o preenchimento automático do navegador não mudar a cor do input */
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

/* Link Centralizado */
.forgot-password-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.forgot-password {
  color: #9ca3af;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #ffffff;
}

/* Botão Customizado */
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

.btn-submit:hover {
  background-color: #00b0d4;
}

.btn-submit:active {
  transform: scale(0.99);
}

/* Responsividade limpa */
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
