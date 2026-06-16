<template>
  <div class="auth-page">
    <div class="left-panel">
      <h1 class="brand-name">CheckObra</h1>
      <p class="brand-slogan">Transformando a vistoria de obras em processo digital</p>
    </div>

    <div class="right-panel">
      <div class="icon-wrapper">
        <FontAwesomeIcon :icon="['fas', 'circle-check']" class="success-icon" />
      </div>
      <h2 class="form-title">Senha alterada!</h2>
      <p class="form-subtitle">Sua senha foi redefinida com sucesso. Agora você pode entrar com sua nova senha.</p>

      <router-link to="/login" class="btn-submit">
        Ir para o login
      </router-link>
    </div>
  </div>
</template>

<script setup>
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
.success-icon { font-size: 4rem; color: #00e5cc; }
.form-title { font-size: 2rem; margin-bottom: 12px; color: #1a1a2e; }
.form-subtitle { font-size: 0.95rem; color: #555; margin-bottom: 32px; max-width: 400px; line-height: 1.6; }
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
  text-decoration: none;
  display: block;
}
</style>
