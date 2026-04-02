"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';
import { ShieldCheck, Zap, Globe, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

const ServiceBar = () => {
  const services = [
    { icon: <ShieldCheck size={14} />, text: "Premium Kalite" },
    { icon: <Zap size={14} />, text: "Akıllı Ev Uyumlu" },
    { icon: <Globe size={14} />, text: "Global Standartlar" },
    { icon: <Heart size={14} />, text: "7/24 Teknik Destek" },
    { icon: <ShieldCheck size={14} />, text: "2 Yıl Garanti" },
  ];
  const pathname = usePathname();

  if (pathname !== '/') {
      return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] w-full border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] bg-background/95 backdrop-blur-3xl pointer-events-auto">
      <div className="w-full py-3 md:py-4 px-4 md:px-8 border-t border-current/10 transition-colors duration-1000 flex items-center justify-between gap-4 md:gap-8 overflow-hidden glass-ultra shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-2xl">
      {/* Installation Badge Section */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0 z-10 bg-background/50 px-4 py-2 rounded-full glass-pill border border-current/5">
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-radiant-amber shadow-[0_0_20px_#FFBF00] animate-pulse" />
          <div className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full border border-radiant-amber/20 animate-[ping_3s_infinite]" />
        </div>
        <div>
          <h4 className="text-xs md:text-sm font-black tracking-tighter uppercase leading-none text-foreground">
            Usta Hizmeti Dahil
          </h4>
          <p className="text-[7px] md:text-[8px] tracking-[0.2em] font-black text-radiant-amber uppercase mt-0.5 hidden sm:block">
            Sertifikalı Profesyoneller
          </p>
        </div>
      </div>

      {/* Dynamic Ticker Section */}
      <div className="relative flex-1 max-w-2xl overflow-hidden py-4 mask-fade">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-16 whitespace-nowrap"
        >
          {[...services, ...services].map((service, idx) => (
            <div key={idx} className="flex items-center gap-4 text-[11px] tracking-[0.3em] font-black uppercase text-foreground/40">
              <span className="text-radiant-amber opacity-60">{service.icon}</span>
              <span className="hover:text-radiant-amber transition-colors cursor-default">{service.text}</span>
              <span className="opacity-10 ml-8 text-lg">/</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <style jsx>{`
        .mask-fade {
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
      </div>
    </div>
  );
};

export default ServiceBar;
