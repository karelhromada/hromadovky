export const PAYMENT_CONFIG = {
    // Bankovní spojení pro QR platby
    BANK_ACCOUNT: '670100-2202858274', // Předčíslí a číslo účtu
    BANK_CODE: '6210', // mBank
    IBAN: 'CZ0762100000002202858274', // Odpovídá mBank account

    // GP Webpay / ČSOB eAPI - Merchant údaje
    // Získáte od své banky po podpisu smlouvy
    MERCHANT_ID: 'M1HTTEST',
    GATEWAY_URL: 'https://test.gpwebpay.com/pgw/pay.do', // Testovací URL
};

export const SHIPPING_CONFIG = {
    ZASILKOVNA_API_KEY: 'abc123test',
};

export const AUTOMATION_CONFIG = {
    N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.hromadovky.cz/webhook/new-order',
};
