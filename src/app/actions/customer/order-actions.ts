"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ShippingInfo, OrderItem } from '@/types';

// Keep signature for compatibility if used elsewhere, but route through Supabase
export async function createOrder(
    customerId: string,
    items: OrderItem[],
    totalAmount: number,
    shipping: ShippingInfo
) {
    try {
        const supabase = createClient();

        const { data: order, error } = await supabase.from('orders').insert({
            user_id: customerId,
            total_amount: totalAmount,
            shipping_name: shipping.fullName,
            shipping_phone: shipping.phone,
            shipping_email: shipping.email,
            shipping_city: shipping.city,
            shipping_address: shipping.address,
            status: 'PAID',
        }).select().single();

        if (error || !order) throw new Error(error?.message || "Insert failed");

        // Insert order items
        const preparedItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(preparedItems);
        if (itemsError) throw itemsError;

        // 3. Reduce product stocks
        for (const item of items) {
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('stock_count')
                .eq('id', item.productId)
                .single();

            if (product && !productError) {
                const newStock = Math.max(0, product.stock_count - item.quantity);
                await supabase
                    .from('products')
                    .update({ stock_count: newStock })
                    .eq('id', item.productId);
            }
        }

        revalidatePath('/dashboard/customer');
        revalidatePath('/dashboard/vendor');

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Failed to create order via Supabase:", error);
        return { success: false, error: "Sipariş oluşturulamadı." };
    }
}
