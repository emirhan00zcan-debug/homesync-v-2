import React from 'react';
import { ShoppingCart, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.FC<{ size: number }> }> = {
        hazirlaniyor: { label: 'Hazırlanıyor', color: '#FFBF00', bg: 'rgba(255,191,0,0.1)', border: 'rgba(255,191,0,0.2)', Icon: Clock },
        kargoda: { label: 'Kargoda', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', Icon: Truck },
        teslim_edildi: { label: 'Teslim Edildi', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', Icon: CheckCircle },
        iptal: { label: 'İptal', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', Icon: XCircle },
    };
    const s = map[status] || map['hazirlaniyor'];
    const Icon = s.Icon;

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
            <Icon size={10} />
            {s.label}
        </span>
    );
};

export default async function SuperAdminOrdersPage() {
    const supabase = createClient();

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) console.error('Error fetching orders:', error);

    const safeOrders = orders || [];
    const totalRevenue = safeOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);

    return (
        <div className="space-y-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <ShoppingCart className="text-blue-400" size={32} />
                    Tüm Siparişler
                </h1>
                <p className="text-white/50 text-sm mt-1">Platformdaki tüm satıcıların siparişleri</p>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Sipariş', value: safeOrders.length, color: '#60a5fa' },
                    { label: 'Platform Cirosu', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, color: '#FFBF00' },
                    { label: 'Aktif (Hazırlanıyor)', value: safeOrders.filter(o => o.status === 'hazirlaniyor').length, color: '#34d399' },
                ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-2xl font-black text-white">{item.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Sipariş ID</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Tutar</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Durum</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {safeOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-white/30 font-medium">
                                        Henüz sipariş bulunmuyor
                                    </td>
                                </tr>
                            ) : safeOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono text-white/40 text-xs">{order.id.slice(0, 8)}...</td>
                                    <td className="p-4 font-black text-white">₺{Number(order.total_amount).toLocaleString('tr-TR')}</td>
                                    <td className="p-4"><StatusBadge status={order.status} /></td>
                                    <td className="p-4 text-white/50 text-sm">
                                        {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
