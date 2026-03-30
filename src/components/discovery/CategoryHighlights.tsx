"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const highlights = [
    {
        title: "Kozmik Aydınlatma",
        subtitle: "Luxe Series",
        description: "Yerçekimine meydan okuyan avizeler ve akıllı ışık sistemleri.",
        image: "https://images.unsplash.com/photo-1543269664-76ad3997d9ea?auto=format&fit=crop&q=80&w=800",
        color: "from-amber-500/20"
    },
    {
        title: "Akıllı Mimari",
        subtitle: "HomeSync Core",
        description: "Evinizi sizinle birlikte yaşayan bir organizmaya dönüştürün.",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
        color: "from-blue-500/20"
    }
];

export default function CategoryHighlights() {
    return (
        <section className="py-40 px-6 md:px-12 bg-white/[0.02] border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="mb-24 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-radiant-amber opacity-60 mb-4">Koleksiyonlar</p>
                    <h2 className="text-5xl md:text-6xl font-black text-ivory-white tracking-tighter italic">Odak Noktaları</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {highlights.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative h-[600px] rounded-[60px] overflow-hidden border border-white/5"
                        >
                            {/* Background Image */}
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${item.color} via-deep-space/60 to-transparent`} />

                            {/* Content */}
                            <div className="relative z-10 h-full p-12 flex flex-col justify-end items-start text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-radiant-amber mb-4">{item.subtitle}</span>
                                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic mb-6 leading-none">
                                    {item.title}
                                </h3>
                                <p className="text-white/60 text-sm font-medium max-w-xs mb-8">
                                    {item.description}
                                </p>
                                <Link href="/katalog" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                    Koleksiyonu Gör 
                                    <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center group-hover:bg-radiant-amber transition-all group-hover:border-radiant-amber group-hover:rotate-45">
                                        <ArrowUpRight size={16} className="group-hover:text-deep-space transition-colors" />
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
