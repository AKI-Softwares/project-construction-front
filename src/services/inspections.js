import api from './api.js'

const USE_MOCK = false

const mockInspections = [
  { id: 1, status: 'APPROVED' },
  { id: 2, status: 'APPROVED' },
  { id: 3, status: 'WAITING' },
  { id: 4, status: 'WAITING' },
  { id: 5, status: 'PENDING' },
  { id: 6, status: 'PENDING' },
  { id: 7, status: 'PENDING' },
]

export async function getInspections() {
  if (USE_MOCK) return mockInspections
  const response = await api.get('/inspections')
  return response.data
}