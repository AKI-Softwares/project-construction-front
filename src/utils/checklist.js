export function calcularProgresso(checklist) {
    if (!checklist) return 0
    const itens = checklist.rooms.flatMap(r => r.items)
    if (itens.length === 0) return 0
    const aprovados = itens.filter(i => i.status === 'APPROVED').length
    return Math.round((aprovados / itens.length) * 100)
  }