import api from './api.js'

export async function getBuildings() {
  const response = await api.get('/buildings')
  return response.data
}

// Adicionando a função que a página está exigindo:
export async function createBuilding(data) {
  const response = await api.post('/buildings', data)
  return response.data
}
