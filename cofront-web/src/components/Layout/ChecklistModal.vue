<template>
    <div class="modal-overlay" @click.self="$emit('fechar')">
      <div class="modal">
  
        <!-- Header do modal -->
        <div class="modal-header">
          <div>
            <div class="modal-titulo">CHECKLIST DE INSPEÇÃO - Apartamento</div>
            <div class="modal-subtitulo">{{ checklist.identifier }} - {{ checklist.block }}</div>
            <div class="modal-desc">Itens de verificação de Obra</div>
          </div>
          <div class="progresso-wrapper">
            <div class="progresso-topo">
              <span></span>
              <span>{{ checklist.progress }}%</span>
            </div>
            <div class="progresso-barra">
              <div class="progresso-fill" :style="{ width: checklist.progress + '%' }"></div>
            </div>
          </div>
        </div>
  
        <!-- Lista de cômodos -->
        <div class="modal-body">
          <div v-for="room in checklist.rooms" :key="room.id" class="comodo">
  
            <!-- Cabeçalho do cômodo -->
            <div class="comodo-header" @click="toggleComodo(room.id)">
              <span>{{ room.name }}</span>
              <div class="comodo-acoes">
                <span class="btn-download" @click.stop title="Baixar relatório">⬇</span>
                <span>{{ comodoAberto === room.id ? '∧' : '∨' }}</span>
              </div>
            </div>
  
            <!-- Itens do cômodo -->
            <div v-if="comodoAberto === room.id" class="comodo-itens">
              <div v-for="item in room.items" :key="item.id" class="item">
  
                <!-- Cabeçalho do item -->
                <div
                  :class="['item-header', `item-header-${item.status.toLowerCase()}`]"
                  @click="toggleItem(item.id)"
                >
                  <span>{{ itemAberto === item.id ? '∧' : '∨' }} {{ item.name }}</span>
                  <span v-if="item.status === 'PENDING'" class="icone-info">!</span>
                  <span v-if="item.status === 'APPROVED'" class="icone-aprovado">✓</span>
                </div>
  
                <!-- Conteúdo expandido -->
                <div v-if="itemAberto === item.id" class="item-conteudo">
  
                  <!-- Item com pendência -->
                  <div v-if="item.status === 'PENDING'" class="item-problema">
  
                    <!-- Foto + botão download -->
                    <div class="item-foto-wrapper">
                      <div class="item-foto">
                        <!-- Quando o back tiver endpoint de foto, trocar o placeholder por: -->
                        <!-- <img :src="item.photoUrl" alt="Foto do problema" /> -->
                        <div class="foto-placeholder">
                          <span>📷</span>
                          <span>Foto</span>
                        </div>
                      </div>
                      <!-- Botão de download da foto — pronto para o futuro -->
                      <button
                        class="btn-download-foto"
                        :disabled="!item.photoUrl"
                        :title="item.photoUrl ? 'Baixar foto' : 'Foto não disponível'"
                        @click="downloadFoto(item)"
                      >
                        ⬇ {{ item.photos > 0 ? item.photos : '' }}
                      </button>
                    </div>
  
                    <!-- Descrição -->
                    <div class="item-detalhes">
                      <div class="item-desc-titulo">Descrição do problema:</div>
                      <div class="item-desc-texto">{{ item.description }}</div>
                      <div v-if="item.reportedBy" class="item-reporter">
                        Reportado por: {{ item.reportedBy }} {{ formatarData(item.reportedAt) }}
                      </div>
                    </div>
  
                  </div>
  
                  <!-- Item aguardando ou aprovado -->
                  <div v-else class="item-desc-simples">
                    {{ item.description }}
                  </div>
  
                </div>
              </div>
            </div>
  
          </div>
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  defineProps({
    checklist: {
      type: Object,
      required: true
    }
  })
  
  defineEmits(['fechar'])
  
  const comodoAberto = ref(null)
  const itemAberto = ref(null)
  
  function toggleComodo(id) {
    comodoAberto.value = comodoAberto.value === id ? null : id
    itemAberto.value = null
  }
  
  function toggleItem(id) {
    itemAberto.value = itemAberto.value === id ? null : id
  }
  
  function formatarData(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  // Pronto para o futuro — quando o back tiver endpoint de foto
  function downloadFoto(item) {
    if (!item.photoUrl) return
    const link = document.createElement('a')
    link.href = item.photoUrl
    link.download = `foto-${item.name}.jpg`
    link.click()
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: #fff;
    border-radius: 12px;
    width: 640px;
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .modal-header {
    background: #0d0d2b;
    padding: 24px;
    border-radius: 12px 12px 0 0;
    color: #fff;
  }
  
  .modal-titulo { font-size: 1rem; font-weight: bold; }
  .modal-subtitulo { font-size: 0.9rem; margin-top: 4px; }
  .modal-desc { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 4px; }
  
  .progresso-wrapper { margin-top: 16px; }
  .progresso-topo {
    display: flex;
    justify-content: flex-end;
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  .progresso-barra {
    height: 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
    overflow: hidden;
  }
  .progresso-fill {
    height: 100%;
    background: linear-gradient(to right, #00e5cc, #ff6b35);
    border-radius: 4px;
    transition: width 0.3s;
  }
  
  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .comodo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  .comodo-acoes {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .btn-download {
    font-size: 1.1rem;
    cursor: pointer;
    color: #333;
  }
  
  .comodo-itens {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  
  .item { border-radius: 8px; overflow: hidden; }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .item-header-pending { background: #ff6b35; color: #fff; }
  .item-header-waiting { background: #f0f0f0; color: #333; }
  .item-header-approved { background: #e0faf6; color: #333; }
  
  .icone-info {
    background: #0d0d2b;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #fff;
    font-size: 0.85rem;
  }
  
  .icone-aprovado {
    background: #00e5cc;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #0d0d2b;
    font-size: 0.85rem;
  }
  
  .item-conteudo {
    background: #fff9f0;
    border: 1px solid #ffe0b2;
    border-top: none;
  }
  
  .item-problema {
    display: flex;
    gap: 16px;
    padding: 16px;
  }
  
  .item-foto-wrapper {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .item-foto {
    width: 180px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;
    background: #eee;
  }
  
  .item-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .foto-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #aaa;
    font-size: 0.85rem;
    gap: 8px;
  }
  .foto-placeholder span:first-child { font-size: 2rem; }
  
  .btn-download-foto {
    width: 100%;
    padding: 6px 12px;
    background: #0d0d2b;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  
  .btn-download-foto:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .item-detalhes {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .item-desc-titulo { font-weight: bold; font-size: 0.9rem; color: #333; }
  .item-desc-texto { font-size: 0.88rem; color: #444; line-height: 1.5; }
  .item-reporter { font-size: 0.78rem; font-weight: bold; color: #333; margin-top: 8px; }
  
  .item-desc-simples {
    padding: 12px 16px;
    font-size: 0.85rem;
    color: #555;
  }
  </style>