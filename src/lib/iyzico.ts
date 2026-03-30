import crypto from 'crypto';

interface IyzicoConfig {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
}

const config: IyzicoConfig = {
    apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
    secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
};

/**
 * Generates Iyzico HMAC signature for requests.
 * @param randomString A random string for the request
 * @param secretKey The Iyzico secret key
 * @param payload The request payload or empty string
 */
export const generateSignature = (randomString: string, secretKey: string, payload: string = ''): string => {
    const data = randomString + secretKey + payload;
    return crypto.createHash('sha1').update(data).digest('hex');
};

/**
 * Common headers for Iyzico requests.
 */
const getHeaders = (randomString: string, signature: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `IYZIPAY ${config.apiKey}:${signature}`,
    'x-iyzipay-rnd': randomString,
});

/**
 * Marketplace Sub-Merchant Request
 */
export async function createSubMerchant(data: any) {
    const randomString = Math.random().toString(36).substring(7);
    const payload = JSON.stringify(data);
    const signature = generateSignature(randomString, config.secretKey, payload);

    const response = await fetch(`${config.baseUrl}/onboarding/submerchant`, {
        method: 'POST',
        headers: getHeaders(randomString, signature),
        body: payload,
    });

    return await response.json();
}

/**
 * Marketplace Payment Initialization (Checkout Form)
 */
export async function initializeCheckoutForm(data: any) {
    const randomString = Math.random().toString(36).substring(7);
    const payload = JSON.stringify(data);
    const signature = generateSignature(randomString, config.secretKey, payload);

    const response = await fetch(`${config.baseUrl}/payment/iyzipay/checkoutform/initialize/auth/ecom`, {
        method: 'POST',
        headers: getHeaders(randomString, signature),
        body: payload,
    });

    return await response.json();
}

/**
 * Confirm / Approve Payment (Escrow Release)
 * This is the marketplace specific "Approval" step.
 */
export async function approvePaymentItem(paymentTransactionId: string) {
    const randomString = Math.random().toString(36).substring(7);
    const payload = JSON.stringify({ paymentTransactionId });
    const signature = generateSignature(randomString, config.secretKey, payload);

    const response = await fetch(`${config.baseUrl}/payment/iyzipay/item/approve`, {
        method: 'POST',
        headers: getHeaders(randomString, signature),
        body: payload,
    });

    return await response.json();
}

/**
 * Split Payment Logic Helper
 */
export const calculateSplit = (totalAmount: number, commissionRate: number) => {
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const subMerchantPrice = totalAmount - commissionAmount;
    return {
        commissionAmount: commissionAmount.toFixed(2),
        subMerchantPrice: subMerchantPrice.toFixed(2)
    };
};
