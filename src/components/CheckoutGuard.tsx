"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CheckoutGuardProps {
    children: React.ReactNode;
}

export default function CheckoutGuard({ children }: CheckoutGuardProps) {
    const { user, isLoading } = useAuth();
    const [showBridge, setShowBridge] = useState(false);
    const router = useRouter();

    const handleCheckoutClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            setShowBridge(true);
        }
    };

    if (isLoading) return <>{children}</>;

    return (
        <>
            <div onClickCapture={handleCheckoutClick}>
                {children}
            </div>

            <AnimatePresence>
                {showBridge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBridge(false)}
                            className="absolute inset-0 bg-cosmic-blue/80 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass p-10 rounded-[48px] border border-white/10 shadow-3xl bg-white/[0.01] overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-radiant-amber/10 blur-[60px] rounded-full" />

                            <button
                                onClick={() => setShowBridge(false)}
                                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-10 text-center">
                                <div className="w-16 h-16 glass rounded-full flex items-center justify-center border border-radiant-amber/30 mx-auto mb-6 shadow-glow">
                                    <ShieldCheck className="text-radiant-amber" size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-widest uppercase">Güvenli Ödeme</h2>
                                <p className="text-white/40 mt-3 text-sm font-bold uppercase tracking-wider">Devam etmek için bir hesabınız olmalı</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => router.push('/auth?mode=LOGIN&callbackUrl=/checkout')}
                                    className="w-full py-5 bg-radiant-amber text-cosmic-blue font-black rounded-2xl hover:shadow-glow transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                                >
                                    Giriş Yap <LogIn size={18} />
                                </button>

                                <button
                                    onClick={() => router.push('/auth?mode=REGISTER&callbackUrl=/checkout')}
                                    className="w-full py-5 glass border border-white/10 text-white font-black rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                                >
                                    Üye Ol <UserPlus size={18} />
                                </button>
                            </div>

                            <p className="mt-8 text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                                HomeSync Güvencesiyle 256-Bit SSL Korumalı Ödeme
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
