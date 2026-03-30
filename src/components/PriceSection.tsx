"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store';
import { Check, ShieldCheck, Zap, ChevronDown } from 'lucide-react';

import { Product } from '@/types';

interface PriceSectionProps {
    product: Product;
}

const PriceSection = ({ product }: PriceSectionProps) => {
    const [includeAssembly, setIncludeAssembly] = useState(true);
    const [showInstallments, setShowInstallments] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const addToCart = useCartStore((state) => state.addToCart);

    const assemblyPrice = 1250;
    const totalPrice = includeAssembly ? product.price + assemblyPrice : product.price;

    const handleAddToCart = () => {
        addToCart(product, includeAssembly);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Price & Badges */}
            <div>
                <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-radiant-amber">
                        {totalPrice.toLocaleString('tr-TR')} ₺
                    </span>
                    {includeAssembly && (
                        <span className="text-sm text-ivory-white/40 line-through">
                            {product.price.toLocaleString('tr-TR')} ₺
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="glass px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-400" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">2 Yıl Garanti</span>
                    </div>
                    <div className="glass px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <Zap size={14} className="text-radiant-amber shadow-glow" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Hızlı Kurulum</span>
                    </div>
                </div>
            </div>

            {/* Assembly Toggle */}
            <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${includeAssembly ? 'bg-radiant-amber/20 text-radiant-amber' : 'bg-white/10 text-white/40'}`}>
                            <Check size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Profesyonel Montaj Paketi</p>
                            <p className="text-xs text-ivory-white/40">Sertifikalı ustalar tarafından kurulum.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIncludeAssembly(!includeAssembly)}
                        className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${includeAssembly ? 'bg-radiant-amber' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${includeAssembly ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <span className="text-xs font-medium opacity-60">Hizmet Bedeli</span>
                    <span className="text-sm font-bold text-radiant-amber">+{assemblyPrice} ₺</span>
                </div>
            </div>

            {/* Specs Table */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-ivory-white/30">Teknik Özellikler</h4>
                <div className="grid grid-cols-1 gap-1">
                    {product.features?.map((spec, i) => (
                        <div key={i} className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-sm text-ivory-white/60">{spec.label}</span>
                            <span className="text-sm font-medium">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Installment Accordion */}
            <div className="glass overflow-hidden rounded-2xl border border-white/5">
                <button
                    onClick={() => setShowInstallments(!showInstallments)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <span className="text-sm font-medium">Taksit Seçenekleri</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${showInstallments ? 'rotate-180' : ''}`} />
                </button>
                {showInstallments && (
                    <div className="p-4 pt-0 space-y-2">
                        <div className="flex justify-between text-xs py-2 border-b border-white/5 opacity-60">
                            <span>Banka</span>
                            <span>Taksit</span>
                            <span>Aylık</span>
                        </div>
                        {[
                            { b: "Ziraat", t: 6, m: totalPrice / 6 },
                            { b: "Garanti", t: 12, m: totalPrice / 12 }
                        ].map((plan, i) => (
                            <div key={i} className="flex justify-between text-xs py-2">
                                <span className="font-bold">{plan.b}</span>
                                <span>{plan.t} Taksit</span>
                                <span className="text-radiant-amber">{plan.m.toFixed(0)} ₺</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main CTA */}
            <button
                onClick={handleAddToCart}
                className={`w-full py-5 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,191,0,0.2)] flex items-center justify-center gap-2 ${isAdded ? 'bg-green-500 text-white' : 'bg-radiant-amber text-cosmic-blue'
                    }`}
            >
                {isAdded ? (
                    <>TAMAMLANDI <Check size={20} /></>
                ) : (
                    <>SEPETE EKLE</>
                )}
            </button>
        </div>
    );
};

export default PriceSection;
