"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';
import { ShoppingBag, Truck, Wrench, ArrowRight } from 'lucide-react';

const OrchestrationSection = () => {
    const steps = [
        {
            icon: <ShoppingBag className="w-6 h-6" />,
            title: "Kusursuz Seçim",
            description: "Premium aydınlatma koleksiyonumuzdan tarzınıza en uygun olanı seçin.",
            color: "bg-blue-500"
        },
        {
            icon: <Truck className="w-6 h-6" />,
            title: "Hızlı Teslimat",
            description: "Ürününüz özel korumalı ambalajında kapınıza kadar ücretsiz gelsin.",
            color: "bg-radiant-amber"
        },
        {
            icon: <Wrench className="w-6 h-6" />,
            title: "Sertifikalı Kurulum",
            description: "Professional ekiplerimiz, siz daha kutuyu açmadan kurulum için randevulaşır.",
            color: "bg-green-500"
        }
    ];

    return (
        <section className="py-32 px-6 md:px-12 relative overflow-hidden transition-colors duration-1000 bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-radiant-amber text-xs font-black uppercase tracking-[0.4em] mb-4 block"
                    >
                        Zahmetsiz Süreç
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground"
                    >
                        Tüm Süreci Biz <br />
                        <span className="text-radiant-amber">Senkronize Ediyoruz.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-radiant-amber/10 -translate-y-1/2 hidden md:block" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative z-10 flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 shadow-2xl bg-current/5 text-foreground">
                                <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full ${step.color}`} />
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-foreground">{step.title}</h3>
                            <p className="text-sm opacity-50 leading-relaxed max-w-[250px] text-foreground">
                                {step.description}
                            </p>

                            {index < steps.length - 1 && (
                                <div className="absolute top-10 -right-6 text-radiant-amber hidden md:block opacity-20">
                                    <ArrowRight className="w-12 h-12" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-8 md:p-12 rounded-[3rem] border border-current/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-1000 glass-ultra bg-current/5"
                >
                    <div className="text-center md:text-left">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 text-foreground">Her Şey Dahil Hizmet</h4>
                        <p className="text-sm opacity-60 text-foreground">Ürün alımından montaj bitimine kadar hiçbir ek ücret ödemezsiniz.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gray-500 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Usta" />
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-widest text-foreground">120+ Sertifikalı</p>
                            <p className="text-[10px] opacity-40 uppercase tracking-widest text-foreground">Profesyonel Ekip</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-radiant-amber/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
};

export default OrchestrationSection;
