import { describe, expect, it } from 'vitest';
import { isCzBankAccount, isCzBankCode, isCzIban, isValidEnvString } from '../envValidation';

describe('isValidEnvString', () => {
    it('přijme běžnou hodnotu', () => {
        expect(isValidEnvString('2202066277/2010')).toBe(true);
    });

    it.each(['', '   ', 'undefined', 'null', 'false', '0', 'NULL', 'None'])(
        'odmítne garbage literál %j',
        (v) => expect(isValidEnvString(v)).toBe(false),
    );

    // Regrese 2026-09-27: Vercel „Sensitive" env → `vercel pull` zapíše "[SENSITIVE]"
    it.each(['[SENSITIVE]', '[REDACTED]', '<value>', ' [SENSITIVE] '])(
        'odmítne placeholder %j',
        (v) => expect(isValidEnvString(v)).toBe(false),
    );

    it('odmítne ne-string', () => {
        expect(isValidEnvString(undefined)).toBe(false);
        expect(isValidEnvString(42)).toBe(false);
    });
});

describe('isCzBankAccount', () => {
    it.each(['2202066277/2010', '19-2000145399/0800', ' 123456/0100 '])('přijme %j', (v) =>
        expect(isCzBankAccount(v)).toBe(true),
    );
    it.each(['[SENSITIVE]', 'CZ4720100000002202066277', '2202066277', '2202066277/201', '2202066277 / 2010', ''])(
        'odmítne %j',
        (v) => expect(isCzBankAccount(v)).toBe(false),
    );
});

describe('isCzBankCode', () => {
    it('přijme čtyřmístný kód', () => expect(isCzBankCode('2010')).toBe(true));
    it.each(['[SENSITIVE]', '201', '20100', 'abcd'])('odmítne %j', (v) => expect(isCzBankCode(v)).toBe(false));
});

describe('isCzIban', () => {
    it.each(['CZ4720100000002202066277', 'CZ47 2010 0000 0022 0206 6277', 'cz4720100000002202066277'])(
        'přijme %j',
        (v) => expect(isCzIban(v)).toBe(true),
    );
    it.each(['[SENSITIVE]', 'CZ47201000000022020662', 'DE89370400440532013000', '2202066277/2010'])(
        'odmítne %j',
        (v) => expect(isCzIban(v)).toBe(false),
    );
});
