import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerOrdersClient from '@/components/CustomerOrdersClient';

export default async function CustomerOrdersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Kullanıcının kendi siparişlerini ve ilgili ürünleri çek
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            payment_status,
            created_at,
            order_items (
                id,
                quantity,
                unit_price,
                products (
                    id,
                    name,
                    image_url
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Siparişler çekilirken hata oluştu:", error);
    }

    return <CustomerOrdersClient orders={orders as any || []} />;
}
