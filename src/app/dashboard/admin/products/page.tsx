import React from 'react';
import { Package, Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminProductsPage() {
    const supabase = createClient();

    // Fetch real products from Supabase
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching admin products:", error);
    }

    const safeProducts = products || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 placeholder-content">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
                        <Package className="text-radiant-amber" /> Ürün Yönetimi
                    </h1>
                    <p className="text-white/60">Platformdaki tüm ürünleri (satıcılar dahil) globale olarak yönetin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Ürün adı, ID veya Satıcı..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-radiant-amber/50 transition-colors"
                        />
                    </div>
                    <button className="bg-white/5 border border-white/10 text-white p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                        <Filter size={18} />
                    </button>
                    <button className="bg-radiant-amber text-cosmic-blue font-bold px-6 py-2.5 rounded-xl text-sm whitespace-nowrap hover:scale-105 transition-transform shadow-glow flex items-center gap-2">
                        <Plus size={16} /> Yeni Ürün
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 hidden md:table-row">
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Ürün Bilgisi</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Satıcı</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Fiyat</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Stok</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Durum</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 flex-col md:table-row-group flex">
                        {safeProducts.length === 0 ? (
                            <tr className="flex md:table-row p-4">
                                <td colSpan={6} className="text-center py-10 text-white/40 font-medium">Bu alana henüz hiçbir satıcı tarafından ürün eklenmedi.</td>
                            </tr>
                        ) : safeProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors flex flex-col md:table-row p-4 md:p-0">
                                <td className="p-0 md:p-4 block md:table-cell py-2 md:py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={20} className="text-white/20" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white leading-snug">{product.name}</p>
                                            <p className="font-mono text-white/40 text-[10px] uppercase">{(product.id as string).substring(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-0 md:p-4 block md:table-cell py-1 md:py-4 text-white/60 text-sm">
                                    <span className="md:hidden text-xs text-white/40 mr-2 uppercase tracking-widest">Kategori:</span>
                                    {product.category || 'Belirtilmemiş'}
                                </td>
                                <td className="p-0 md:p-4 block md:table-cell py-1 md:py-4 text-radiant-amber font-bold">
                                    <span className="md:hidden text-xs text-white/40 mr-2 uppercase tracking-widest">Fiyat:</span>
                                    ₺{Number(product.price).toLocaleString()}
                                </td>
                                <td className="p-0 md:p-4 block md:table-cell py-1 md:py-4">
                                    <span className="md:hidden text-xs text-white/40 mr-2 uppercase tracking-widest">Stok:</span>
                                    <span className={`font-mono ${product.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                                        {product.stock} adet
                                    </span>
                                </td>
                                <td className="p-0 md:p-4 block md:table-cell py-2 md:py-4">
                                    <span className="md:hidden text-xs text-white/40 mr-2 uppercase tracking-widest">Durum:</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${product.stock > 0 ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                                        {product.stock > 0 ? 'AKTİF' : 'STOKTA YOK'}
                                    </span>
                                </td>
                                <td className="p-0 md:p-4 block md:table-cell py-2 md:py-4 md:text-right text-left mt-2 md:mt-0">
                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white inline-flex">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
