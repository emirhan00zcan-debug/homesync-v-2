"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Upload } from 'lucide-react';
import { useVendorStore } from '@/store';
import { getVendorProducts, deleteVendorProduct, updateVendorProductStock, VendorProduct } from '@/app/actions/seller/product-actions';
import BulkUploadModal from '@/components/BulkUploadModal';

function RowSkeleton() {
    return (
        <div className="flex items-center gap-6 p-5 border-b border-white/5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="w-40 h-3 bg-white/10 rounded" />
                <div className="w-24 h-2 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-3 bg-white/10 rounded" />
            <div className="w-16 h-3 bg-white/10 rounded" />
            <div className="w-10 h-3 bg-white/10 rounded" />
        </div>
    );
}

export default function VendorInventoryPage() {
    const storeId = useVendorStore(s => s.storeId);
    const store = useVendorStore(s => s.store);
    const isStoreLoading = useVendorStore(s => s.isStoreLoading);
    const hasStore = useVendorStore(s => s.hasStore);
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
    const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const refreshProducts = async () => {
        if (!storeId) return;
        setIsLoading(true);
        try {
            const data = await getVendorProducts(storeId);
            setProducts(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isStoreLoading && storeId) {
            refreshProducts();
        } else if (!isStoreLoading) {
            setIsLoading(false);
        }
    }, [storeId, isStoreLoading]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        setDeletingId(id);
        await deleteVendorProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setDeletingId(null);
    };

    const handleStockChange = async (productId: string, newStock: number) => {
        if (newStock < 0) return;
        setUpdatingStockId(productId);
        const { success } = await updateVendorProductStock(productId, newStock);
        if (success) {
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_count: newStock } : p));
        } else {
            alert('Stok güncellenirken bir hata oluştu.');
        }
        setUpdatingStockId(null);
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
                        {store?.name}
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Envanter Yönetimi</h1>
                    <p className="text-white/30 text-sm">Mağazanıza ait tüm ürünleri buradan düzenleyebilirsiniz.</p>
                </div>
                {hasStore && (
                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 text-sm font-bold transition-all shrink-0 mt-2"
                    >
                        <Upload size={15} />
                        Toplu Yükle
                    </button>
                )}
            </motion.header>

            {showBulkUpload && (
                <BulkUploadModal
                    onClose={() => setShowBulkUpload(false)}
                    onSuccess={(count) => {
                        setShowBulkUpload(false);
                        refreshProducts();
                    }}
                />
            )}

            {/* No Store */}
            {!isLoading && !hasStore && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <AlertTriangle className="text-radiant-amber/40 mb-4" size={40} />
                    <p className="text-white/40 font-bold">Mağaza bulunamadı.</p>
                </div>
            )}

            {/* Content */}
            {(isLoading || hasStore) && (
                <div className="glass rounded-[40px] border border-white/5 bg-white/[0.02] overflow-hidden">
                    {/* Search bar */}
                    <div className="p-6 border-b border-white/5 flex items-center gap-4">
                        <Search className="text-white/20" size={18} />
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm focus:outline-none"
                        />
                        {!isLoading && (
                            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                                {filtered.length} / {products.length} ürün
                            </span>
                        )}
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                        <span>Ürün</span>
                        <span>Fiyat</span>
                        <span>Stok</span>
                        <span>Durum</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    {isLoading
                        ? [0, 1, 2, 3, 4].map(i => <RowSkeleton key={i} />)
                        : filtered.length === 0
                            ? (
                                <div className="py-20 flex flex-col items-center text-center">
                                    <Package className="text-white/10 mb-4" size={40} />
                                    <p className="text-white/20 text-sm font-bold">
                                        {search ? 'Aramanızla eşleşen ürün yok.' : 'Henüz ürün eklenmemiş.'}
                                    </p>
                                </div>
                            )
                            : filtered.map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 items-center px-6 py-5 border-b border-white/5 group hover:bg-white/[0.03] transition-all"
                                >
                                    {/* Name + Category + Optional Image */}
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

                                    {/* Price */}
                                    <p className="text-sm font-black text-radiant-amber">
                                        {product.price.toLocaleString('tr-TR')} ₺
                                    </p>

                                    {/* Stock */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={updatingStockId === product.id || (product.stock_count ?? 0) <= 0}
                                            onClick={() => handleStockChange(product.id, (product.stock_count ?? 0) - 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5"
                                        >
                                            -
                                        </button>
                                        <p className={`min-w-[20px] text-center text-sm font-black ${(product.stock_count ?? 0) <= 3 ? 'text-red-400' : 'text-white'}`}>
                                            {updatingStockId === product.id ? (
                                                <div className="w-4 h-4 border border-x-transparent border-white/50 rounded-full animate-spin mx-auto" />
                                            ) : (
                                                <>{product.stock_count ?? 0}</>
                                            )}
                                        </p>
                                        <button
                                            disabled={updatingStockId === product.id}
                                            onClick={() => handleStockChange(product.id, (product.stock_count ?? 0) + 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5"
                                        >
                                            +
                                        </button>
                                        {(product.stock_count ?? 0) <= 3 && updatingStockId !== product.id && (
                                            <span className="text-[8px] ml-1 text-red-400/60 font-bold whitespace-nowrap">Az!</span>
                                        )}
                                    </div>

                                    {/* Active badge */}
                                    <div className="flex items-center gap-2">
                                        {product.is_active
                                            ? <ToggleRight className="text-green-400" size={22} />
                                            : <ToggleLeft className="text-white/20" size={22} />
                                        }
                                        <span className={`text-[9px] font-black uppercase ${product.is_active ? 'text-green-400' : 'text-white/20'}`}>
                                            {product.is_active ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deletingId === product.id}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30"
                                    >
                                        {deletingId === product.id
                                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            : <Trash2 size={16} />
                                        }
                                    </button>
                                </motion.div>
                            ))
                    }
                </div>
            )}
        </div>
    );
}
