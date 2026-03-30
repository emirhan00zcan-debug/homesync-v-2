"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShieldCheck, Zap, ChevronRight, ShoppingBag, ArrowLeft, Frown } from 'lucide-react';
import Link from 'next/link';
import { useThemeEffect } from '@/context/ThemeContext';
import { useCartStore, useCartTotal } from '@/store';
import CheckoutGuard from '@/components/CheckoutGuard';
import OrbitManager from '@/components/OrbitManager';

export default function CartPage() {
    const { isLightOn } = useThemeEffect();
    const cart = useCartStore((s) => s.cart);
    const removeFromCart = useCartStore((s) => s.removeFromCart);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const cartTotal = useCartTotal();
    const activeDiscount = useCartStore((s) => s.activeDiscount);

    const assemblyPrice = 1250;

    if (cart.length === 0) {
        return (
            <main className={`relative min-h-screen pt-32 p-6 flex flex-col items-center justify-center transition-all duration-1000 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'
                }`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 glass rounded-full flex items-center justify-center border border-white/10 mx-auto mb-8">
                        <ShoppingBag className="opacity-20" size={40} />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Sepetiniz Boş</h1>
                    <p className="opacity-40 mb-12">Geleceğin ışığını keşfetmeye hazır mısınız?</p>
                    <Link href="/" className="px-8 py-4 bg-radiant-amber text-cosmic-blue font-bold rounded-2xl hover:scale-105 transition-all shadow-glow uppercase tracking-widest text-xs">
                        Alışverişe Başla
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main
            className={`relative min-h-screen transition-all duration-1000 p-6 md:p-12 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'
                }`}
        >
            <div className="max-w-5xl mx-auto pt-24 pb-20">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-12">
                    <ArrowLeft size={14} /> Keşfetmeye Devam Et
                </Link>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-6">
                        <h1 className="text-4xl font-black mb-8">Sepetim</h1>

                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`glass p-6 md:p-8 rounded-[40px] border flex flex-col md:flex-row gap-8 relative overflow-hidden transition-colors ${isLightOn ? 'bg-black/[0.02] border-black/5' : 'bg-white/5 border-white/10 shadow-2xl'
                                        }`}
                                >
                                    <div className="w-full md:w-32 aspect-square glass rounded-3xl border border-white/10 flex items-center justify-center shrink-0">
                                        <ShoppingBag className="opacity-20" size={32} />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-radiant-amber mb-1">Premium Aydınlatma Serisi</p>
                                                <h3 className="text-2xl font-bold">{item.name}</h3>
                                                {item.includeAssembly && (
                                                    <span className="text-[10px] flex items-center gap-1 text-green-400 font-bold uppercase tracking-tighter mt-1">
                                                        <ShieldCheck size={12} /> Profesyonel Montaj Hizmeti Dahil
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-11 h-11 flex items-center justify-center hover:bg-red-400/20 hover:text-red-400 rounded-full transition-all opacity-40 hover:opacity-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-2xl w-fit">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-11 h-11 flex items-center justify-center hover:text-radiant-amber"><Minus size={16} /></button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:text-radiant-amber"><Plus size={16} /></button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] opacity-40 uppercase font-black mb-1">Toplam</p>
                                                <span className="text-xl font-bold">
                                                    {((item.price + (item.includeAssembly ? assemblyPrice : 0)) * item.quantity).toLocaleString('tr-TR')} ₺
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:w-80">
                        <div className={`glass p-8 rounded-[40px] border border-white/10 sticky top-32 ${isLightOn ? 'bg-black/[0.02]' : 'bg-white/5 shadow-glow-sm'
                            }`}>
                            <h4 className="text-lg font-bold mb-8 uppercase tracking-widest">Sipariş Özeti</h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60 text-xs font-medium uppercase tracking-widest">Sipariş Toplamı</span>
                                    <span className="font-bold">{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60 text-xs font-medium uppercase tracking-widest">Kargo</span>
                                    <span className="text-green-400 font-bold">ÜCRETSİZ</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 mb-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">Genel Toplam</span>
                                        <div className="text-right">
                                            {activeDiscount > 0 && (
                                                <p className="text-xs line-through opacity-40 font-bold mb-1">
                                                    {(cartTotal / (1 - activeDiscount / 100)).toLocaleString('tr-TR')} ₺
                                                </p>
                                            )}
                                            <span className="text-3xl font-black text-radiant-amber">{cartTotal.toLocaleString('tr-TR')} ₺</span>
                                        </div>
                                    </div>
                                    {activeDiscount > 0 && (
                                        <div className="text-[9px] font-black uppercase tracking-widest text-radiant-amber text-right mt-2 animate-pulse">
                                            %{activeDiscount} Orbit İndirimi Uygulandı
                                        </div>
                                    )}
                                </div>
                            </div>

                            <CheckoutGuard>
                                <Link href="/checkout" className="w-full">
                                    <button className="w-full py-5 bg-radiant-amber text-cosmic-blue font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow flex items-center justify-center gap-2 group mb-6">
                                        ÖDEME YAP <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </CheckoutGuard>

                            <div className="space-y-4">
                                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Suggested Upgrades</h5>
                                <div className={`p-4 rounded-2xl border transition-all hover:border-radiant-amber/30 cursor-pointer ${isLightOn ? 'bg-black/[0.02] border-black/5' : 'bg-white/5 border-white/10'
                                    }`}>
                                    <p className="text-[10px] font-bold mb-1">Extended Life Warranty</p>
                                    <p className="text-[9px] opacity-40 uppercase tracking-widest">+450 ₺ / Product</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-center opacity-40 uppercase tracking-[0.2em] space-y-2">
                                <p className="flex items-center justify-center gap-1"><Zap size={10} /> 24 Saatte Kargoda</p>
                                <p className="flex items-center justify-center gap-1"><ShieldCheck size={10} /> Güvenli Ödeme</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <OrbitManager />
        </main>
    );
}
