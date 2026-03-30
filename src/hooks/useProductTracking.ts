'use client';

import { useEffect, useRef } from 'react';

interface UseProductTrackingOptions {
    productId: string;
    category: string | null | undefined;
    price: number | null | undefined;
}

/**
 * Kullanıcı davranış takip hook'u.
 * Ürün detay sayfasına mount edildiğinde POST /api/track/view çağırır.
 * 
 * Fire-and-forget: hatalar sessizce yutulur, UI etkilenmez.
 * Aynı productId için birden fazla mount'ta tekrar çağrılmaz.
 */
export function useProductTracking({ productId, category, price }: UseProductTrackingOptions) {
    const trackedRef = useRef(false);

    useEffect(() => {
        // Aynı sayfa içinde iki kez gönderme (StrictMode double-effect koruması)
        if (trackedRef.current) return;
        if (!productId || !category || price === null || price === undefined) return;

        trackedRef.current = true;

        const track = async () => {
            try {
                await fetch('/api/track/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, category, price }),
                });
            } catch {
                // Sessizce yut — tracking kritik değil
            }
        };

        track();
    }, [productId, category, price]);
}
