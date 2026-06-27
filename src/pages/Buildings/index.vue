<template>
  <MainLayout titulo="Empreendimentos">
    
    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'buildings' }]" @click="activeTab = 'buildings'">
        Empreendimentos
      </button>
      <button :class="['tab-btn', { active: activeTab === 'apartments' }]" @click="activeTab = 'apartments'">
        Apartamentos
      </button>
    </div>

    <hr class="divider" />

    <div class="main-content">
      
      <div v-if="activeTab === 'buildings'">
        </div>

      <div v-if="activeTab === 'apartments'">
        
        <div class="apt-actions">
          <button class="btn-add" @click="aptMode = aptMode === 'single' ? null : 'single'">+ Adicionar Individual</button>
          <button class="btn-batch" @click="aptMode = aptMode === 'batch' ? null : 'batch'">Cadastro em Lote</button>
        </div>

        <div v-if="!aptMode">
          <div class="apt-table-header">
            <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span>
          </div>
          
          <div class="item-list">
            <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
              <div class="apt-row-clickable" @click="openChecklist(apt)">
                <span>{{ getBuildingName(apt.buildingId) }}</span>
                <span>{{ apt.identifier }}</span>
                <span>{{ apt.block || '—' }}</span>
                <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
              </div>
              
              <div class="apt-assign-inline">
                <select 
                  :value="apt.currentInspectorId || ''" 
                  @change="(e) => assignInline(apt, e.target.value)"
                >
                  <option value="">Não atribuído</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
// ... (imports mantidos)

async function assignInline(apt, userId) {
  if (!userId) return;

  // CORREÇÃO: Impedir o envio se o vistoriador for o mesmo ou se já existir vistoria
  if (apt.currentInspectorId && apt.currentInspectorId == userId) return;

  try {
    const checklist = await getChecklistByApartment(apt.id);
    
    // Verificação de segurança adicional
    if (checklist?.status === 'FINALIZED') {
      alert('Este apartamento já teve o ciclo de vistorias finalizado.');
      return;
    }

    // Chamada da API
    await createVisit(checklist.id, userId);
    
    apt.currentInspectorId = Number(userId);
    alert('Vistoriador atribuído com sucesso!');
    
  } catch (e) {
    console.error(e);
    // Tratamento específico para o erro de "Visit already in progress"
    const errorMsg = e.response?.data?.message || 'Erro ao atribuir vistoriador.';
    alert(`Atenção: ${errorMsg}`);
  }
}
</script>

<style scoped>
/* Adicione estas classes para garantir a visibilidade */
.main-content {
  display: block;
  width: 100%;
  min-height: 400px;
}
.apt-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
  background: #333; /* Cor alterada para contraste melhor */
  border-radius: 10px;
  padding: 16px 24px;
  color: #fff;
  margin-bottom: 8px;
  align-items: center;
}
.apt-row-clickable {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  cursor: pointer;
}
</style>
