import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import OrdersClient, { OrderItemType } from './OrdersClient';

export default async function VendorOrdersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get order items for this vendor, joined with orders and customer profile
    const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
            id, 
            quantity, 
            unit_price, 
            vendor_earning, 
            order_id, 
            created_at, 
            orders(id, status, tracking_number, user_id, created_at, profiles(full_name)), 
            products(name, category)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    // Ensure we typecast or normalize the items
    const rawItems = orderItems || [];

    // Process items to ensure order & product relations are properly formed for the client.
    const safeItems: OrderItemType[] = rawItems.map(item => {
        // Handle array relations (PostgREST can sometimes return arrays for joins depending on schema)
        const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        const productData = Array.isArray(item.products) ? item.products[0] : item.products;

        // Similarly for profiles inside order if returned as array
        const profileData = orderData?.profiles
            ? (Array.isArray(orderData.profiles) ? orderData.profiles[0] : orderData.profiles)
            : null;

        return {
            id: item.id,
            quantity: item.quantity,
            unit_price: Number(item.unit_price) || 0,
            vendor_earning: Number(item.vendor_earning) || 0,
            created_at: item.created_at,
            orders: {
                id: orderData?.id,
                status: orderData?.status || 'yeni',
                created_at: orderData?.created_at,
                tracking_number: orderData?.tracking_number,
                user_id: orderData?.user_id,
                profiles: profileData ? { full_name: profileData.full_name } : undefined
            },
            products: {
                name: productData?.name || 'Ürün',
                category: productData?.category || 'Kategori'
            }
        };
    }) as any[]; // Type coercion handled in mapping above anyway, we are satisfying OrderItemType

    const total = safeItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

    return (
        <div className="space-y-8">
            {/* Header section remains identical for layout consistency */}
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-radiant-amber opacity-80">Satıcı Paneli</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                    <ShoppingCart className="text-radiant-amber" size={36} />
                    Siparişlerim
                </h1>
                <p className="text-white/40 text-sm mt-3 font-medium">Sipariş süreçlerinizi detaylı olarak takip edin ve teslimatlarınızı yönetin.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Toplam Sipariş', value: safeItems.length },
                    { label: 'Toplam Satış', value: `₺${total.toLocaleString('tr-TR')}` },
                    {
                        label: 'Bekleyen Gönderi', value: safeItems.filter(i => {
                            const s = (i.orders?.status || '').toLowerCase();
                            return (s === 'yeni' || s === 'pending' || s === 'hazirlaniyor' || s === '');
                        }).length
                    },
                ].map((item, i) => (
                    <div key={i} className="glass p-6 rounded-[28px] border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.05] blur-2xl bg-white transition-opacity duration-500 group-hover:opacity-10" />
                        <p className="text-3xl font-black text-white relative z-10 tracking-tight">{item.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1 relative z-10">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Interactive Client View */}
            <div className="pt-2">
                <OrdersClient initialItems={safeItems} />
            </div>
        </div>
    );
}
