import api from './api.js'

// Não existe uma rota "apartamento -> checklist" direta no back.
// O fluxo real é: GET /checklists?apartmentId=X (lista, 0 ou 1 item, já que
// Checklist.apartmentId é único) e depois GET /checklists/:id para o detalhe
// completo com os itens.
export async function getChecklistByApartment(apartmentId) {
  const list = await api.get('/checklists', { params: { apartmentId } })
  const summary = list.data?.[0]
  if (!summary) return null

  const detail = await api.get(`/checklists/${summary.id}`)
  return detail.data
}

export async function getChecklist(id) {
  const response = await api.get(`/checklists/${id}`)
  return response.data
}

export async function updateChecklistItem(checklistId, itemId, data) {
  const response = await api.patch(`/checklists/${checklistId}/items/${itemId}`, data)
  return response.data
}

export async function updateChecklist(id, data) {
  const response = await api.patch(`/checklists/${id}`, data)
  return response.data
}
