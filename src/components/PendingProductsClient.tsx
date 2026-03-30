"use client";

import React, { useState, useTransition } from 'react';
import { Package, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Product = {
    id: string;
    name: string;
    price: number;
    status: string | null;
    profiles?: { company_name: string | null; full_name: string | null } | null;
};

const StatusBadge = ({ status }: { status: string | null }) => {
    if (status === 'approved') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <CheckCircle size={10} /> Onaylandı
        </span>
    );
    if (status === 'rejected') return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <XCircle size={10} /> Reddedildi
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ color: '#FFBF00', background: 'rgba(255,191,0,0.1)', borderColor: 'rgba(255,191,0,0.2)' }}>
            <Clock size={10} /> Beklemede
        </span>
    );
};

export default function PendingProductsClient({ products: initialProducts }: { products: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const supabase = createClient();

    const showMsg = (id: string, type: 'success' | 'error', text: string) => {
        setMsg({ id, type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const updateProductStatus = async (productId: string, newStatus: 'approved' | 'rejected') => {
        startTransition(async () => {
            const { error } = await supabase
                .from('products')
                .update({ status: newStatus })
                .eq('id', productId);

            if (error) {
                showMsg(productId, 'error', 'İşlem başarısız');
            } else {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
                showMsg(productId, 'success', `Durum: ${newStatus}`);
            }
        });
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Package className="text-purple-400" size={32} />
                    Ürün Onayları
                </h1>
                <p className="text-white/50 text-sm mt-1">Platforma eklenen ürünleri incele ve onay durumlarını belirle.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Ürün', value: products.length, color: '#a78bfa' },
                    { label: 'Onay Bekleyen', value: products.filter(p => p.status === 'pending').length, color: '#FFBF00' },
                    { label: 'Reddedilen', value: products.filter(p => p.status === 'rejected').length, color: '#f87171' },
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
                    placeholder="Ürün veya satıcı ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Ürün Adı</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Satıcı</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Fiyat</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Durum</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-white/30 font-medium">
                                        Kayıtlı ürün bulunamadı
                                    </td>
                                </tr>
                            ) : filtered.map((product) => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-white text-sm">{product.name}</p>
                                    </td>
                                    <td className="p-4 text-white/70 text-sm">
                                        {product.profiles?.company_name || product.profiles?.full_name || 'Bilinmiyor'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="font-black text-white/90">₺{Number(product.price).toLocaleString('tr-TR')}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        {msg?.id === product.id ? (
                                            <span className={`text-xs font-bold ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {msg.text}
                                            </span>
                                        ) : (
                                            <StatusBadge status={product.status} />
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {product.status !== 'approved' && (
                                                <button
                                                    onClick={() => updateProductStatus(product.id, 'approved')}
                                                    disabled={isPending}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                                                    style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}
                                                >
                                                    Onayla
                                                </button>
                                            )}
                                            {product.status !== 'rejected' && (
                                                <button
                                                    onClick={() => updateProductStatus(product.id, 'rejected')}
                                                    disabled={isPending}
                                                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                                                    style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}
                                                >
                                                    Reddet
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
