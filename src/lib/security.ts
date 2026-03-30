/**
 * Utility functions for KVKK compliant data masking
 */

/**
 * Masks a phone number: 05321234567 -> 0532***4567 or 0532***12
 * Rule: 0532***12 as requested by Ajan 4
 */
export const maskPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '***';
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 7) return cleanPhone.slice(0, 4) + '***';
    return `${cleanPhone.slice(0, 4)}***${cleanPhone.slice(-2)}`;
};

/**
 * Masks an address: Atatürk Mah. Gül Sok. No:5 -> Atatürk Mah. ***
 */
export const maskAddress = (address: string | null | undefined): string => {
    if (!address) return '***';
    const parts = address.split(' ');
    if (parts.length <= 1) return '***';
    return `${parts[0]} ${parts[1]} ***`;
};

/**
 * Checks if sensitive data should be revealed
 * @param jobStatus Current status of the service request/offer
 * @returns boolean
 */
export const shouldRevealData = (jobStatus: string): boolean => {
    const privilegedStatuses = ['accepted', 'usta_atandi', 'completed', 'in_progress'];
    return privilegedStatuses.includes(jobStatus.toLowerCase());
};
