import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VendorStatsClient from '@/components/VendorStatsClient';

export default async function VendorStatsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'vendor') redirect('/dashboard');

    // Ürünleri ve istatistiklerini çek
    const { data: products } = await supabase
        .from('products')
        .select('id, name, view_count, like_count, status')
        .eq('vendor_id', user.id)
        .order('view_count', { ascending: false });

    // Her ürün için sipariş sayısı ve geliri hesapla
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, unit_price, quantity')
        .eq('vendor_id', user.id);

    const productStats = (products ?? []).map(product => {
        const relatedItems = orderItems?.filter(i => i.product_id === product.id) ?? [];
        const order_count = relatedItems.length;
        const revenue = relatedItems.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
        return {
            id: product.id,
            name: product.name,
            view_count: product.view_count ?? 0,
            like_count: product.like_count ?? 0,
            order_count,
            revenue,
            status: product.status ?? 'pending',
        };
    });

    return <VendorStatsClient products={productStats} />;
}
