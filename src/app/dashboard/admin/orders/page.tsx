import React from 'react';
import { ShoppingCart, Search, Filter, Eye, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { updateOrderStatus } from '@/app/actions/admin/admin-orders';

export default async function AdminOrdersPage() {
    const supabase = createClient();

    // Fetch real orders from Supabase
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching admin orders:", error);
    }

    const safeOrders = orders || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 placeholder-content">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
                        <ShoppingCart className="text-radiant-amber" /> Sipariş Yönetimi
                    </h1>
                    <p className="text-white/60">Tüm müşteri siparişlerini ve durum senkronizasyonlarını kontrol edin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Sipariş no veya Müşteri ara..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-radiant-amber/50 transition-colors"
                        />
                    </div>
                    <button className="bg-white/5 border border-white/10 text-white p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                        <Filter size={18} />
                    </button>
                    <button className="bg-radiant-amber text-cosmic-blue font-bold px-6 py-2.5 rounded-xl text-sm whitespace-nowrap hover:scale-105 transition-transform shadow-glow flex items-center gap-2">
                        <DollarSign size={16} /> Rapor Al
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Sipariş No</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Müşteri</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Tarih</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Ürün Seçimi</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Tutar</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Durum</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {safeOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-white/40 font-medium">Burası biraz sessiz. Henüz hiç sipariş alınmadı.</td>
                                </tr>
                            ) : safeOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors relative group">
                                    <td className="p-4 font-mono text-white/60 text-sm">{(order.id as string).substring(0, 8)}</td>
                                    <td className="p-4 font-bold text-white">{order.user_id ? (order.user_id as string).substring(0, 8) : 'Ziyaretçi'}</td>
                                    <td className="p-4 text-white/40 text-sm">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block px-2 py-1 bg-white/5 rounded-md text-xs font-bold">- Ürün</span>
                                    </td>
                                    <td className="p-4 text-radiant-amber font-black">₺{Number(order.total_amount).toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shrink-0 ${order.status === 'DELIVERED' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                                                order.status === 'PREPARING' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                                                    order.status === 'SHIPPED' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' :
                                                        'bg-radiant-amber/10 text-radiant-amber border-radiant-amber/20'
                                                }`}>
                                                {order.status || 'BEKLİYOR'}
                                            </span>
                                            <form action={updateOrderStatus} className="flex gap-2">
                                                <input type="hidden" name="orderId" value={order.id} />
                                                <select name="status" className="bg-transparent border border-white/10 text-[10px] text-white/60 p-1 rounded uppercase outline-none focus:border-radiant-amber/50">
                                                    <option className="bg-cosmic-blue text-white" value="PREPARING">Hazırlanıyor</option>
                                                    <option className="bg-cosmic-blue text-white" value="SHIPPED">Kargoda</option>
                                                    <option className="bg-cosmic-blue text-white" value="DELIVERED">Teslim</option>
                                                </select>
                                                <button type="submit" className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-2 rounded transition-colors text-[10px]">Ok</button>
                                            </form>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 bg-white/5 hover:bg-radiant-amber/20 rounded-lg transition-colors text-white/60 hover:text-radiant-amber inline-flex">
                                            <Eye size={16} />
                                        </button>
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
