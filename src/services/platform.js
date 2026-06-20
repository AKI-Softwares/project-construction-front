import api from './api.js'

// ─── Empresas (WP-02) ───────────────────────────────────────────
export async function getCompanies(status) {
  const params = status ? { status } : {}
  const response = await api.get('/platform/companies', { params })
  return response.data
}

export async function getCompany(id) {
  const response = await api.get(`/platform/companies/${id}`)
  return response.data
}

export async function createCompany(data) {
  const response = await api.post('/platform/companies', data)
  return response.data
}

export async function updateCompany(id, data) {
  const response = await api.patch(`/platform/companies/${id}`, data)
  return response.data
}

export async function updateCompanyStatus(id, status) {
  const response = await api.patch(`/platform/companies/${id}/status`, { status })
  return response.data
}

export async function createCompanyUser(companyId, data) {
  const response = await api.post(`/platform/companies/${companyId}/users`, data)
  return response.data
}

// ─── Role Templates (WP-05) ─────────────────────────────────────
export async function getRoleTemplates() {
  const response = await api.get('/platform/role-templates')
  return response.data
}

export async function createRoleTemplate(data) {
  const response = await api.post('/platform/role-templates', data)
  return response.data
}

export async function updateRoleTemplate(id, data) {
  const response = await api.patch(`/platform/role-templates/${id}`, data)
  return response.data
}

export async function deleteRoleTemplate(id) {
  const response = await api.delete(`/platform/role-templates/${id}`)
  return response.data
}

// ─── Catálogo Global — Serviços (WP-04) ──────────────────────────
export async function getCatalogServices() {
  const response = await api.get('/platform/catalog/services')
  return response.data
}

export async function createCatalogService(data) {
  const response = await api.post('/platform/catalog/services', data)
  return response.data
}

export async function updateCatalogService(id, data) {
  const response = await api.patch(`/platform/catalog/services/${id}`, data)
  return response.data
}

export async function deleteCatalogService(id) {
  const response = await api.delete(`/platform/catalog/services/${id}`)
  return response.data
}

// ─── Catálogo Global — Tipos de Apartamento (WP-03) ──────────────
export async function getCatalogApartmentTypes() {
  const response = await api.get('/platform/catalog/apartment-types')
  return response.data
}

export async function createCatalogApartmentType(data) {
  const response = await api.post('/platform/catalog/apartment-types', data)
  return response.data
}

export async function updateCatalogApartmentType(id, data) {
  const response = await api.patch(`/platform/catalog/apartment-types/${id}`, data)
  return response.data
}

export async function deleteCatalogApartmentType(id) {
  const response = await api.delete(`/platform/catalog/apartment-types/${id}`)
  return response.data
}

// ─── Dashboard da Plataforma (WP-01) ─────────────────────────────
export async function getPlatformOverview(params = {}) {
  const response = await api.get('/platform/analytics/overview', { params })
  return response.data
}

export async function getPlatformUsage(params = {}) {
  const response = await api.get('/platform/analytics/usage', { params })
  return response.data
}

export async function getPlatformGrowth() {
  const response = await api.get('/platform/analytics/growth')
  return response.data
}
