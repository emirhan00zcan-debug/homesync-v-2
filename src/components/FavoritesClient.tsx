"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toggleFavorite } from '@/app/actions/customer/product-interactions';
import { useRouter } from 'next/navigation';

interface FavoritesClientProps {
    favoriteProducts: any[];
}

export default function FavoritesClient({ favoriteProducts }: FavoritesClientProps) {
    const router = useRouter();

    const handleRemove = async (productId: string) => {
        const res = await toggleFavorite(productId);
        if (res.success) {
            router.refresh();
        }
    };

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Customer Portfolio</p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Favorilerim</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">İlham aldığınız ve ileride sahip olmayı düşündüğünüz seçkin tasarımlar.</p>
            </header>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {favoriteProducts.map((fav) => {
                        const product = fav.products;
                        if (!product) return null;

                        return (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -10 }}
                                className="glass p-8 rounded-[40px] border border-white/10 bg-white/[0.02] flex flex-col group"
                            >
                                <div className="aspect-square rounded-[32px] bg-white/5 border border-white/5 mb-8 overflow-hidden relative flex items-center justify-center">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <Sparkles className="text-white/10 group-hover:text-radiant-amber/40 transition-colors" size={60} />
                                    )}
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="absolute top-6 right-6 w-12 h-12 glass rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <span className="text-radiant-amber text-[9px] font-black uppercase tracking-widest block mb-1">{product.manufacturer}</span>
                                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                                    <p className="text-[11px] text-white/30 uppercase font-black tracking-widest">{product.category}</p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-2xl font-black text-white">{product.price.toLocaleString('tr-TR')} ₺</p>
                                    <div className="flex gap-3">
                                        <Link href={`/product/${product.slug}`}>
                                            <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all">
                                                <Sparkles size={18} className="text-white/40" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center glass rounded-[48px] border border-dashed border-white/10">
                    <Heart size={48} className="text-white/10 mb-6" />
                    <p className="text-white/20 font-black uppercase tracking-widest text-xs">Henüz favori eklenmedi</p>
                    <Link href="/katalog" className="mt-8 text-radiant-amber text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">
                        Keşfetmeye Başla
                    </Link>
                </div>
            )}
        </div>
    );
}
