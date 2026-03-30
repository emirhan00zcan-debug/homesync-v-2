"use client";

import React, { useState, useTransition } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, Edit2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Vendor = {
    id: string;
    full_name: string | null;
    email: string | null;
    vendor_status: string | null;
    commission_rate: number | null;
    company_name: string | null;
    productCount: number;
};

const StatusBadge = ({ status }: { status: string | null }) => {
    if (status === 'ACTIVE') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <CheckCircle size={10} /> Aktif
        </span>
    );
    if (status === 'SUSPENDED') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <XCircle size={10} /> Askıya Alındı
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#FFBF00', background: 'rgba(255,191,0,0.1)', borderColor: 'rgba(255,191,0,0.2)' }}>
            <Clock size={10} /> Beklemede
        </span>
    );
};

export default function VendorManagementClient({ vendors: initialVendors }: { vendors: Vendor[] }) {
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCommission, setEditCommission] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const supabase = createClient();

    const showMsg = (id: string, type: 'success' | 'error', text: string) => {
        setMsg({ id, type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const updateVendorStatus = async (vendorId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING') => {
        startTransition(async () => {
            const { error } = await supabase
                .from('profiles')
                .update({ vendor_status: newStatus })
                .eq('id', vendorId);

            if (error) {
                showMsg(vendorId, 'error', 'Güncelleme başarısız');
            } else {
                setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, vendor_status: newStatus } : v));
                showMsg(vendorId, 'success', `Durum: ${newStatus}`);
            }
        });
    };

    const saveCommission = async (vendorId: string) => {
        const rate = parseFloat(editCommission);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            showMsg(vendorId, 'error', 'Geçerli bir oran girin (0-100)');
            return;
        }

        startTransition(async () => {
            const { error } = await supabase
                .from('profiles')
                .update({ commission_rate: rate })
                .eq('id', vendorId);

            if (!error) {
                await supabase.from('vendor_commissions').insert({
                    vendor_id: vendorId,
                    rate,
                    note: 'Süper Admin tarafından güncellendi',
                });
            }

            if (error) {
                showMsg(vendorId, 'error', 'Komisyon güncellenemedi');
            } else {
                setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, commission_rate: rate } : v));
                setEditingId(null);
                showMsg(vendorId, 'success', `Komisyon: %${rate}`);
            }
        });
    };

    const filtered = vendors.filter(v =>
    (v.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.email?.toLowerCase().includes(search.toLowerCase()) ||
        v.company_name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Users className="text-blue-400" size={32} />
                    Satıcı Yönetimi
                </h1>
                <p className="text-white/50 text-sm mt-1">Satıcıları onayla, askıya al ve komisyon oranlarını belirle</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Satıcı', value: vendors.length, color: '#60a5fa' },
                    { label: 'Aktif', value: vendors.filter(v => v.vendor_status === 'ACTIVE').length, color: '#34d399' },
                    { label: 'Beklemede', value: vendors.filter(v => !v.vendor_status || v.vendor_status === 'PENDING').length, color: '#FFBF00' },
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
                    placeholder="Satıcı ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Satıcı</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Email</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Ürünler</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Komisyon</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Durum</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-white/30 font-medium">
                                        Kayıtlı satıcı bulunamadı
                                    </td>
                                </tr>
                            ) : filtered.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-white text-sm">{vendor.full_name || '—'}</p>
                                            {vendor.company_name && (
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{vendor.company_name}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/50 text-sm">{vendor.email}</td>
                                    <td className="p-4 text-center">
                                        <span className="text-white font-bold">{vendor.productCount}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {editingId === vendor.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    value={editCommission}
                                                    onChange={e => setEditCommission(e.target.value)}
                                                    className="w-16 text-center bg-white/10 border border-yellow-500/40 rounded-lg py-1 px-2 text-sm text-white focus:outline-none"
                                                    min="0" max="100" step="0.5"
                                                    autoFocus
                                                />
                                                <span className="text-white/50 text-xs">%</span>
                                                <button onClick={() => saveCommission(vendor.id)} disabled={isPending}
                                                    className="p-1 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors">
                                                    <Save size={14} />
                                                </button>
                                                <button onClick={() => setEditingId(null)}
                                                    className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(vendor.id);
                                                    setEditCommission(String(vendor.commission_rate ?? 15));
                                                }}
                                                className="inline-flex items-center gap-1.5 font-bold text-yellow-400 hover:text-yellow-300 transition-colors group"
                                            >
                                                %{vendor.commission_rate ?? 15}
                                                <Edit2 size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {msg?.id === vendor.id ? (
                                            <span className={`text-xs font-bold ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {msg.text}
                                            </span>
                                        ) : (
                                            <StatusBadge status={vendor.vendor_status} />
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {vendor.vendor_status !== 'ACTIVE' && (
                                                <button
                                                    onClick={() => updateVendorStatus(vendor.id, 'ACTIVE')}
                                                    disabled={isPending}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                                                    style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}
                                                >
                                                    Onayla
                                                </button>
                                            )}
                                            {vendor.vendor_status !== 'SUSPENDED' && (
                                                <button
                                                    onClick={() => updateVendorStatus(vendor.id, 'SUSPENDED')}
                                                    disabled={isPending}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                                                    style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}
                                                >
                                                    Askıya Al
                                                </button>
                                            )}
                                        </div>
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
