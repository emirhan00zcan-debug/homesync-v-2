"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Share2,
    Heart,
    MapPin,
    AlertCircle,
    Lightbulb,
    Zap,
    Ruler,
    ShieldCheck,
    Star,
    Eye,
    ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { useThemeEffect } from '@/context/ThemeContext';
import PriceSection from '@/components/PriceSection';
import InteractiveLamp from '@/components/InteractiveLamp';
import ReviewSection from '@/components/ReviewSection';
import { incrementLikeCount, toggleFavorite, getFavoriteStatus } from '@/app/actions/customer/product-interactions';
import { useProductTracking } from '@/hooks/useProductTracking';

import { Product } from '@/types';

interface ProductClientProps {
    product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
    const { isLightOn } = useThemeEffect();
    const [likes, setLikes] = React.useState(product.likeCount || 0);
    const [isLiked, setIsLiked] = React.useState(false);
    const [isFavorited, setIsFavorited] = React.useState(false);

    // Davranış takibi — ürün görüntülendiğinde kategori skoru ve fiyat aralığını güncelle
    useProductTracking({
        productId: product.id,
        category: product.category,
        price: product.price != null ? Number(product.price) : undefined,
    });

    // Initial favorite check
    React.useEffect(() => {
        const checkFav = async () => {
            const favStatus = await getFavoriteStatus(product.id);
            setIsFavorited(favStatus);
        };
        checkFav();
    }, [product.id]);

    // Check if vendor has uploaded data
    const isDataLoaded = product.manufacturer !== "HomeSync Premium";

    const handleLike = async () => {
        if (isLiked) return;
        setIsLiked(true);
        setLikes((prev: number) => prev + 1);
        await incrementLikeCount(product.id);
    };

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        const res = await toggleFavorite(product.id);
        if (res.success) {
            setIsFavorited(!!res.toggled);
        } else if (res.error) {
            alert(res.error);
        }
    };

    return (
        <main
            className={`relative min-h-screen transition-all duration-1000 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'
                }`}
        >
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] transition-all duration-1000 ${isLightOn ? 'bg-radiant-amber/5' : 'bg-radiant-amber/10'
                    }`} />
            </div>

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
                <Link
                    href="/katalog"
                    className="pointer-events-auto w-12 h-12 glass rounded-full flex items-center justify-center border border-white/10 hover:border-radiant-amber transition-all hover:scale-110 active:scale-90"
                >
                    <ChevronLeft size={24} />
                </Link>

                <div className="flex gap-4 pointer-events-auto">
                    <div className="glass px-6 rounded-full flex items-center gap-6 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-radiant-amber" />
                            <span>{product.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/10" />
                        <div className="flex items-center gap-2 opacity-40">
                            <Eye size={14} />
                            <span>{product.viewCount}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLike}
                        disabled={isLiked}
                        className={`w-12 h-12 glass rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-90 ${isLiked ? 'border-radiant-amber text-radiant-amber' : 'border-white/10 hover:text-radiant-amber'}`}
                    >
                        <ThumbsUp size={20} />
                    </button>
                    <button className="w-12 h-12 glass rounded-full flex items-center justify-center border border-white/10 hover:border-radiant-amber transition-all hover:scale-110 active:scale-90">
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={handleFavorite}
                        className={`w-12 h-12 glass rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-90 ${isFavorited ? 'border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 hover:text-red-400'}`}
                    >
                        <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-20">

                    {/* Left Side: Sticky Interactive Lamp (60%) */}
                    <div className="lg:w-[60%] lg:sticky lg:top-32 h-fit min-h-[600px] flex flex-col items-center justify-center overflow-visible">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative w-full overflow-visible flex items-center justify-center mb-20"
                        >
                            <InteractiveLamp />

                            {/* Volumetric shadow for the floating effect */}
                            <div className={`absolute -bottom-20 w-40 h-10 blur-3xl rounded-full transition-all duration-1000 ${isLightOn ? 'bg-black/10 scale-110' : 'bg-black/40 scale-100'
                                }`} />
                        </motion.div>

                        {/* Manufacturer-provided photos placeholder */}
                        <div className="w-full mt-24">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 ml-4">Manufacturer Showcase</h4>
                            <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`aspect-square rounded-[32px] border flex items-center justify-center relative group overflow-hidden ${isLightOn ? 'bg-black/[0.02] border-black/5' : 'bg-white/5 border-white/10'
                                        }`}>
                                        {!isDataLoaded ? (
                                            <div className="text-center p-4">
                                                <AlertCircle size={20} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-20 leading-loose">Awaiting Hi-Res Assets</p>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-radiant-amber/10 to-transparent" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Product Details (40%) */}
                    <div className="lg:w-[40%] space-y-16">
                        <section className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="text-radiant-amber text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">
                                    {product.manufacturer} • AUTHORIZED VENDOR
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                                    {product.name}
                                </h1>
                                <p className={`text-lg leading-relaxed font-light ${isLightOn ? 'text-cosmic-blue/70' : 'text-ivory-white/70'}`}>
                                    {product.description}
                                </p>
                            </motion.div>
                        </section>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <PriceSection product={product} />
                        </motion.div>

                        {/* Integration Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Link href={`/dashboard/technician?category=${product.category}`}>
                                <button className="w-full py-6 group relative rounded-[32px] glass border border-radiant-amber/30 text-white overflow-hidden transition-all duration-700 hover:shadow-glow">
                                    <div className="absolute inset-0 bg-radiant-amber translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                    <div className="relative z-10 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] group-hover:text-cosmic-blue transition-colors">
                                        <MapPin size={18} /> Find Certified Installer
                                    </div>
                                </button>
                            </Link>
                        </motion.div>

                        {/* Technical Specs Architectural Table */}
                        <section className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Teknik Spesifikasyonlar</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <SpecRow icon={<Lightbulb size={16} />} label="Işık Akısı" value={isDataLoaded ? `${product.lumens} Lümen` : "VERİ BEKLENİYOR"} />
                                <SpecRow icon={<Zap size={16} />} label="Güç Tüketimi" value={isDataLoaded ? `${product.wattage} Watt` : "VERİ BEKLENİYOR"} />
                                <SpecRow icon={<Ruler size={16} />} label="Malzeme Yapısı" value={isDataLoaded ? product.material : "VERİ BEKLENİYOR"} />
                                <SpecRow icon={<ShieldCheck size={16} />} label="Garanti & Kurulum" value="VIP Kurulum Dahil" />
                            </div>
                        </section>

                        {/* Dynamic Review System */}
                        <ReviewSection productId={product.id} initialReviews={product.reviews || []} />
                    </div>
                </div>
            </div>

            {/* Footer Decoration */}
            <div className={`mt-24 py-12 text-center border-t ${isLightOn ? 'border-black/5' : 'border-white/5'}`}>
                <p className="text-[8px] font-bold uppercase tracking-[0.8em] opacity-20">HomeSync Architectural Lighting • 2026 Collection</p>
            </div>
        </main>
    );
}

const SpecRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined }) => {
    const { isLightOn } = useThemeEffect();
    return (
        <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-700 ${isLightOn ? 'border-black/5 bg-black/[0.02]' : 'border-white/5 bg-white/[0.03]'
            }`}>
            <div className="flex items-center gap-4">
                <div className="text-radiant-amber opacity-60">{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
            </div>
            <span className="text-sm font-bold tracking-tight">{value}</span>
        </div>
    );
}
