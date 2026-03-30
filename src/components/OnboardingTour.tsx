"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface TourStep {
    title: string;
    description: string;
    emoji: string;
}

const VENDOR_STEPS: TourStep[] = [
    {
        emoji: '🏪',
        title: 'Satıcı Panosu\'na Hoş Geldiniz!',
        description: 'Bu panel, mağazanızı yönetmeniz için tasarlandı. Sol menüden Pano, Envanter, Siparişler ve Kazançlar bölümlerine ulaşabilirsiniz.',
    },
    {
        emoji: '📦',
        title: 'Ürünlerinizi Buradan Yönetin',
        description: '"Envanter" bölümünden yeni ürün ekleyebilir, mevcut ürünleri düzenleyebilir ya da silebilirsiniz. Fiyat ve stok güncellemeleri anında yayınlanır.',
    },
    {
        emoji: '⚡',
        title: 'Toplu Excel Yükleme',
        description: 'Envanter sayfasındaki "Toplu Yükle" butonu ile yüzlerce ürünü tek seferde Excel\'den aktarabilirsiniz. Şablon dosyasını indirip doldurmak yeterli!',
    },
    {
        emoji: '📊',
        title: 'Siparişlerinizi Takip Edin',
        description: '"Siparişler" sayfasından gelen siparişleri görüntüleyebilir ve durumlarını güncelleyebilirsiniz. Hazır olduğunuzda işe başlayalım! 🚀',
    },
];

const TECHNICIAN_STEPS: TourStep[] = [
    {
        emoji: '🔧',
        title: 'Teknisyen Panosu\'na Hoş Geldiniz!',
        description: 'Bu panel, gelen işleri kabul edip yönetmeniz için tasarlandı. Telefonu elinizde tutun — yeni iş geldiğinde SMS ile anında haberdar olursunuz!',
    },
    {
        emoji: '📋',
        title: 'Gelen İşleri Buradan Kabul Edin',
        description: 'Yeni bir iş atandığında panoda görünür. İş kartına tıklayarak müşteri bilgilerini, adresi ve iş detaylarını görebilirsiniz.',
    },
    {
        emoji: '✅',
        title: 'İşi Kabul veya Reddedin',
        description: 'Her iş için "Kabul Et" veya "Reddet" seçeneği mevcuttur. Kabul ettiğiniz iş müşteriye bildirilir ve takviminizdeki yerinizi alır.',
    },
];

const STORAGE_KEY_PREFIX = 'onboarding_completed_';

interface OnboardingTourProps {
    role: 'vendor' | 'technician';
}

export default function OnboardingTour({ role }: OnboardingTourProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = role === 'vendor' ? VENDOR_STEPS : TECHNICIAN_STEPS;
    const storageKey = `${STORAGE_KEY_PREFIX}${role}`;

    useEffect(() => {
        try {
            const completed = localStorage.getItem(storageKey);
            if (!completed) {
                // Kısa gecikme ile göster — dashboard render tamamlansın
                const timer = setTimeout(() => setIsVisible(true), 1000);
                return () => clearTimeout(timer);
            }
        } catch {
            // localStorage erişim hatası — sessizce geç
        }
    }, [storageKey]);

    const handleComplete = () => {
        try {
            localStorage.setItem(storageKey, 'true');
        } catch {
            // ignore
        }
        setIsVisible(false);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const isLast = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                    />

                    {/* Center modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div
                            className="w-full max-w-md rounded-[32px] border border-white/10 p-8 pointer-events-auto relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, #0e2140 0%, #0A192F 100%)',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Glow accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                                style={{
                                    background: role === 'vendor'
                                        ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
                                        : 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)'
                                }}
                            />

                            {/* Close */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-5 right-5 text-white/20 hover:text-white/60 p-2 hover:bg-white/5 rounded-xl transition-all"
                            >
                                <X size={16} />
                            </button>

                            {/* Step indicator */}
                            <div className="flex gap-1.5 mb-8">
                                {steps.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ width: i === currentStep ? 24 : 6, opacity: i <= currentStep ? 1 : 0.2 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-1.5 rounded-full"
                                        style={{ background: role === 'vendor' ? '#3b82f6' : '#FFBF00' }}
                                    />
                                ))}
                            </div>

                            {/* Step content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22 }}
                                    className="mb-10"
                                >
                                    {/* Emoji */}
                                    <div className="text-5xl mb-6">{steps[currentStep].emoji}</div>

                                    {/* Badge */}
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Sparkles size={11} style={{ color: role === 'vendor' ? '#3b82f6' : '#FFBF00' }} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]"
                                            style={{ color: role === 'vendor' ? '#3b82f6' : '#FFBF00' }}>
                                            {currentStep + 1} / {steps.length}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black text-white tracking-tight mb-3 leading-tight">
                                        {steps[currentStep].title}
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        {steps[currentStep].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={() => setCurrentStep(s => s - 1)}
                                        className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm font-semibold transition-all"
                                    >
                                        <ArrowLeft size={15} />
                                        Geri
                                    </button>
                                )}

                                <button
                                    onClick={isLast ? handleComplete : () => setCurrentStep(s => s + 1)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
                                    style={{
                                        background: role === 'vendor'
                                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                            : 'linear-gradient(135deg, #FFBF00, #f59e0b)'
                                    }}
                                >
                                    {isLast ? 'Başlayalım!' : (
                                        <>
                                            İleri
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>

                            {!isLast && (
                                <button
                                    onClick={handleSkip}
                                    className="w-full mt-3 text-center text-[11px] text-white/20 hover:text-white/40 transition-colors py-1"
                                >
                                    Turu atla
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
