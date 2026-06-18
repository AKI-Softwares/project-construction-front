import api from './api.js'

export async function getPermissions() {
  const response = await api.get('/permissions')
  return response.data
}
