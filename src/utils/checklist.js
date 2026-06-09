// src/utils/checklist.js

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