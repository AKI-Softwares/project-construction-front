<template>
  <MainLayout titulo="Cadastro">

    <div class="page-header">
      <button class="btn-register active">
        <FontAwesomeIcon :icon="['fas', 'user-plus']" />
        Cadastrar usuário
      </button>
    </div>

    <hr class="divider" />

    <div v-if="loadingRoles" class="state">Carregando funções...</div>

@@ -27,7 +20,7 @@
      <div class="form-card">

        <div class="form-group">
          <label>Nome</label>
          <input
            v-model="form.name"
            type="text"
@@ -37,7 +30,7 @@
        </div>

        <div class="form-group">
          <label>E-mail</label>
          <input
            v-model="form.email"
            type="email"
@@ -47,7 +40,7 @@
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input
            v-model="form.password"
            type="password"
@@ -57,7 +50,7 @@
        </div>

        <div class="form-group">
          <label>Função</label>
          <div class="select-wrapper">
            <select
              v-model="form.roleId"
@@ -211,35 +204,15 @@ onMounted(async () => {
<style scoped>
.state { text-align: center; padding: 40px; color: #555; }

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d0d2b;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-register.active {
  background: #00e5cc;
  color: #0d0d2b;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 32px;
}

.alert {
@@ -278,6 +251,8 @@ label {
  color: #333;
}



input, select {
  width: 100%;
  padding: 14px 20px;
@@ -288,6 +263,7 @@ input, select {
  outline: none;
  color: #333;
  appearance: none;

}

input.invalid, select.invalid {
@@ -331,7 +307,6 @@ input.invalid, select.invalid {
  cursor: pointer;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  

.btn-cancel {
  padding: 14px 40px;
