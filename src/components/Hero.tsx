"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

    return (
        <section ref={containerRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden mesh-background">
            
            {/* The "Anti-Gravity" CSS Art Orb replacing the static image */}
            <motion.div 
                style={{ y, scale }}
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <div className="relative w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] flex items-center justify-center">
                    {/* Glowing Core - Visible in both, but softer in light mode */}
                    <div className="absolute w-full h-full bg-radiant-amber rounded-full opacity-[0.03] dark:opacity-[0.08] mix-blend-multiply dark:mix-blend-screen animate-orb blur-[100px]" />
                    
                    {/* Dark Mode Rings */}
                    <div className="hidden dark:block absolute w-[80%] h-[80%] border-[2px] border-foreground/10 rounded-[40%] animate-[spin_20s_linear_infinite]" />
                    <div className="hidden dark:block absolute w-[60%] h-[60%] border-[1px] border-radiant-amber/20 rounded-[35%] animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="hidden dark:block w-[2px] h-[40%] bg-gradient-to-b from-transparent via-radiant-amber/50 to-transparent shadow-[0_0_40px_rgba(255,191,0,0.4)]" />

                    {/* Light Mode Soft Elements - Simple, Aesthetic, Clean */}
                    <div className="dark:hidden absolute w-[60%] h-[60%] bg-gradient-to-tr from-orange-100/40 via-yellow-50/20 to-transparent rounded-full blur-[40px] mix-blend-multiply" />
                    <div className="dark:hidden absolute w-[40%] h-[40%] border border-black/5 rounded-full" />
                </div>
            </motion.div>

            {/* Front Content */}
            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center pt-20">
                
                {/* Badge */}
                <div className="opacity-0 animate-title" style={{ animationDelay: '0.2s' }}>
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-current/10 glass-pill mb-10">
                        <Sparkles size={14} className="text-radiant-amber" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-foreground/80">
                            Yerçekimsiz Lüks Tasarım
                        </span>
                    </div>
                </div>

                {/* Main Headline - Ultra Premium Typography */}
                <h1 className="opacity-0 animate-title text-5xl sm:text-7xl md:text-8xl lg:text-[130px] font-black tracking-tighter text-foreground leading-[0.85] mb-8 text-glow" style={{ animationDelay: '0.4s' }}>
                    IŞIĞI <br className="hidden md:block" />
                    <span className="relative inline-block">
                        <span className="absolute -inset-2 bg-gradient-to-r from-radiant-amber/0 via-radiant-amber/10 to-radiant-amber/0 blur-xl rounded-full" />
                        <i className="text-transparent bg-clip-text bg-gradient-to-br from-radiant-amber via-yellow-400 to-orange-500 relative z-10 pr-2 pb-2">ÖZGÜR</i>
                    </span><br className="hidden md:block" />
                    BIRAKIN.
                </h1>

                {/* Subheadline */}
                <p className="opacity-0 animate-title text-base sm:text-lg md:text-xl font-medium text-foreground/60 max-w-2xl mx-auto mb-14 leading-relaxed" style={{ animationDelay: '0.6s' }}>
                    Minimalist fütürizm ve kusursuz mühendislik. Yaşam alanlarınızı sınırların ötesine taşıyan <br className="hidden md:block" /> premium akıllı aydınlatma.
                </p>

                {/* CTA Buttons - Sleek & Modern */}
                <div className="opacity-0 animate-title flex flex-col sm:flex-row items-center gap-6" style={{ animationDelay: '0.8s' }}>
                    <button 
                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group relative px-8 py-4 bg-foreground rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-background/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <span className="relative z-10 flex items-center gap-3 text-background font-black uppercase tracking-[0.15em] text-xs">
                            Koleksiyonu Keşfet
                            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                    </button>

                    <button 
                        onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-8 py-4 rounded-full border border-current/10 glass-pill transition-all duration-500 hover:bg-current/5 active:scale-95"
                    >
                        <span className="flex items-center gap-3 text-foreground font-black uppercase tracking-[0.15em] text-xs group-hover:text-radiant-amber transition-colors">
                            Profesyonel Montaj
                        </span>
                    </button>
                </div>

            </div>

            {/* Subtle overlay gradient to blend into the next section */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
        </section>
    );
};

export default Hero;
