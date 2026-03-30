'use client';

export interface TrackableProduct {
    id: string;
    category?: string;
    price?: number;
    name?: string;
}

/**
 * Tracks a product view event. Fire-and-forget — safe to call from any client component.
 */
export async function trackProductView(product: TrackableProduct): Promise<void> {
    try {
        await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_type: 'product_view',
                entity_id: product.id,
                metadata: {
                    category: product.category ?? 'Genel',
                    price: product.price ?? 0,
                    name: product.name ?? '',
                },
            }),
        });
    } catch {
        // Swallow errors — tracking must never break the user experience
    }
}

/**
 * Tracks adding a product to cart.
 */
export async function trackAddToCart(product: TrackableProduct): Promise<void> {
    try {
        await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_type: 'cart_add',
                entity_id: product.id,
                metadata: {
                    category: product.category ?? 'Genel',
                    price: product.price ?? 0,
                    name: product.name ?? '',
                },
            }),
        });
    } catch {
        // Swallow errors
    }
}
