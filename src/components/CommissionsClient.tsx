"use client";

import React, { useState, useTransition } from 'react';
import { Percent, Save, History, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Vendor = {
    id: string;
    full_name: string | null;
    email: string | null;
    commission_rate: number | null;
    vendor_status: string | null;
    company_name: string | null;
};

type HistoryItem = {
    id: string;
    vendor_id: string;
    rate: number;
    note: string | null;
    created_at: string;
    profiles: { full_name: string | null; email: string | null } | null;
};

export default function CommissionsClient({
    vendors: initialVendors,
    history: initialHistory,
}: {
    vendors: Vendor[];
    history: HistoryItem[];
}) {
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
    const [editRates, setEditRates] = useState<Record<string, string>>({});
    const [editNotes, setEditNotes] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
    const supabase = createClient();

    const showMsg = (id: string, type: 'success' | 'error', text: string) => {
        setMessages(prev => ({ ...prev, [id]: { type, text } }));
        setTimeout(() => setMessages(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
    };

    const updateCommission = (vendorId: string) => {
        const rate = parseFloat(editRates[vendorId] || '15');
        if (isNaN(rate) || rate < 0 || rate > 100) {
            showMsg(vendorId, 'error', 'Geçerli oran (0-100)');
            return;
        }
        const note = editNotes[vendorId] || '';

        startTransition(async () => {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ commission_rate: rate })
                .eq('id', vendorId);

            if (profileError) { showMsg(vendorId, 'error', 'Güncelleme başarısız'); return; }

            const { data: newEntry } = await supabase
                .from('vendor_commissions')
                .insert({ vendor_id: vendorId, rate, note: note || 'Süper Admin tarafından güncellendi' })
                .select()
                .single();

            setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, commission_rate: rate } : v));
            if (newEntry) {
                const vendor = vendors.find(v => v.id === vendorId);
                setHistory(prev => [{ ...newEntry, profiles: { full_name: vendor?.full_name || null, email: vendor?.email || null } }, ...prev]);
            }

            setEditRates(prev => { const n = { ...prev }; delete n[vendorId]; return n; });
            setEditNotes(prev => { const n = { ...prev }; delete n[vendorId]; return n; });
            showMsg(vendorId, 'success', `Komisyon %${rate} olarak güncellendi`);
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Percent className="text-yellow-400" size={32} />
                    Komisyon Yönetimi
                </h1>
                <p className="text-white/50 text-sm mt-1">Her satıcı için platform komisyon oranını belirle</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vendor commission controls */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                        <Users size={14} /> Satıcılar
                    </h2>

                    {vendors.length === 0 ? (
                        <div className="p-8 rounded-2xl border border-white/10 text-center text-white/30"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            Kayıtlı satıcı bulunamadı
                        </div>
                    ) : vendors.map(vendor => (
                        <div key={vendor.id}
                            className="p-5 rounded-2xl border border-white/10 transition-all hover:border-white/20"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-white text-sm">{vendor.full_name || '—'}</p>
                                    <p className="text-[10px] text-white/40">{vendor.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-yellow-400">%{vendor.commission_rate ?? 15}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Mevcut Oran</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder={String(vendor.commission_rate ?? 15)}
                                        value={editRates[vendor.id] ?? ''}
                                        onChange={e => setEditRates(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                                        className="w-24 bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                                        min="0" max="100" step="0.5"
                                    />
                                    <span className="text-white/40 text-sm">%</span>
                                    <input
                                        type="text"
                                        placeholder="Not (isteğe bağlı)"
                                        value={editNotes[vendor.id] ?? ''}
                                        onChange={e => setEditNotes(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                                        className="flex-1 bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => updateCommission(vendor.id)}
                                        disabled={isPending || !editRates[vendor.id]}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-30 hover:scale-105"
                                        style={{ background: editRates[vendor.id] ? 'linear-gradient(135deg, #FFD700, #FFBF00)' : 'rgba(255,255,255,0.05)', color: editRates[vendor.id] ? '#0A192F' : '#fff' }}
                                    >
                                        <Save size={14} /> Kaydet
                                    </button>
                                </div>

                                {messages[vendor.id] && (
                                    <p className={`text-xs font-bold ${messages[vendor.id].type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                        {messages[vendor.id].text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* History */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                        <History size={14} /> Değişiklik Geçmişi
                    </h2>
                    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        {history.length === 0 ? (
                            <p className="text-center py-8 text-white/30 text-sm">Henüz değişiklik yapılmadı</p>
                        ) : (
                            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                                {history.map(entry => (
                                    <div key={entry.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {entry.profiles?.full_name || entry.profiles?.email || 'Bilinmiyor'}
                                                </p>
                                                {entry.note && (
                                                    <p className="text-xs text-white/40 mt-0.5">{entry.note}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className="text-yellow-400 font-black">%{entry.rate}</p>
                                                <p className="text-[10px] text-white/30">
                                                    {new Date(entry.created_at).toLocaleDateString('tr-TR', {
                                                        day: '2-digit', month: 'short'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
