/**
 * Čisté validátory build-time env hodnot (bez závislosti na import.meta.env → testovatelné).
 *
 * Proč existují: CI/CLI občas místo hodnoty dodá literál. Konkrétní případy z praxe:
 *  - "undefined" / "null" – špatná substituce v pipeline,
 *  - "[SENSITIVE]" – Vercel proměnné označené jako „Sensitive" nejdou přes `vercel pull`
 *    přečíst, CLI zapíše tento placeholder a ten se zapeče do bundlu (2026-09-27: pokladna
 *    zobrazovala „Číslo účtu: [SENSITIVE]" a QR platba přes Paylibo dostala 400).
 * Blacklist literálů nestačí, proto bankovní údaje navíc kontrolujeme na tvar.
 */

const ENV_GARBAGE_LITERALS = new Set(['undefined', 'null', 'false', '0', 'NULL', 'None']);

/** Placeholdery typu "[SENSITIVE]", "[REDACTED]", "<value>" apod. */
const PLACEHOLDER_RE = /^[[<][A-Za-z_ -]+[\]>]$/;

export function isValidEnvString(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed.length === 0) return false;
    if (ENV_GARBAGE_LITERALS.has(trimmed)) return false;
    return !PLACEHOLDER_RE.test(trimmed);
}

/** České číslo účtu ve tvaru "[předčíslí-]číslo/kódbanky", např. "2202066277/2010" nebo "19-123456/0100". */
export function isCzBankAccount(value: string): boolean {
    return /^(\d{1,6}-)?\d{2,10}\/\d{4}$/.test(value.trim());
}

export function isCzBankCode(value: string): boolean {
    return /^\d{4}$/.test(value.trim());
}

/** Český IBAN: "CZ" + 2 kontrolní číslice + 20 číslic (mezery tolerujeme). */
export function isCzIban(value: string): boolean {
    return /^CZ\d{22}$/.test(value.replace(/\s+/g, '').toUpperCase());
}
