
import api from './api.js'

export async function getVisits() {
  const response = await api.get('/checklists')
  return response.data
}

export async function getVisit(id) {
  const response = await api.get(`/checklists/${id}`)
  return response.data
}
