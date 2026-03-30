import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VendorDashboardClient from '@/components/VendorDashboardClient';

export default async function VendorDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, commission_rate, vendor_status, role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'satici' && profile.role !== 'vendor')) redirect('/dashboard');

    // Ürün sayısı
    const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', user.id)
        .eq('is_active', true);

    // Sipariş sayısı ve gelir
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('unit_price, quantity, commission_rate, vendor_earning')
        .eq('vendor_id', user.id);

    const grossRevenue = orderItems?.reduce((sum, item) =>
        sum + (Number(item.unit_price) * Number(item.quantity)), 0) ?? 0;
    const netRevenue = orderItems?.reduce((sum, item) =>
        sum + Number(item.vendor_earning ?? 0), 0) ?? 0;

    const { count: orderCount } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

    const stats = {
        productCount: productCount ?? 0,
        orderCount: orderCount ?? 0,
        grossRevenue,
        netRevenue,
        commissionRate: Number(profile.commission_rate ?? 15),
        vendorStatus: profile.vendor_status ?? 'PENDING',
        fullName: profile.full_name,
    };

    return <VendorDashboardClient stats={stats} />;
}
