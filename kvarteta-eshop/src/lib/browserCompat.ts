/**
 * Obaly kolem prohlížečových API, která na produkci selhávají tam, kde na devu fungují:
 * - Safari s „Blokovat všechny cookies" hází SecurityError už při čtení localStorage
 * - crypto.randomUUID chybí na iOS ≤ 15.3 (Safari 15.4+) → TypeError uprostřed objednávky
 */

export function safeStorageGet(storage: 'local' | 'session', key: string): string | null {
  try {
    return (storage === 'local' ? window.localStorage : window.sessionStorage).getItem(key)
  } catch {
    return null
  }
}

export function safeStorageSet(storage: 'local' | 'session', key: string, value: string): boolean {
  try {
    ;(storage === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value)
    return true
  } catch {
    // Blokované úložiště nebo překročená kvóta — aplikace musí běžet dál
    return false
  }
}

export function safeStorageRemove(storage: 'local' | 'session', key: string): void {
  try {
    ;(storage === 'local' ? window.localStorage : window.sessionStorage).removeItem(key)
  } catch {
    /* prázdné záměrně — nedostupné úložiště není chyba, kterou by šlo řešit */
  }
}

/** crypto.randomUUID s fallbackem přes getRandomValues (RFC 4122 v4). */
export function randomUUID(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()

  const bytes = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // verze 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // varianta RFC 4122
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
