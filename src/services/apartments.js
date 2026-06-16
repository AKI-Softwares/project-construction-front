import api from './api.js'
import { mockApartments } from '../mocks/buildings.js'

<<<<<<< HEAD
const USE_MOCK = true
=======
const USE_MOCK = true // muda para false quando o CORS liberar
>>>>>>> origin/main

export async function getApartments(buildingId) {
  if (USE_MOCK) return mockApartments
  const response = await api.get(`/apartments?buildingId=${buildingId}`)
  return response.data
}

export async function getApartment(id) {
  if (USE_MOCK) return mockApartments.find(a => a.id === Number(id))
  const response = await api.get(`/apartments/${id}`)
  return response.data
}