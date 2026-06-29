<template>
  <MainLayout titulo="Não-Conformidades">
    <div class="nc-container">
      
      <div class="filters-card">
        <div class="form-group">
          <label for="building-select">Selecione o Empreendimento:</label>
          <select 
            id="building-select" 
            v-model="selectedBuildingId" 
            @change="carregarNaoConformidades"
            class="form-control"
          >
            <option value="">-- Escolha um empreendimento --</option>
            <option v-for="b in empreendimentos" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="carregando" class="loading-box">
        <span>Carregando não-conformidades...</span>
      </div>

      <div v-else-if="naoConformidades.length > 0" class="table-card">
        <table class="nc-table">
          <thead>
            <tr>
              <th>Bloco / Apto</th>
              <th>Cômodo</th>
              <th>Item de Verificação</th>
              <th>Descrição do Problema</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(nc, index) in naoConformidades" :key="index">
              <td><strong>{{ nc.block }} - {{ nc.apartment }}</strong></td>
              <td>{{ nc.roomName }}</td>
              <td>{{ nc.itemName }}</td>
              <td class="text-danger">{{ nc.description }}</td>
              <td style="text-align: center;">
                <span :class="nc.resolvedAt ? 'badge-resolved' : 'badge-pending'">
                  {{ nc.resolvedAt ? 'Resolvida' : 'Pendente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-card">
        <FontAwesomeIcon :icon="['fas', 'circle-info']" class="empty-icon" />
        <p v-if="!selectedBuildingId">Selecione um empreendimento acima para listar os problemas ativos em aberto.</p>
        <p v-else>Nenhuma não-conformidade ativa pendente foi encontrada para este empreendimento!</p>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../../components/Layout/MainLayout.vue'
import { getBuildings } from '../../services/buildings'
import { getApartments } from '../../services/apartments'
import { getChecklistByApartment } from '../../services/checklists'

const empreendimentos = ref([])
const selectedBuildingId = ref('')
const naoConformidades = ref([])
const carregando = ref(false)

// Carrega os empreendimentos disponíveis logo ao montar a tela
onMounted(async () => {
  try {
    const res = await getBuildings()
    empreendimentos.value = res || []
  } catch (error) {
    console.error('Erro ao buscar empreendimentos:', error)
  }
})

// Faz a agregação minerando a árvore de dados reais vinda do back-end
async function carregarNaoConformidades() {
  if (!selectedBuildingId.value) {
    naoConformidades.value = []
    return
  }

  carregando.value = true
  naoConformidades.value = []

  try {
    // 1. Busca todos os apartamentos do prédio selecionado
    const maisAptos = await getApartments(selectedBuildingId.value)
    const listaAptos = Array.isArray(maisAptos) ? maisAptos : (maisAptos?.data || [])

    // 2. Percorre os checklists de cada apartamento para mapear as NCs pendentes reais
    for (const apto of listaAptos) {
      try {
        const checklistDetail = await getChecklistByApartment(apto.id)
        if (!checklistDetail || !checklistDetail.items) continue

        for (const item of checklistDetail.items) {
          // Só mapeia se o status for NOK e houver registros em visitItems
          if (item.status === 'NOK' && item.visitItems) {
            for (const vi of item.visitItems) {
              const nc = vi?.nonConformity
              
              // Regra de ouro trazida pelo seu back: pendência real tem resolvedAt === null
              if (nc && nc.resolvedAt === null) {
                naoConformidades.value.push({
                  block: checklistDetail.apartment?.block || apto.block || 'N/A',
                  apartment: checklistDetail.apartment?.identifier || apto.identifier || 'N/A',
                  roomName: item.apartmentRoomService?.apartmentRoom?.name || 'Geral',
                  itemName: item.apartmentRoomService?.service?.name || 'Item de Inspeção',
                  description: nc.description || 'Sem descrição informada',
                  resolvedAt: nc.resolvedAt,
                })
              }
            }
          }
        }
      } catch (errCheck) {
        console.warn(`Não foi possível ler dados do checklist para o apartamento ID ${apto.id}:`, errCheck)
      }
    }
  } catch (error) {
    console.error('Erro ao processar agregação de não-conformidades:', error)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.nc-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.filters-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0d0d2b;
}

.form-control {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 0.9rem;
  color: #333;
  outline: none;
}

.form-control:focus {
  border-color: #00e5cc;
}

.loading-box {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  color: #555;
  font-weight: 500;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow-x: auto;
}

.nc-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.nc-table th {
  background: #0d0d2b;
  color: #fff;
  padding: 14px 16px;
  font-weight: 600;
}

.nc-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  color: #444;
}

.nc-table tr:last-child td {
  border-bottom: none;
}

.text-danger {
  color: #c0392b;
  font-weight: 500;
}

.badge-pending {
  background: #f99f56;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge-resolved {
  background: #e0faf6;
  color: #00897b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  border: 1px solid #00e5cc;
}

.empty-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  border: 1px solid #eee;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 2rem;
  color: #b0bec5;
}

.empty-card p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
