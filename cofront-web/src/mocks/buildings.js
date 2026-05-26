export const mockBuildings = [
    {
      id: 1,
      name: "Residencial Boa Vista",
      address: "Rua das Flores, 100, São Paulo, SP",
      _count: { apartments: 24 }
    },
    {
      id: 2,
      name: "Residencial Jardim das Flores",
      address: "Av. Brasil, 200, São Paulo, SP",
      _count: { apartments: 18 }
    },
    {
      id: 3,
      name: "Residencial Céu Azul",
      address: "Rua das Palmeiras, 300, São Paulo, SP",
      _count: { apartments: 30 }
    }
  ]
  
  export const mockApartments = [
    {
      id: 1,
      identifier: "101",
      floor: 1,
      block: "A",
      area: 85,
      status: "APPROVED",
      checklistProgress: 100,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    },
    {
      id: 2,
      identifier: "102",
      floor: 1,
      block: "A",
      area: 85,
      status: "APPROVED",
      checklistProgress: 100,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    },
    {
      id: 3,
      identifier: "103",
      floor: 1,
      block: "A",
      area: 85,
      status: "APPROVED",
      checklistProgress: 100,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    },
    {
      id: 4,
      identifier: "104",
      floor: 1,
      block: "A",
      area: 85,
      status: "WAITING",
      checklistProgress: 0,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    },
    {
      id: 5,
      identifier: "105",
      floor: 1,
      block: "B",
      area: 85,
      status: "PENDING",
      checklistProgress: 75,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    },
    {
      id: 6,
      identifier: "106",
      floor: 1,
      block: "B",
      area: 85,
      status: "WAITING",
      checklistProgress: 30,
      inspectionDate: "2026-04-20T00:00:00.000Z"
    }
  ]

  export const mockChecklists = {
    1: {
      apartmentId: 1,
      identifier: "101",
      block: "Bloco A",
      progress: 100,
      rooms: [
        {
          id: 1,
          name: "Sala Estar/Jantar",
          items: [
            { id: 1, name: "Pintura teto", status: "APPROVED", description: "Aprovado sem ressalvas.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 2, name: "Laminado", status: "APPROVED", description: "Fixação e nivelamento ok.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 2,
          name: "Banheiro",
          items: [
            { id: 3, name: "Revestimento", status: "APPROVED", description: "Rejunte e nivelamento ok.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        }
      ]
    },
    2: {
      apartmentId: 2,
      identifier: "102",
      block: "Bloco A",
      progress: 100,
      rooms: [
        {
          id: 1,
          name: "Sala Estar/Jantar",
          items: [
            { id: 1, name: "Pintura teto", status: "APPROVED", description: "Aprovado sem ressalvas.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 2, name: "Rodapé", status: "APPROVED", description: "Fixação ok.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 2,
          name: "Quarto",
          items: [
            { id: 3, name: "Pintura parede", status: "APPROVED", description: "Acabamento ok.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        }
      ]
    },
    3: {
      apartmentId: 3,
      identifier: "103",
      block: "Bloco A",
      progress: 100,
      rooms: [
        {
          id: 1,
          name: "Cozinha",
          items: [
            { id: 1, name: "Revestimento", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 2, name: "Pintura teto", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        }
      ]
    },
    4: {
      apartmentId: 4,
      identifier: "104",
      block: "Bloco A",
      progress: 0,
      rooms: [
        {
          id: 1,
          name: "Sala Estar/Jantar",
          items: [
            { id: 1, name: "Pintura teto", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 2, name: "Laminado", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 2,
          name: "Banheiro",
          items: [
            { id: 3, name: "Louças", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        }
      ]
    },
    5: {
      apartmentId: 5,
      identifier: "105",
      block: "Bloco B",
      progress: 75,
      rooms: [
        {
          id: 1,
          name: "Sala Estar/Jantar",
          items: [
            { id: 1, name: "Pintura teto", status: "PENDING", description: "A pintura do teto está com o acabamento ruim, precisa de outra mão de tinta.", reportedBy: "Beatriz Santos - Estagiária", reportedAt: "2026-05-06T00:00:00.000Z", photos: 1 },
            { id: 2, name: "Revestimento de paredes", status: "PENDING", description: "Verificar nivelamento e rejunte.", reportedBy: "Beatriz Santos - Estagiária", reportedAt: "2026-05-06T00:00:00.000Z", photos: 0 },
            { id: 3, name: "Rodapé", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 4, name: "Laminado", status: "APPROVED", description: "Fixação e nivelamento ok.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 2,
          name: "Quarto Menor",
          items: [
            { id: 5, name: "Pintura teto", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 6, name: "Pintura parede", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 3,
          name: "Banheiro",
          items: [
            { id: 7, name: "Revestimento", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 8, name: "Louças", status: "PENDING", description: "Fixação e vedação com problema.", reportedBy: "Beatriz Santos - Estagiária", reportedAt: "2026-05-06T00:00:00.000Z", photos: 2 },
          ]
        }
      ]
    },
    6: {
      apartmentId: 6,
      identifier: "106",
      block: "Bloco B",
      progress: 30,
      rooms: [
        {
          id: 1,
          name: "Sala Estar/Jantar",
          items: [
            { id: 1, name: "Pintura teto", status: "APPROVED", description: "Aprovado.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 2, name: "Laminado", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        },
        {
          id: 2,
          name: "Quarto",
          items: [
            { id: 3, name: "Pintura parede", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
            { id: 4, name: "Rodapé", status: "WAITING", description: "Aguardando vistoria.", reportedBy: null, reportedAt: null, photos: 0 },
          ]
        }
      ]
    }
  }