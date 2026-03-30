"use client";

import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import Skeleton from './ui/Skeleton';
import Link from 'next/link';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
    return (
        <section id="products-section" className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-radiant-amber/10 border border-radiant-amber/20">
                        <span className="text-radiant-amber text-[10px] font-black tracking-[0.3em] uppercase">
                            Premium Koleksiyon
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                        Evinizdeki Işığı <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400 dark:from-radiant-amber dark:to-amber-200">
                            Serbest Bırakın
                        </span>
                    </h2>
                </div>
                <Link href="/katalog" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                    <span className="border-b border-radiant-amber/30 group-hover:border-radiant-amber pb-1 transition-all">
                        Tüm Koleksiyonlar
                    </span>
                    <div className="w-10 h-10 rounded-full border border-current/10 flex items-center justify-center group-hover:bg-radiant-amber group-hover:text-background transition-all">
                        <ArrowUpRight size={16} />
                    </div>
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-6 p-4 rounded-[48px] glass-ultra bg-current/5 border-current/10">
                            <Skeleton className="aspect-[1/1.2] rounded-[40px]" />
                            <div className="space-y-4 px-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-2/3 rounded-lg" />
                                    <Skeleton className="h-6 w-1/4 rounded-lg" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-2xl" />
                                <Skeleton className="h-12 w-full rounded-3xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full py-32 flex flex-col items-center justify-center text-center glass rounded-[40px] border border-current/10 relative overflow-hidden"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-radiant-amber/10 blur-[80px] rounded-full" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 glass rounded-full flex items-center justify-center border border-current/20 mx-auto animate-pulse-glow">
                            <Sparkles className="text-radiant-amber" size={32} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-foreground">Çok Yakında!</h3>
                        <p className="text-foreground/40 max-w-md mx-auto text-sm leading-relaxed">Yeni nesil tasarım ürünlerimiz şu an mimarlarımız tarafından hazırlanıyor. Çok yakında muhteşem bir koleksiyonla karşınızda olacağız.</p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-stretch"
                >
                    <AnimatePresence mode="popLayout">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </section>
    );
};

export default ProductGrid;

