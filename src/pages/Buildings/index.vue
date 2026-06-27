<template>
  <MainLayout titulo="Empreendimentos">
    <button class="btn-back" @click="$router.back()">
      <FontAwesomeIcon :icon="['fas', 'arrow-left']" /> Voltar
    </button>

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'buildings' }]" @click="activeTab = 'buildings'">Empreendimentos</button>
      <button :class="['tab-btn', { active: activeTab === 'apartments' }]" @click="activeTab = 'apartments'">Apartamentos</button>
    </div>

    <hr class="divider" />

    <div v-if="activeTab === 'apartments' && !aptMode">
      <div v-if="selectedBuildingId" class="filter-active">
        <FontAwesomeIcon :icon="['fas', 'filter']" />
        Filtrando por: <strong>{{ buildings.find(b => b.id === selectedBuildingId)?.name }}</strong>
        <button class="btn-clear-filter" @click="selectedBuildingId = null">✕ Ver todos</button>
      </div>
      
      <div class="apt-table-header">
        <span>Nome</span><span>Número</span><span>Bloco</span><span>Andar</span><span>Vistoriador</span>
      </div>
      
      <div class="item-list">
        <div v-for="apt in apartmentsFiltered" :key="apt.id" class="apt-row">
          <div class="apt-row-clickable-wrapper" @click="openChecklist(apt)">
            <span>{{ getBuildingName(apt.buildingId) }}</span>
            <span>{{ apt.identifier }}</span>
            <span>{{ apt.block || '—' }}</span>
            <span>{{ apt.floor ? apt.floor + 'º' : '—' }}</span>
          </div>
          
          <div class="apt-assign-inline">
            <template v-if="apt.currentInspectorId">
              <span class="badge-inspector">
                <FontAwesomeIcon :icon="['fas', 'lock']" /> {{ users.find(u => u.id === apt.currentInspectorId)?.name || 'Atribuído' }}
              </span>
            </template>
            <select v-else :value="''" @change="assignInline(apt, $event.target.value)" @click.stop>
              <option value="">Atribuir inspetor...</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
// ... (mantenha os imports e variáveis de estado anteriores)

async function assignInline(apt, userId) {
  if (!userId) return;
  try {
    const checklist = await getChecklistByApartment(apt.id);
    // Verificação de segurança adicional
    if (checklist?.status === 'FINALIZED') {
      alert('Este apartamento já está com o ciclo de vistorias finalizado.');
      return;
    }
    await createVisit(checklist.id, userId);
    // Atualiza localmente o estado do objeto para a badge aparecer sem refresh
    apt.currentInspectorId = Number(userId);
    alert('Vistoriador atribuído com sucesso!');
  } catch (e) {
    console.error(e);
    alert(`Erro ao atribuir: ${e.response?.data?.message || 'Já existe uma vistoria em curso.'}`);
  }
}
</script>

<style scoped>
/* 3. Estilos de UX Melhorados */
.btn-back { background: transparent; border: 1px solid #ccc; padding: 6px 16px; border-radius: 20px; cursor: pointer; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #555; }
.btn-back:hover { background: #f0f0f0; }

.badge-inspector { 
  background: #00e5cc; color: #0d0d2b; padding: 6px 14px; border-radius: 20px; 
  font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; 
  justify-content: center; width: 100%; border: none;
}

.apt-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px 24px; color: #333; margin-bottom: 8px; align-items: center; }
.apt-row-clickable-wrapper { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; cursor: pointer; }

/* Ajustes gerais de layout */
.apt-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; padding: 8px 24px; font-size: 0.8rem; color: #888; font-weight: 700; }
</style>
