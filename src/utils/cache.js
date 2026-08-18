// src/utils/cache.js
//
// Cache simples em memória (Map), com TTL, para evitar refetch
// desnecessário em telas de listagem (Vistorias, Re-inspeções,
// Empreendimentos, Não-Conformidades).
//
// Propositalmente SEM dependências externas (sem @tanstack/vue-query nem
// SWR) — isso evitaria alterar package.json/lockfile, o que exigiria
// `npm install` e não é seguro colando arquivos direto no GitHub sem
// terminal. O cache vive apenas durante a sessão da SPA (reseta com F5),
// o que já elimina a maior parte dos refetches redundantes ao navegar
// entre telas.

const store = new Map()

export function getCached(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function setCached(key, value, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

// Remove todas as entradas cuja chave comece com o prefixo — usado para
// invalidar o cache de uma lista inteira após criar/editar/excluir algo.
export function invalidateCache(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

// Busca com cache: só chama fetchFn se não houver valor válido guardado.
export async function cachedFetch(key, fetchFn, ttlMs = 60_000) {
  const cached = getCached(key)
  if (cached !== undefined) return cached
  const value = await fetchFn()
  setCached(key, value, ttlMs)
  return value
}
