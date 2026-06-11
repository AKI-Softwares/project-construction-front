// src/services/apartmentTypes.js
import api from './api.js'

export async function getApartmentTypes() {
  const response = await api.get('/apartment-types')
  return response.data
}

export async function createApartmentType(data) {
  const response = await api.post('/apartment-types', data)
  return response.data
}