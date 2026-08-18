// src/utils/permissions.js
//
// Filtra usuários pelo cargo (role) que possuem uma determinada permissão.
// Replica a MESMA regra usada no backend (PATCH /visits/:id/inspector):
// checa se o cargo do usuário tem a action na lista de permissões — sem
// bypass para company admin, pois o backend valida estritamente o cargo
// do usuário-alvo, não de quem está fazendo a chamada.
//
// `roles` deve vir de GET /roles (inclui `permissions: [{ action, ... }]`).
// `users` deve vir de GET /users (inclui `roleId`).
export function filterUsersByPermission(users = [], roles = [], action) {
  const eligibleRoleIds = new Set(
    roles
      .filter((r) => (r.permissions || []).some((p) => p.action === action))
      .map((r) => r.id)
  )
  return users.filter((u) => eligibleRoleIds.has(u.roleId))
}
