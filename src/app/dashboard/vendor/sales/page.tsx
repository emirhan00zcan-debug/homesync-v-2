import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function VendorSalesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('commission_rate, full_name')
        .eq('id', user.id)
        .single();

    const { data: orderItems } = await supabase
        .from('order_items')
        .select('unit_price, quantity, commission_rate, vendor_earning, created_at, products(name)')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    const safeItems = orderItems || [];
    const commissionRate = profile?.commission_rate ?? 15;

    const grossRevenue = safeItems.reduce((acc, i) => acc + Number(i.unit_price) * Number(i.quantity), 0);
    const commissionTotal = grossRevenue * (commissionRate / 100);
    const netRevenue = grossRevenue - commissionTotal;

    // Monthly breakdown
    const byMonth: Record<string, { gross: number; net: number }> = {};
    safeItems.forEach(item => {
        const month = new Date(item.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        if (!byMonth[month]) byMonth[month] = { gross: 0, net: 0 };
        const gross = Number(item.unit_price) * Number(item.quantity);
        byMonth[month].gross += gross;
        byMonth[month].net += Number(item.vendor_earning || gross * (1 - commissionRate / 100));
    });

    return (
        <div className="p-8 lg:p-12 space-y-10">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-radiant-amber opacity-80">Satıcı Paneli</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                    <DollarSign className="text-green-400" size={36} />
                    Satış Raporu
                </h1>
                <p className="text-white/40 text-sm mt-3 font-medium">Brüt gelir, komisyon kesintisi ve net kazancınızı detaylı analiz edin.</p>
            </div>

            {/* Commission banner */}
            <div className="p-6 lg:p-8 rounded-[28px] border border-white/5 bg-gradient-to-tr from-white/[0.02] to-radiant-amber/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-radiant-amber/20 blur-[100px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-radiant-amber/20 rounded-2xl border border-radiant-amber/30 text-radiant-amber">
                        <Percent size={24} />
                    </div>
                    <div>
                        <p className="font-black text-white text-lg tracking-tight">Platform Komisyon Oranı</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mt-1">Her satıştan tahsil edilen standart oran</p>
                    </div>
                </div>
                <p className="text-5xl font-black text-radiant-amber relative z-10 drop-shadow-glow">%{commissionRate}</p>
            </div>

            {/* Revenue summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass p-6 lg:p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl bg-blue-400 transition-opacity duration-500 group-hover:opacity-20" />
                    <div className="inline-flex p-3 rounded-2xl bg-blue-400/10 border border-blue-400/20 text-blue-400 mb-6">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">₺{grossRevenue.toLocaleString('tr-TR')}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Brüt Gelir</p>
                    <p className="text-[10px] text-white/30 font-medium mt-1">Komisyon öncesi toplam hacim</p>
                </div>

                <div className="glass p-6 lg:p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl bg-red-400 transition-opacity duration-500 group-hover:opacity-20" />
                    <div className="inline-flex p-3 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 mb-6">
                        <TrendingDown size={24} />
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">₺{commissionTotal.toLocaleString('tr-TR')}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Komisyon Kesintisi</p>
                    <p className="text-[10px] text-white/30 font-medium mt-1">%{commissionRate} platform payı kesildi</p>
                </div>

                <div className="glass p-6 lg:p-8 rounded-[32px] border border-white/5 bg-emerald-500/[0.03] hover:border-emerald-500/10 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl bg-emerald-400 transition-opacity duration-500 group-hover:opacity-20" />
                    <div className="inline-flex p-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-6">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] tracking-tighter mb-2">₺{netRevenue.toLocaleString('tr-TR')}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Net Kazanım</p>
                    <p className="text-[10px] text-white/30 font-medium mt-1">Tarafınıza aktarılacak toplam tutar</p>
                </div>
            </div>

            {/* Monthly breakdown */}
            {Object.keys(byMonth).length > 0 ? (
                <div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-white/10"></span>
                        Aylık Performans Dökümü
                        <span className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></span>
                    </h2>

                    <div className="glass rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Dönem / Ay</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Brüt Hacim</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Kesinti</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Net Ödenen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {Object.entries(byMonth).map(([month, data]) => (
                                        <tr key={month} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6 font-bold text-white text-sm tracking-wide">{month}</td>
                                            <td className="p-6 text-right text-blue-400 font-black">₺{data.gross.toLocaleString('tr-TR')}</td>
                                            <td className="p-6 text-right text-red-400 font-bold">-₺{(data.gross * commissionRate / 100).toLocaleString('tr-TR')}</td>
                                            <td className="p-6 text-right text-emerald-400 font-black text-lg drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">₺{data.net.toLocaleString('tr-TR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                    <DollarSign size={48} className="text-white/10 mb-6 drop-shadow-glow" />
                    <p className="text-xl font-black text-white tracking-tight mb-2">Henüz Satış Bulunmuyor</p>
                    <p className="text-white/40 text-sm font-medium">İlk satışınızı gerçekleştirdiğinizde raporlama verileri burada görünecektir.</p>
                </div>
            )}
        </div>
    );
}
