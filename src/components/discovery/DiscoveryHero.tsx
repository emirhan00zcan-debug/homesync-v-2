"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function DiscoveryHero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-deep-space">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 mesh-gradient opacity-40" />

            {/* Floating Chandelier Mockup */}
            <motion.div 
                style={{ y: y1, opacity }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative mb-8 group">
                    {/* Glow effect */}
                    <div className="absolute -inset-10 bg-radiant-amber/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    {/* Placeholder for high-end 3D visual or high-priority image */}
                    <div className="w-[300px] h-[450px] md:w-[400px] md:h-[600px] glass-premium rounded-[100px] overflow-hidden floating-shadow animate-float-heavy flex items-center justify-center p-12 border border-white/10">
                        <img 
                            src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800" 
                            alt="Nox Series Gold"
                            className="w-full h-full object-contain glow-amber"
                        />
                    </div>
                </div>

                <div className="text-center z-20 space-y-4 px-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-radiant-amber mb-2 drop-shadow-sm">
                        Luxe Design Studio • Keşfet
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-ivory-white tracking-tighter italic leading-none">
                        IŞIĞI KEŞFET,<br />
                        <span className="text-radiant-amber">YERÇEKİMİNDEN</span> ÖZGÜRLEŞ.
                    </h1>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
                <span className="text-[10px] uppercase tracking-[0.4em] text-white">Aşağı Kaydır</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
                <ArrowDown size={14} className="text-white animate-bounce" />
            </motion.div>
        </section>
    );
}
