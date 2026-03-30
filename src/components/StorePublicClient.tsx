"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Search, MapPin, Calendar, Info, Package, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

type StoreType = {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    is_verified: boolean;
    created_at: string;
    owner?: { full_name: string | null; email: string | null };
};

export default function StorePublicClient({
    store,
    initialProducts
}: {
    store: StoreType;
    initialProducts: any[];
}) {
    const [search, setSearch] = useState('');

    const filteredProducts = initialProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Store Banner & Header */}
            <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                {/* Banner Image */}
                {store.banner_url ? (
                    <img
                        src={store.banner_url}
                        alt={store.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A192F] via-[#112240] to-blue-900" />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/40 to-transparent" />

                {/* Store Branding Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-12">
                    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-end gap-8">
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-32 h-32 lg:w-40 lg:h-40 glass rounded-3xl border-4 border-white/10 shadow-2xl overflow-hidden shrink-0 bg-white"
                        >
                            {store.logo_url ? (
                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <Store size={48} className="text-cosmic-blue/20" />
                                </div>
                            )}
                        </motion.div>

                        {/* Store Info */}
                        <div className="flex-1 pb-2">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-radiant-amber text-cosmic-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Doğrulanmış Mağaza
                                    </span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4">
                                    {store.name}
                                </h1>
                                <p className="text-white/60 text-lg max-w-2xl font-medium leading-relaxed">
                                    {store.description || "Bu mağaza hakkında henüz bir açıklama girilmemiş."}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Navigation / Context Bar */}
            <div className="sticky top-0 z-40 glass-premium border-y border-white/5 py-4 px-6 lg:px-12 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Stats/Meta */}
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-2">
                            <Package size={14} className="text-radiant-amber" />
                            <span>{initialProducts.length} Ürün</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-blue-400" />
                            <span>Katılma: {new Date(store.created_at).getFullYear()}</span>
                        </div>
                    </div>

                    {/* In-Store Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                            type="text"
                            placeholder={`${store.name} içinde ara...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-radiant-amber/50 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
                <div className="mb-12">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-radiant-amber mb-2">Koleksiyon</h2>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">Tüm Ürünler</h3>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product, idx) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center glass rounded-[48px] border border-white/5">
                        <Sparkles size={48} className="text-white/10 mx-auto mb-6" />
                        <p className="text-xl font-black text-white tracking-tight">Ürün Bulunamadı</p>
                        <p className="text-white/40 text-sm mt-2 max-w-xs mx-auto">Arama kriterlerinize uygun ürün bulunmuyor veya mağaza henüz boş.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
