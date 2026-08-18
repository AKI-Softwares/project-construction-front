import api from './api.js'
import { cachedFetch } from '../utils/cache.js'

function filtersKey(filters) {
  const sorted = Object.keys(filters).sort().map((k) => `${k}=${filters[k]}`).join('&')
  return `nonconformities:list:${sorted}`
}

// GET /non-conformities — endpoint dedicado do back, já traz description,
// createdAt, resolvedAt, fotos e o vínculo completo (apartamento, bloco,
// cômodo, serviço, vistoria de origem e inspetor). Filtros aceitos:
// buildingId, inspectorId, status ('open' | 'resolved'), from, to.
// Cache curto (20s) por combinação de filtros.
export async function getNonConformities(filters = {}) {
  return cachedFetch(filtersKey(filters), async () => {
    const response = await api.get('/non-conformities', { params: filters })
    return response.data
  }, 20_000)
}
