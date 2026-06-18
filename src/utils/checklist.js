// src/utils/checklist.js

// Mapa de status: o back usa PENDING/OK/NOK no nível do item de checklist
// (PENDING = ainda não avaliado, OK = aprovado, NOK = reprovado/com pendência).
// O ChecklistModal foi construído em torno do vocabulário PENDING/WAITING/APPROVED
// (PENDING = tem problema registrado, WAITING = aguardando vistoria, APPROVED = ok).
// Mantemos o componente como está e fazemos a tradução aqui, na borda.
const BACKEND_TO_MODAL_STATUS = {
  PENDING: 'WAITING',
  OK: 'APPROVED',
  NOK: 'PENDING',
}

// Converte o checklist retornado por GET /checklists/:id (items em lista
// plana, agrupados via apartmentRoomService.apartmentRoom) no formato
// { rooms: [{ id, name, items: [...] }] } que o ChecklistModal espera.
export function groupChecklistByRoom(checklistDetail) {
  if (!checklistDetail) return null

  const roomsById = new Map()

  for (const item of checklistDetail.items ?? []) {
    const ars = item.apartmentRoomService
    const room = ars?.apartmentRoom
    if (!room) continue

    if (!roomsById.has(room.id)) {
      roomsById.set(room.id, { id: room.id, name: room.name, items: [] })
    }

    // Descrição/foto/autor do problema vêm da não conformidade ligada ao
    // item (via visita). O endpoint atual de GET /checklists/:id ainda não
    // traz esse relacionamento — os campos vêm undefined até o back expor
    // isso, e o modal já trata a ausência de foto/descrição com fallback.
    const nonConformity = item.nonConformity ?? item.visitItem?.nonConformity

    roomsById.get(room.id).items.push({
      id: item.id,
      name: ars.service?.name ?? 'Item sem nome',
      status: BACKEND_TO_MODAL_STATUS[item.status] ?? 'WAITING',
      description: nonConformity?.description,
      photoUrl: nonConformity?.photos?.[0]?.url,
      photos: nonConformity?.photos?.length ?? 0,
      reportedBy: nonConformity?.reportedBy?.name,
      reportedAt: nonConformity?.createdAt,
    })
  }

  return {
    identifier: checklistDetail.apartment?.identifier,
    block: checklistDetail.apartment?.block,
    rooms: [...roomsById.values()],
  }
}

export function getApartmentStatus(checklist) {
  if (!checklist) return 'waiting'
  const items = checklist.rooms.flatMap(r => r.items)
  if (!items.length) return 'waiting'
  if (items.some(i => i.status === 'PENDING')) return 'pending'
  if (items.every(i => i.status === 'APPROVED')) return 'approved'
  return 'waiting'
}

export function getProgress(checklist) {
  if (!checklist) return 0
  const items = checklist.rooms.flatMap(r => r.items)
  if (!items.length) return 0
  return Math.round((items.filter(i => i.status === 'APPROVED').length / items.length) * 100)
}

export function getApprovedPct(checklist) {
  if (!checklist) return 0
  const items = checklist.rooms.flatMap(r => r.items)
  if (!items.length) return 0
  return (items.filter(i => i.status === 'APPROVED').length / items.length) * 100
}

export function getPendingPct(checklist) {
  if (!checklist) return 0
  const items = checklist.rooms.flatMap(r => r.items)
  if (!items.length) return 0
  return (items.filter(i => i.status === 'PENDING').length / items.length) * 100
}

export function getApartmentsSummary(apartments, checklists) {
  let pending = 0, approved = 0, waiting = 0

  for (const apt of apartments) {
    const status = getApartmentStatus(checklists[apt.id])
    if (status === 'pending') pending++
    else if (status === 'approved') approved++
    else waiting++
  }

  const total = apartments.length || 1

  return {
    total: apartments.length,
    pending,
    approved,
    waiting,
    approvedPct: Math.round((approved / total) * 100),
    pendingPct: Math.round((pending / total) * 100),
    waitingPct: Math.round((waiting / total) * 100),
  }
}
