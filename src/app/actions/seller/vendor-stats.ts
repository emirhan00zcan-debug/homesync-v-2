"use server";

import { createClient } from '@/lib/supabase/server';

export type VendorStats = {
    productCount: number;
    totalRevenue: number;
    orderCount: number;
    avgRating: number;
};

/**
 * Get dashboard KPI stats for a given store.
 */
export async function getVendorStats(storeId: string): Promise<VendorStats> {
    const supabase = createClient();

    // Product count
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('is_active', true);

    // Get all product IDs for this store — used in joins
    const { data: storeProducts } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId);

    const productIds = (storeProducts ?? []).map(p => p.id);

    let totalRevenue = 0;
    let orderCount = 0;

    if (productIds.length > 0) {
        // Revenue from order_items that contain this store's products
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('price, quantity, order_id')
            .in('product_id', productIds);

        if (orderItems && orderItems.length > 0) {
            totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            orderCount = new Set(orderItems.map(i => i.order_id)).size;
        }
    }

    // Average rating across store products
    let avgRating = 0;
    if (productIds.length > 0) {
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .in('product_id', productIds);

        if (reviews && reviews.length > 0) {
            avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        }
    }

    return {
        productCount: productCount ?? 0,
        totalRevenue,
        orderCount,
        avgRating: Math.round(avgRating * 10) / 10,
    };
}
