import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerDashboardClient from '@/components/CustomerDashboardClient';

export default async function CustomerDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Fetch real stats
    const [ordersRes, favoritesRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', user.id),
    ]);

    // Fetch recent orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

    const stats = {
        ordersCount: ordersRes.count || 0,
        favoritesCount: favoritesRes.count || 0,
        installationsCount: 1, // Placeholder until technician system is fully live
    };

    return (
        <CustomerDashboardClient
            user={user}
            stats={stats}
            recentOrders={recentOrders || []}
        />
    );
}
