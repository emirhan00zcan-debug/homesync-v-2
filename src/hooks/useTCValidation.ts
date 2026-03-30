import React, { useMemo } from 'react';
import { validateTCNo } from '@/lib/validation';

export const useTCValidation = (tcNo: string) => {
    const result = useMemo(() => {
        if (!tcNo) {
            return { isValid: null, error: null };
        }

        if (tcNo.length !== 11) {
            return { isValid: false, error: 'T.C. Kimlik numarası 11 haneli olmalıdır.' };
        }

        if (!/^\d+$/.test(tcNo)) {
            return { isValid: false, error: 'T.C. Kimlik numarası sadece rakamlardan oluşmalıdır.' };
        }

        if (tcNo.startsWith('0')) {
            return { isValid: false, error: 'T.C. Kimlik numarası 0 ile başlayamaz.' };
        }

        const valid = validateTCNo(tcNo);
        return {
            isValid: valid,
            error: valid ? null : 'Geçersiz T.C. Kimlik numarası.'
        };
    }, [tcNo]);

    return result;
};
