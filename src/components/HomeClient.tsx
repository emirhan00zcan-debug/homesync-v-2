"use client";

import React, { useState, useMemo } from "react";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import OrchestrationSection from "@/components/OrchestrationSection";
import PersonalizedSection from "@/components/recommendations/PersonalizedSection";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Store, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import MasterCard from "@/components/discovery/MasterCard";

import { Product, Master } from '@/types';

interface HomeClientProps {
    initialProducts: Product[];
    stores: any[];
    masters: Master[];
}

export default function HomeClient({ initialProducts, stores, masters }: HomeClientProps) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const { scrollYProgress } = useScroll();

    const filteredProducts = useMemo(() => {
        if (selectedCategory === "all") return initialProducts;

        return initialProducts.filter(product => {
            if (selectedCategory === "chandeliers") {
                return product.category === "Chandeliers" || product.name.toLowerCase().includes("avize") || product.name.toLowerCase().includes("lambader");
            }
            if (selectedCategory === "smart") {
                return product.category === "Smart" || product.name.toLowerCase().includes("akıllı") || product.name.toLowerCase().includes("sensör");
            }
            return product.category === selectedCategory;
        });
    }, [selectedCategory, initialProducts]);

    return (
        <main
            data-theme="dark"
            className="relative min-h-screen bg-background text-foreground max-w-[100vw]"
        >
            {/* Scroll Progress Indicator */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-[2px] bg-radiant-amber z-[100] origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            <Hero />

            <div id="products-section" className="pt-4 px-6 md:px-12 max-w-7xl mx-auto pb-24 relative z-10">
                <ProductGrid products={filteredProducts} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                <PersonalizedSection initialProducts={initialProducts.slice(0, 4)} />
            </motion.div>

            {/* Featured Stores Section */}
            {stores && stores.length > 0 && (
                <motion.section 
                    className="py-24 px-6 md:px-12 max-w-7xl mx-auto"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-radiant-amber opacity-80">Pazaryeri</p>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-foreground">Öne Çıkan Mağazalar</h2>
                        </div>
                        <Link href="/magazalar" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:opacity-100 transition-opacity whitespace-nowrap">
                            Tüm Mağazalar
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className={`grid grid-cols-1 gap-8 ${stores.length === 1 ? 'max-w-sm mx-auto' : stores.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
                        {stores.map((store) => (
                            <Link key={store.id} href={`/stores/${store.slug}`} className="group relative">
                                <div className="glass-ultra rounded-[32px] border border-current/10 p-8 transition-all duration-500 hover:border-radiant-amber hover:shadow-glow-soft bg-current/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden glass-pill border border-current/10 shrink-0 bg-background flex items-center justify-center">
                                            {store.logo_url ? (
                                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Store size={20} className="text-foreground/20" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-radiant-amber transition-colors">
                                                {store.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <ShieldCheck size={10} className="text-emerald-500" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/80">Onaylı</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-foreground/40 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                                        {store.description || "Seçkin HomeSync satıcısı."}
                                    </p>
                                    <div className="w-8 h-8 rounded-full border border-current/10 flex items-center justify-center group-hover:bg-radiant-amber group-hover:border-radiant-amber transition-all group-hover:scale-110 ml-auto">
                                        <ArrowRight size={14} className="text-foreground group-hover:text-background" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            )}
            {masters && masters.length > 0 && (
                <motion.section 
                    className="py-24 px-6 md:px-12 max-w-7xl mx-auto"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-radiant-amber opacity-80">Zanaatkarlar</p>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-foreground">Öne Çıkan Ustalar</h2>
                        </div>
                        <Link href="/ustalar" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:opacity-100 transition-opacity whitespace-nowrap">
                            Tüm Ustalar
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {masters.map((master) => (
                            <MasterCard key={master.id} master={master} />
                        ))}
                    </div>
                </motion.section>
            )}



            <OrchestrationSection />

            <footer className="py-40 border-t text-center px-6 border-current/10">
                <p className="opacity-20 text-[10px] font-black tracking-[0.5em] uppercase mb-8">HomeSync Luxury Interiors • 2026</p>
                <div className="max-w-xl mx-auto space-y-4">
                    <p className="opacity-60 text-sm leading-relaxed italic">
                        &quot;Geleceğin ışığını yerçekiminden özgür bıraktık.&quot;
                    </p>
                    <div className="w-12 h-[1px] bg-radiant-amber mx-auto" />
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Istanbul • London • Dubai</p>
                </div>
            </footer>
        </main>
    );
}
