/**
 * Utility for generating QR payment image URLs (Paylibo API).
 */

export interface QRPaymentOptions {
    account: string;
    amount: number;
    currency: string;
    variableSymbol?: string;
    message?: string;
}

/**
 * Generates an image URL for the QR code using the Paylibo API (public & free)
 */
export const getQRPaymentImageUrl = (options: QRPaymentOptions): string => {
    const { account, amount, currency, variableSymbol, message } = options;
    
    // account format can be: "prefix-number/bankCode" or "number/bankCode"
    const fullAccPart = account.split('/')[0];
    const bankCode = account.split('/')[1] || '';
    
    let prefix = '';
    let accountNumber = fullAccPart;
    
    if (fullAccPart.includes('-')) {
        const parts = fullAccPart.split('-');
        prefix = parts[0];
        accountNumber = parts[1];
    }
    
    const baseUrl = 'https://api.paylibo.com/paylibo/generator/czech/image';
    const params = new URLSearchParams({
        accountNumber: accountNumber,
        bankCode: bankCode,
        prefix: prefix,
        amount: amount.toString(),
        currency: currency,
        vs: variableSymbol || '',
        message: message || '',
        size: '250'
    });

    return `${baseUrl}?${params.toString()}`;
};
