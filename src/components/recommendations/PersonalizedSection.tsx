"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';

interface PersonalizedSectionProps {
    initialProducts?: Product[];
}


const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({ initialProducts = [] }) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                const res = await fetch('/api/recommendations');
                if (!res.ok) throw new Error('Öneriler alınamadı');
                const data = await res.json();

                if (data.products && data.products.length > 0) {
                    setProducts(data.products);
                    setIsPersonalized(data.personalized);
                }
            } catch (error) {
                console.error('Recommendation fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRecommendations();
    }, []);

    if (!isLoading && products.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-radiant-amber/5 rounded-full blur-[130px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6 text-foreground"
                        >
                            {isPersonalized ? 'Size Özel Seçimler' : 'Öne Çıkan Ürünler'}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-base font-medium max-w-xl text-foreground/40 leading-relaxed"
                        >
                            {isPersonalized
                                ? 'Geçmiş aramalarınız ve ilginizi çeken kategorilere göre size en uygun akıllı ev ürünlerini derledik.'
                                : 'En popüler ve en çok tercih edilen akıllı ev teknolojilerimizi keşfedin.'}
                        </motion.p>
                    </div>

                    {isPersonalized && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-radiant-amber/30 bg-radiant-amber/5 backdrop-blur-md self-start md:self-auto"
                        >
                            <Sparkles className="text-radiant-amber" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-radiant-amber">
                                Profilinize Göre Sıralandı
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
                    <AnimatePresence mode='popLayout'>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-[1/1.5] rounded-[48px] bg-current/5 border border-current/10 animate-pulse"
                                />
                            ))
                        ) : (
                            products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    className="h-full"
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: index * 0.12,
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default PersonalizedSection;
