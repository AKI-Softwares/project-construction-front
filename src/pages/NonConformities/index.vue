
<template>
  <MainLayout titulo="Não-Conformidades">

    <div class="blocked-card">
      <FontAwesomeIcon :icon="['fas', 'lock']" class="blocked-icon" />
      <h2 class="blocked-title">Visão consolidada indisponível</h2>
      <p class="blocked-text">
        O backend atual não tem um endpoint de leitura para não-conformidades —
        o módulo só expõe <code>POST</code>, <code>PATCH</code> e <code>DELETE</code>.
        Não existe <code>GET /non-conformities</code> (lista) nem
        <code>GET /non-conformities/:id</code> (detalhe), e nenhum outro endpoint
        atual (incluindo <code>GET /checklists/:id</code>) inclui esses dados na resposta.
      </p>
      <p class="blocked-text">
        Não há combinação possível de chamadas existentes que monte essa tabela
        sem um endpoint novo no backend. É necessário criar
        <code>GET /non-conformities</code> com os filtros descritos no guia de
        telas (<code>buildingId</code>, <code>status</code>,
        <code>inspectorId</code>, <code>period</code>) antes desta tela poder
        funcionar de verdade.
      </p>

      <div class="alt-box">
        <FontAwesomeIcon :icon="['fas', 'circle-info']" class="alt-icon" />
        <div>
          <strong>Alternativa disponível agora</strong>
          <p>
            Os detalhes de não-conformidades de uma vistoria específica já
            aparecem no relatório PDF gerado em cada vistoria finalizada
            (tela de Vistorias).
          </p>
        </div>
      </div>

      <button class="btn-primary" @click="router.push('/visits')">
        Ir para Vistorias
      </button>
    </div>

  </MainLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import MainLayout from '../../components/Layout/MainLayout.vue'

const router = useRouter()
</script>

<style scoped>
.blocked-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px;
  border: 1px solid #eee;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.blocked-icon { font-size: 2.5rem; color: #999; }
.blocked-title { font-size: 1.2rem; color: #1a1a2e; margin: 0; }
.blocked-text { font-size: 0.88rem; color: #555; line-height: 1.6; margin: 0; text-align: left; }
.blocked-text code { background: #e8e8e8; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem; }

.alt-box {
  display: flex;
  gap: 12px;
  background: #f0fdfb;
  border: 1px solid #00e5cc;
  border-radius: 10px;
  padding: 16px 20px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  margin-top: 8px;
}
.alt-icon { color: #00897b; font-size: 1.1rem; margin-top: 2px; flex-shrink: 0; }
.alt-box strong { display: block; color: #1a1a2e; margin-bottom: 4px; font-size: 0.88rem; }
.alt-box p { margin: 0; font-size: 0.85rem; color: #555; line-height: 1.5; }

.btn-primary {
  margin-top: 8px;
  background: #0d0d2b;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 12px 28px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
