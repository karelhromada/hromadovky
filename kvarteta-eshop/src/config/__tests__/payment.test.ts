import { afterEach, describe, expect, it, vi } from 'vitest';
import { PAYMENT_CONFIG } from '../payment';

// Regrese 2026-09-27: Vercel „Sensitive" env se přes `vercel pull` zapekla do bundlu jako
// literál "[SENSITIVE]" → pokladna ukazovala „Číslo účtu: [SENSITIVE]" a QR platba selhala.
// PAYMENT_CONFIG má líné gettery, takže stubnutý env se projeví při každém čtení.
describe('PAYMENT_CONFIG – fallback při neplatné env hodnotě', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('placeholder [SENSITIVE] → zabudované Fio údaje', () => {
        vi.stubEnv('VITE_BANK_ACCOUNT', '[SENSITIVE]');
        vi.stubEnv('VITE_BANK_CODE', '[SENSITIVE]');
        vi.stubEnv('VITE_BANK_IBAN', '[SENSITIVE]');
        expect(PAYMENT_CONFIG.BANK_ACCOUNT).toBe('2202066277/2010');
        expect(PAYMENT_CONFIG.BANK_CODE).toBe('2010');
        expect(PAYMENT_CONFIG.IBAN).toBe('CZ4720100000002202066277');
    });

    it('hodnota špatného tvaru (IBAN místo čísla účtu) → fallback', () => {
        vi.stubEnv('VITE_BANK_ACCOUNT', 'CZ4720100000002202066277');
        expect(PAYMENT_CONFIG.BANK_ACCOUNT).toBe('2202066277/2010');
    });

    it('platná hodnota z env se použije (ořezaná)', () => {
        vi.stubEnv('VITE_BANK_ACCOUNT', ' 19-123456/0100 ');
        vi.stubEnv('VITE_BANK_IBAN', 'CZ6508000000192000145399');
        expect(PAYMENT_CONFIG.BANK_ACCOUNT).toBe('19-123456/0100');
        expect(PAYMENT_CONFIG.IBAN).toBe('CZ6508000000192000145399');
    });
});
