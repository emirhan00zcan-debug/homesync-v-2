import React from 'react';
import { Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SuperAdminProductsPage() {
    const supabase = createClient();

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, stock_count, category, is_active, vendor_id, created_at, profiles!products_vendor_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) console.error('Error fetching products:', error);

    const safeProducts = products || [];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Package className="text-purple-400" size={32} />
                    Tüm Ürünler
                </h1>
                <p className="text-white/50 text-sm mt-1">Platformdaki tüm satıcıların ürünleri — {safeProducts.length} kayıt</p>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Ürün</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Satıcı</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Kategori</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Fiyat</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">Stok</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {safeProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-white/30 font-medium">
                                        Ürün bulunamadı
                                    </td>
                                </tr>
                            ) : (safeProducts as any[]).map((product) => {
                                const vendor = product.profiles;
                                return (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <p className="font-semibold text-white text-sm">{product.name}</p>
                                        </td>
                                        <td className="p-4 text-white/50 text-sm">
                                            {vendor?.full_name || vendor?.email || '—'}
                                        </td>
                                        <td className="p-4">
                                            {product.category && (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                                    style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
                                                    {product.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-black text-white">
                                            ₺{Number(product.price).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${product.stock_count <= 5 ? 'text-red-400' : 'text-white'}`}>
                                                {product.stock_count}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                                style={product.is_active
                                                    ? { color: '#34d399', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }
                                                    : { color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }
                                                }>
                                                {product.is_active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
