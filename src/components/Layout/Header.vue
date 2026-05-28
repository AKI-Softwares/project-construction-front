<template>
  <div class="header">

    <!-- Título da página -->
    <h1 class="titulo">{{ titulo }}</h1>

    <!-- Lado direito -->
    <div class="header-direita">

      <!-- Busca -->
      <div class="busca">
        <span>🔍</span>
        <input type="text" placeholder="Buscar..." />
      </div>

      <!-- Perfil -->
      <div class="perfil">
        <div class="perfil-info">
          <span class="perfil-nome">Maria Clara</span>
          <span class="perfil-cargo">Administradora</span>
        </div>
        <div class="perfil-avatar">MC</div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Dashboard'
  }
})
</script>

<style scoped>
.header {
  height: 60px;
  background-color: #2a2a4a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: fixed;
  top: 0;
  left: 60px;
  right: 0;
  z-index: 100;
}

.titulo {
  color: #00e5cc;
  font-size: 1.4rem;
  font-weight: 600;
}

.header-direita {
  display: flex;
  align-items: center;
  gap: 24px;
}

.busca {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 8px 16px;
}

.busca input {
  background: none;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.9rem;
  width: 200px;
}

.busca input::placeholder {
  color: rgba(255,255,255,0.4);
}

.perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.perfil-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.perfil-nome {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
}

.perfil-cargo {
  color: rgba(255,255,255,0.5);
  font-size: 0.75rem;
}

.perfil-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #00e5cc;
  color: #0d0d2b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}
</style>