"use client";

import React, { useState, useTransition } from 'react';
import { Store, CheckCircle, XCircle, Search, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type StoreType = {
    id: string;
    name: string;
    is_verified: boolean;
    logo_url?: string | null;
    slug?: string | null;
    profiles: { email: string | null; full_name: string | null } | null;
};

const VerificationBadge = ({ verified }: { verified: boolean }) => {
    if (verified) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <CheckCircle size={10} /> Doğrulandı
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#94a3b8', background: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.2)' }}>
            <XCircle size={10} /> Doğrulanmadı
        </span>
    );
};

export default function StoreVerificationClient({ stores: initialStores }: { stores: StoreType[] }) {
    const [stores, setStores] = useState<StoreType[]>(initialStores);
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const supabase = createClient();

    const showMsg = (id: string, type: 'success' | 'error', text: string) => {
        setMsg({ id, type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const toggleVerification = async (storeId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        startTransition(async () => {
            const { error } = await supabase
                .from('stores')
                .update({ is_verified: newStatus })
                .eq('id', storeId);

            if (error) {
                showMsg(storeId, 'error', 'Güncelleme başarısız');
            } else {
                setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_verified: newStatus } : s));
                showMsg(storeId, 'success', newStatus ? 'Doğrulandı' : 'Doğrulama İptal');
            }
        });
    };

    const filtered = stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.profiles?.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Store className="text-blue-400" size={32} />
                    Mağaza Doğrulama
                </h1>
                <p className="text-white/50 text-sm mt-1">Platformdaki mağazaları ve yetki durumlarını kontrol et.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Mağaza', value: stores.length, color: '#60a5fa' },
                    { label: 'Doğrulananlar', value: stores.filter(s => s.is_verified).length, color: '#34d399' },
                    { label: 'Doğrulanmayanlar', value: stores.filter(s => !s.is_verified).length, color: '#94a3b8' },
                ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-2xl font-black text-white">{item.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                    type="text"
                    placeholder="Mağaza adı, sahip veya email ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Mağaza</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Mağaza Sahibi</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Durum</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-white/30 font-medium">
                                        Kayıtlı mağaza bulunamadı
                                    </td>
                                </tr>
                            ) : filtered.map((store) => (
                                <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden glass border border-white/10 shrink-0 bg-white">
                                                {store.logo_url ? (
                                                    <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                                        <Store size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{store.name}</p>
                                                <p className="text-[9px] text-white/30 font-bold tracking-widest uppercase">/{store.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-white/90 text-sm">{store.profiles?.full_name || 'Bilinmiyor'}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                                                <Mail size={10} />
                                                <p className="text-[10px]">{store.profiles?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {msg?.id === store.id ? (
                                            <span className={`text-xs font-bold ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {msg.text}
                                            </span>
                                        ) : (
                                            <VerificationBadge verified={store.is_verified} />
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => toggleVerification(store.id, store.is_verified)}
                                            disabled={isPending}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 border ${store.is_verified
                                                ? 'text-red-400 hover:bg-red-400/10 border-red-400/20'
                                                : 'text-green-400 hover:bg-green-400/10 border-green-400/20'
                                                }`}
                                        >
                                            {store.is_verified ? 'İptal Et' : 'Doğrula'}
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
