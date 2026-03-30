import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DollarSign, TrendingUp, Percent, Wallet, Banknote, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default async function TechnicianFinancePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'usta') redirect('/dashboard');

    const { data: stats } = await supabase
        .from('technician_stats')
        .select('*')
        .eq('usta_id', user.id)
        .single();

    // Tamamlanan işlerden aylık kırılım
    const { data: completedJobs } = await supabase
        .from('service_requests')
        .select('final_price, payment_type, completed_at')
        .eq('usta_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

    const totalGross = completedJobs?.reduce((s, j) => s + Number(j.final_price ?? 0), 0) ?? 0;
    const totalNet = Number(stats?.toplam_kazanc ?? 0);
    const totalCommission = Number(stats?.kesilen_komisyon ?? 0);
    const cashTotal = completedJobs?.filter(j => j.payment_type === 'cash').reduce((s, j) => s + Number(j.final_price ?? 0), 0) ?? 0;
    const onlineTotal = completedJobs?.filter(j => j.payment_type === 'online').reduce((s, j) => s + Number(j.final_price ?? 0), 0) ?? 0;

    // Aylık özet
    const monthMap: Record<string, number> = {};
    completedJobs?.forEach(j => {
        if (!j.completed_at) return;
        const d = new Date(j.completed_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) monthMap[key] = 0;
        monthMap[key] += Number(j.final_price ?? 0);
    });
    const months = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    const maxMonth = Math.max(...months.map(([, v]) => v), 1);

    const cards = [
        { label: 'Brüt Gelir', value: `₺${totalGross.toLocaleString('tr-TR')}`, icon: TrendingUp, color: '#FFBF00', bg: 'rgba(255,191,0,0.08)', border: 'rgba(255,191,0,0.2)' },
        { label: 'Net Kazanım', value: `₺${totalNet.toLocaleString('tr-TR')}`, icon: DollarSign, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
        { label: 'Komisyon Kesintisi', value: `₺${totalCommission.toLocaleString('tr-TR')}`, icon: Percent, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
        { label: 'Nakit Tahsilat', value: `₺${cashTotal.toLocaleString('tr-TR')}`, icon: Banknote, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Finans & Hakediş</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Kazançlarım</h1>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="p-5 rounded-2xl border" style={{ background: card.bg, borderColor: card.border }}>
                            <Icon size={20} style={{ color: card.color }} className="mb-3" />
                            <p className="text-xl font-black text-white">{card.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Payment split */}
            {totalGross > 0 && (
                <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4">Ödeme Tipi Dağılımı</h2>
                    <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-xl border border-white/5 text-center">
                            <Banknote className="mx-auto mb-2 text-green-400" size={20} />
                            <p className="font-black text-white text-lg">₺{cashTotal.toLocaleString('tr-TR')}</p>
                            <p className="text-xs text-white/40 mt-1">Nakit</p>
                        </div>
                        <div className="flex-1 p-4 rounded-xl border border-white/5 text-center">
                            <CreditCard className="mx-auto mb-2 text-blue-400" size={20} />
                            <p className="font-black text-white text-lg">₺{onlineTotal.toLocaleString('tr-TR')}</p>
                            <p className="text-xs text-white/40 mt-1">Online</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly chart */}
            <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4">Aylık Kazanç</h2>
                {months.length === 0 ? (
                    <div className="py-12 text-center">
                        <Wallet className="mx-auto mb-3 text-white/10" size={40} />
                        <p className="text-white/30 text-sm">Henüz tamamlanan iş yok</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {months.map(([key, val]) => {
                            const [year, month] = key.split('-');
                            const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                            return (
                                <div key={key} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/60 font-medium">{label}</span>
                                        <span className="text-amber-400 font-bold">₺{val.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(val / maxMonth) * 100}%`, background: 'linear-gradient(90deg, #FFBF00, #f59e0b)' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
