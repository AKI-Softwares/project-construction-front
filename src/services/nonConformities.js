import api from './api.js'

// GET /non-conformities — endpoint dedicado do back, já traz description,
// createdAt, resolvedAt, fotos e o vínculo completo (apartamento, bloco,
// cômodo, serviço, vistoria de origem e inspetor). Filtros aceitos:
// buildingId, inspectorId, status ('open' | 'resolved'), from, to.
export async function getNonConformities(filters = {}) {
  const response = await api.get('/non-conformities', { params: filters })
  return response.data
}
