"use server";

import { createClient } from '@/lib/supabase/server';

export type VendorOrder = {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_name: string | null;
    shipping_city: string | null;
    item_count: number;
};

/**
 * Get orders that contain at least one product from this store.
 */
export async function getVendorOrders(storeId: string): Promise<VendorOrder[]> {
    const supabase = createClient();

    // Get product IDs for this store
    const { data: storeProducts } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId);

    const productIds = (storeProducts ?? []).map(p => p.id);
    if (productIds.length === 0) return [];

    // Get order IDs + item counts for orders that contain these products
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, quantity')
        .in('product_id', productIds);

    if (!orderItems || orderItems.length === 0) return [];

    // Build per-order item count map
    const orderItemCountMap: Record<string, number> = {};
    for (const item of orderItems) {
        orderItemCountMap[item.order_id] = (orderItemCountMap[item.order_id] ?? 0) + item.quantity;
    }

    const orderIds = Object.keys(orderItemCountMap);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount, shipping_name, shipping_city')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[vendor-actions] getVendorOrders error:', error);
        return [];
    }

    return (orders ?? []).map(o => ({
        ...o,
        item_count: orderItemCountMap[o.id] ?? 0,
    }));
}
