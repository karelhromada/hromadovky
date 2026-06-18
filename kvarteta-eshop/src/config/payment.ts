// CI pipelines občas substituují env špatně a vrátí literál místo hodnoty (např. "undefined",
// "null", "false") nebo whitespace-only string. Tyto případy odmítáme jako neplatné, aby selhání
// bylo viditelné při startu, ne při tichém poslání garbage do platební brány.
const ENV_GARBAGE_LITERALS = new Set(['undefined', 'null', 'false', '0', 'NULL', 'None']);

function isValidEnvString(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length > 0 && !ENV_GARBAGE_LITERALS.has(trimmed);
}

function requireEnv(key: string): string {
    const value = import.meta.env[key];
    if (!isValidEnvString(value)) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function envOr(key: string, fallback: string): string {
    const value = import.meta.env[key];
    return isValidEnvString(value) ? value : fallback;
}

// Build-time check: in PROD, payment gateway and merchant ID MUST come from env.
// Test fallbacks below only apply in dev — they prevent accidental "platba jde na test gateway"
// scenarios in production.
function paymentEnv(key: string, devFallback: string): string {
    if (import.meta.env.PROD) return requireEnv(key);
    return envOr(key, devFallback);
}

// Bankovní údaje (číslo účtu / IBAN) NEjsou tajné a jejich správné Fio hodnoty držíme
// i jako fallback. Na rozdíl od platební brány zde v produkci NEházíme výjimku při
// chybějícím env – jen použijeme fallback a varujeme v konzoli. (Dřív eager `requireEnv`
// shazoval celou pokladnu do bílé stránky, když VITE_BANK_* na Vercelu chybělo.)
function bankEnv(key: string, fallback: string): string {
    const value = import.meta.env[key];
    if (isValidEnvString(value)) return value;
    if (import.meta.env.PROD) {
        console.warn(`[payment] ${key} není nastavené v produkci – používám zabudovaný fallback. Doplň ho do Vercel env.`);
    }
    return fallback;
}

export const PAYMENT_CONFIG = {
    // Fio Banka (kód 2010). LÍNÉ gettery (ne eager pole) – hodnota se čte až při použití,
    // ne při importu modulu (eager varianta shazovala /checkout do bílé stránky).
    // Bankovní údaje používají bankEnv = fallback + warn (nehází), platební brána paymentEnv = throw v PROD.
    get BANK_ACCOUNT(): string { return bankEnv('VITE_BANK_ACCOUNT', '2202066277/2010'); },
    get BANK_CODE(): string { return bankEnv('VITE_BANK_CODE', '2010'); },
    get IBAN(): string { return bankEnv('VITE_BANK_IBAN', 'CZ4720100000002202066277'); },

    get MERCHANT_ID(): string { return paymentEnv('VITE_GP_WEBPAY_MERCHANT_ID', 'M1HTTEST'); },
    get GATEWAY_URL(): string { return paymentEnv('VITE_GP_WEBPAY_GATEWAY_URL', 'https://test.gpwebpay.com/pgw/pay.do'); },
};

// Veřejný klíč widgetu Zásilkovny (běží v prohlížeči zákazníka → NENÍ tajný, stejně skončí
// v JS bundlu). envOr = použij VITE_ZASILKOVNA_API_KEY z env, jinak zabudovaný reálný klíč.
// Funguje v produkci i bez nastavení na Vercelu a nikdy nehází (dřív requireEnv shazoval
// výběr výdejního místa v onClick handleru, kde to ErrorBoundary nezachytí).
export const SHIPPING_CONFIG = {
    get ZASILKOVNA_API_KEY(): string {
        return envOr('VITE_ZASILKOVNA_API_KEY', '406593160937e8ff');
    },
};

export const AUTOMATION_CONFIG = {
    N8N_WEBHOOK_URL: envOr('VITE_N8N_WEBHOOK_URL', 'https://n8n.hromadovky.cz/webhook/new-order'),
    N8N_CREDIT_NOTE_WEBHOOK_URL: envOr(
        'VITE_N8N_CREDIT_NOTE_WEBHOOK_URL',
        'https://n8n.hromadovky.cz/webhook/dobropis',
    ),
    N8N_WEBHOOK_SECRET: envOr('VITE_N8N_WEBHOOK_SECRET', ''),
};
