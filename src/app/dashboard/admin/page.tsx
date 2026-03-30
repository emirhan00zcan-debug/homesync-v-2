import React from 'react';
import { Package, Users, ShoppingCart, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminOverview() {
    const supabase = createClient();

    // Fetch counts in parallel
    const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
    ]);

    const productsCount = productsRes.count || 0;
    const ordersCount = ordersRes.count || 0;

    // Calculate total revenue
    const totalRevenue = ordersRes.data?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

    // Data for Admin View
    const stats = [
        { label: 'Toplam Ciro', value: `₺${totalRevenue.toLocaleString()}`, icon: Activity, trend: '+0%' },
        { label: 'Aktif Satıcılar', value: '1', icon: Users, trend: '+0' },
        { label: 'Toplam Ürün', value: productsCount.toString(), icon: Package, trend: `+${productsCount}` },
        { label: 'Aylık Sipariş', value: ordersCount.toString(), icon: ShoppingCart, trend: `+${ordersCount}` },
    ];

    return <AdminDashboard stats={stats} />;
}
