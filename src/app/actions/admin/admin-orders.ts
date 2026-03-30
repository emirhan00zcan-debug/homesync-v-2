"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("status") as string;

    if (!orderId || !newStatus) return;

    const supabase = createClient();
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error("Failed to update order status via Supabase:", error);
        return;
    }

    revalidatePath("/dashboard/admin/orders");
}
