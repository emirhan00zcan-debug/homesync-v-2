import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VendorEarningsClient from '@/components/VendorEarningsClient';

export default async function VendorEarningsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, commission_rate')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'vendor') redirect('/dashboard');

    const commissionRate = Number(profile.commission_rate ?? 15);

    // Tüm order items'ı çek
    const { data: items } = await supabase
        .from('order_items')
        .select('unit_price, quantity, vendor_earning, created_at, product_id, products(name)')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    const totalGross = items?.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0) ?? 0;
    const totalNet = items?.reduce((s, i) => s + Number(i.vendor_earning ?? 0), 0) ?? 0;
    const totalCommission = totalGross - totalNet;
    const pendingPayout = totalNet; // Basit model: tümü bekliyor

    // Aylık kırılım
    const monthMap: Record<string, { gross: number; net: number; commission: number }> = {};
    items?.forEach(item => {
        const date = new Date(item.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        if (!monthMap[key]) monthMap[key] = { gross: 0, net: 0, commission: 0 };
        const gross = Number(item.unit_price) * Number(item.quantity);
        const net = Number(item.vendor_earning ?? 0);
        monthMap[key].gross += gross;
        monthMap[key].net += net;
        monthMap[key].commission += gross - net;
    });
    const monthlyBreakdown = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, val]) => {
            const [year, month] = key.split('-');
            const date = new Date(Number(year), Number(month) - 1);
            return {
                month: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
                ...val,
            };
        });

    // En çok satan ürünler
    const productMap: Record<string, { name: string; revenue: number; orders: number }> = {};
    items?.forEach(item => {
        const pid = item.product_id ?? 'unknown';
        const pname = (item.products as any)?.name ?? 'Bilinmeyen Ürün';
        if (!productMap[pid]) productMap[pid] = { name: pname, revenue: 0, orders: 0 };
        productMap[pid].revenue += Number(item.unit_price) * Number(item.quantity);
        productMap[pid].orders += 1;
    });
    const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return (
        <VendorEarningsClient
            data={{ totalGross, totalNet, totalCommission, pendingPayout, commissionRate, monthlyBreakdown, topProducts }}
        />
    );
}
