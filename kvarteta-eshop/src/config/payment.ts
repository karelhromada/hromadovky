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

export const PAYMENT_CONFIG = {
    // Fio Banka (kód 2010). paymentEnv = throw v PROD, fallback v DEV.
    // Production MUSÍ mít VITE_BANK_* nastavené na Vercelu.
    // LÍNÉ gettery (ne eager pole): hodnota se ověří – a v PROD případně vyhodí výjimku –
    // až při SKUTEČNÉM použití (success screen / obchodní podmínky), NE při importu modulu.
    // Eager varianta shazovala celý lazy chunk /checkout do bílé stránky, když env chybělo.
    // Případnou výjimku při renderu teď zachytí globální ErrorBoundary.
    get BANK_ACCOUNT(): string { return paymentEnv('VITE_BANK_ACCOUNT', '2202066277/2010'); },
    get BANK_CODE(): string { return paymentEnv('VITE_BANK_CODE', '2010'); },
    get IBAN(): string { return paymentEnv('VITE_BANK_IBAN', 'CZ4720100000002202066277'); },

    get MERCHANT_ID(): string { return paymentEnv('VITE_GP_WEBPAY_MERCHANT_ID', 'M1HTTEST'); },
    get GATEWAY_URL(): string { return paymentEnv('VITE_GP_WEBPAY_GATEWAY_URL', 'https://test.gpwebpay.com/pgw/pay.do'); },
};

// Lazy getter — throws only when CheckoutPage actually opens Packeta widget,
// not at module import. Lets React ErrorBoundary catch missing key gracefully.
export const SHIPPING_CONFIG = {
    get ZASILKOVNA_API_KEY(): string {
        return import.meta.env.PROD
            ? requireEnv('VITE_ZASILKOVNA_API_KEY')
            : envOr('VITE_ZASILKOVNA_API_KEY', 'abc123test');
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
