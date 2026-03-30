"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Trash2, ToggleLeft, ToggleRight, Plus, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUstaProducts, deleteVendorProduct, updateVendorProductStock, VendorProduct } from '@/app/actions/seller/product-actions';
import Link from 'next/link';

function RowSkeleton() {
    return (
        <div className="flex items-center gap-6 p-5 border-b border-white/5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="w-40 h-3 bg-white/10 rounded" />
                <div className="w-24 h-2 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-3 bg-white/10 rounded" />
            <div className="w-10 h-3 bg-white/10 rounded" />
        </div>
    );
}

export default function TechnicianProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<VendorProduct[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filtered = React.useMemo(() => {
        const q = search.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        );
    }, [search, products]);

    const refreshProducts = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await getUstaProducts(user.id);
            setProducts(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshProducts();
    }, [user?.id]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ürünü/hizmeti silmek istediğinize emin misiniz?')) return;
        setDeletingId(id);
        const { success } = await deleteVendorProduct(id);
        if (success) {
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            alert('Silme işlemi başarısız oldu.');
        }
        setDeletingId(null);
    };

    return (
        <div className="p-8 lg:p-12">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex items-start justify-between gap-4"
            >
                <div>
                    <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                        PRO Satis & Hizmet
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Ürünlerim & Hizmetlerim</h1>
                    <p className="text-white/30 text-sm">Uzmanlık alanınıza giren ürünleri veya montaj hizmetlerini buradan yönetin.</p>
                </div>

                <Link
                    href="/dashboard/technician/products/new"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-radiant-amber text-cosmic-blue font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-glow shrink-0 mt-2"
                >
                    <Plus size={18} />
                    Yeni Ekle
                </Link>
            </motion.header>

            {/* Content */}
            <div className="glass rounded-[40px] border border-white/5 bg-white/[0.02] overflow-hidden">
                {/* Search bar */}
                <div className="p-6 border-b border-white/5 flex items-center gap-4">
                    <Search className="text-white/20" size={18} />
                    <input
                        type="text"
                        placeholder="Ürün veya kategori ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm focus:outline-none"
                    />
                    {!isLoading && (
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                            {filtered.length} Kayıt
                        </span>
                    )}
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_100px] gap-4 px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                    <span>Ürün / Hizmet</span>
                    <span>Fiyat</span>
                    <span>Durum</span>
                    <span>İşlemler</span>
                </div>

                {/* Rows */}
                {isLoading
                    ? [0, 1, 2, 3].map(i => <RowSkeleton key={i} />)
                    : filtered.length === 0
                        ? (
                            <div className="py-20 flex flex-col items-center text-center">
                                <Package className="text-white/10 mb-4" size={40} />
                                <p className="text-white/20 text-sm font-bold">
                                    {search ? 'Aramanızla eşleşen sonuç yok.' : 'Henüz bir ürün veya hizmet eklemediniz.'}
                                </p>
                            </div>
                        )
                        : filtered.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-[2fr_1fr_1fr_100px] gap-4 items-center px-6 py-5 border-b border-white/5 group hover:bg-white/[0.03] transition-all"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {product.image_url && (
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{product.name}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest truncate">{product.category}</p>
                                    </div>
                                </div>

                                <p className="text-sm font-black text-radiant-amber">
                                    {product.price.toLocaleString('tr-TR')} ₺
                                </p>

                                <div className="flex items-center gap-2">
                                    {product.is_active
                                        ? <ToggleRight className="text-green-400" size={22} />
                                        : <ToggleLeft className="text-white/20" size={22} />
                                    }
                                    <span className={`text-[9px] font-black uppercase ${product.is_active ? 'text-green-400' : 'text-white/20'}`}>
                                        {product.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/katalog/${product.slug}`}
                                        target="_blank"
                                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deletingId === product.id}
                                        className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30"
                                    >
                                        {deletingId === product.id
                                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            : <Trash2 size={16} />
                                        }
                                    </button>
                                </div>
                            </motion.div>
                        ))
                }
            </div>
        </div>
    );
}
