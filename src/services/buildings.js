import api from './api.js'

export async function getBuilding(id) {
  const response = await api.get(`/buildings/${id}`)
  return response.data
}
// Adicionando a função que a página está exigindo:
export async function createBuilding(data) {
  const response = await api.post('/buildings', data)
  return response.data
}
