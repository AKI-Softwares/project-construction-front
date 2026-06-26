<template>
  <div class="login-container">
    <!-- Lado Esquerdo: Branding -->
    <div class="brand-side">
      <div class="brand-content">
        <!-- Logo carregado a partir de assets conforme repositório -->
       <img 
  src="@/assets/logo_check_obra.png" 
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

          <!-- Ajustado para o centro conforme solicitado -->
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
  // Ação de login futura
  console.log('Tentativa de login enviada');
}
</script>

<style scoped>
/* Container Principal ocupando toda a tela */
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  overflow: hidden;
}

/* Lado Esquerdo: Branco com o Logo */
.brand-side {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.brand-content {
  text-align: center;
  max-width: 400px;
}

.main-logo {
  max-width: 280px;
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

/* Lado Direito: Escuro com os Inputs */
.form-side {
  flex: 1;
  background-color: #0b1120; /* Tom azul escuro idêntico ao mockup */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
}

/* Grupos de Input */
.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.input-group label {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.input-group input {
  background-color: #1e293b; /* Fundo do input acinzentado escuro */
  border: none;
  border-radius: 12px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: background-color 0.2s;
}

.input-group input:focus {
  background-color: #273549;
}

/* Centralização do "Esqueceu a senha?" */
.forgot-password-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
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

/* Botão Entrar Ciano */
.btn-submit {
  width: 100%;
  background-color: #0099b8; /* Ciano idêntico à imagem */
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-submit:hover {
  background-color: #00b0d4;
}

.btn-submit:active {
  transform: scale(0.98);
}

/* Responsividade Básica para telas pequenas */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  .brand-side, .form-side {
    flex: none;
    height: 50vh;
  }
  .main-logo {
    max-width: 200px;
    margin-bottom: 1rem;
  }
  .login-box h2 {
    margin-bottom: 1.5rem;
  }
}
</style>
