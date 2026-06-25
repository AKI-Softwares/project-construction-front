// src/utils/checklist.js

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

    // Mapeia todas as não-conformidades vindas do array visitItems
    const ncs = item.visitItems?.map(vi => vi.nonConformity).filter(Boolean) ?? []
    
    // Uma NC é considerada pendente se ainda não foi resolvida (resolvedAt === null)
    const temPendenciaAtiva = ncs.some(nc => nc.resolvedAt === null)

    // Definição do status baseado na regra do Modal:
    // Se o back diz que é NOK e tem pendência ativa -> PENDING (Problema em aberto)
    // Se o back diz que é OK -> APPROVED (Aprovado)
    // Qualquer outro cenário (ex: PENDING no back) -> WAITING (Aguardando vistoria)
    let modalStatus = 'WAITING'
    if (item.status === 'NOK' && temPendenciaAtiva) {
      modalStatus = 'PENDING'
    } else if (item.status === 'OK') {
      modalStatus = 'APPROVED'
    }

    // Pegamos a primeira NC ativa para servir de referência (ou a primeira do array)
    const activeNC = ncs.find(nc => nc.resolvedAt === null) || ncs[0]

    roomsById.get(room.id).items.push({
      id: item.id,
      name: ars.service?.name ?? 'Item sem nome',
      status: modalStatus,
      description: activeNC?.description,
      // Os campos abaixo continuam mapeados por compatibilidade, 
      // mas serão limpos/removidos no passo do ChecklistModal se necessário
      photoUrl: activeNC?.photos?.[0]?.url,
      photos: activeNC?.photos?.length ?? 0,
      reportedBy: activeNC?.reportedBy?.name,
      reportedAt: activeNC?.createdAt,
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
