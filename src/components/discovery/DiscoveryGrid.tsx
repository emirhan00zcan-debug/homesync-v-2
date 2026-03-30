"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Heart, Sparkles } from "lucide-react";

interface DiscoveryItem {
    id: string;
    name: string;
    image: string;
    category: string;
    size: "small" | "medium" | "large";
}

const mockDiscovery: DiscoveryItem[] = [
    { id: "1", name: "Nox Gold Pendulum", image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600", category: "Lighting", size: "large" },
    { id: "2", name: "Aura Smart Orb", image: "https://images.unsplash.com/photo-1524484430489-0ae43fbe0644?auto=format&fit=crop&q=80&w=600", category: "Smart Home", size: "medium" },
    { id: "3", name: "Eclipse Wall Sconce", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600", category: "Decor", size: "small" },
    { id: "4", name: "Celestial Chandelier", image: "https://images.unsplash.com/photo-1571508601936-6ca847b47ae4?auto=format&fit=crop&q=80&w=600", category: "Lighting", size: "medium" },
    { id: "5", name: "Solaris Floor Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed04393482?auto=format&fit=crop&q=80&w=600", category: "Lighting", size: "large" },
    { id: "6", name: "Void Side Table", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600", category: "Furniture", size: "small" },
];

export default function DiscoveryGrid() {
    return (
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-ivory-white tracking-tighter italic mb-4">
                        Görsel Akış
                    </h2>
                    <p className="text-white/40 max-w-md text-sm font-medium">
                        Studio&apos;nun en yeni parçalarını ve ilham veren tasarımlarını keşfet.
                    </p>
                </div>
                <div className="flex gap-4">
                    {["Tümü", "Aydınlatma", "Mobilya", "Dekor"].map((filter) => (
                        <button key={filter} className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full border border-white/10 hover:border-radiant-amber hover:text-radiant-amber transition-all">
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                {mockDiscovery.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="relative group break-inside-avoid"
                    >
                        <div className="relative overflow-hidden rounded-[40px] glass border border-white/5 cursor-pointer">
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-radiant-amber mb-2">{item.category}</p>
                                        <h3 className="text-xl font-black text-white italic tracking-tight">{item.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                            <Heart size={16} className="text-white" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-radiant-amber flex items-center justify-center hover:scale-110 transition-transform">
                                            <Plus size={16} className="text-deep-space" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Badge Overlay (Top Left) */}
                            <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="glass-premium px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                    <Sparkles size={10} className="text-radiant-amber" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Montaj Dahil</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
