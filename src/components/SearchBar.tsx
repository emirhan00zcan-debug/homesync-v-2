"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useThemeEffect } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import Link from 'next/link';

export default function SearchBar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isNexusActive, setIsNexusActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Dışarıya tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Klavyeden Escape ile kapat
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsExpanded(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Arama sorgusu
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                setIsNexusActive(false);
                return;
            }

            setIsLoading(true);

            // 1. Geleneksel Arama (Exact Match/ILike)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`)
                .limit(4);

            if (!error && data && data.length > 0) {
                setResults(data);
                setIsNexusActive(false); // Geleneksel sonuç varsa Nexus'a gerek yok
            } else {
                // 2. Nexus Semantik Arama (Eğer geleneksel arama boşsa veya sorgu uzunsa)
                if (query.length > 10) {
                    try {
                        const nexusRes = await fetch('/api/ai/nexus', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query })
                        });

                        const nexusData = await nexusRes.json();

                        if (nexusData.analysis && nexusData.analysis.keywords) {
                            setIsNexusActive(true);

                            // Nexus anahtar kelimeleriyle yeni bir arama yap
                            const { data: nexusResults, error: nexusError } = await supabase
                                .from('products')
                                .select('*')
                                .or(nexusData.analysis.keywords.map((k: string) => `name.ilike.%${k}%,description.ilike.%${k}%`).join(','))
                                .limit(4);

                            if (!nexusError && nexusResults) {
                                setResults(nexusResults);
                            }
                        }
                    } catch (err) {
                        console.error("Nexus integration error:", err);
                    }
                } else {
                    setResults([]);
                }
            }
            setIsLoading(false);
        };

        const debounceTimer = setTimeout(fetchResults, 400);
        return () => clearTimeout(debounceTimer);
    }, [query, supabase]);

    const handleOpen = () => {
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    return (
        <div className="relative flex items-center shrink-0 z-[150]" ref={containerRef}>
            <motion.div
                initial={false}
                animate={{
                    width: isExpanded ? 300 : 48,
                    backgroundColor: isExpanded ? 'rgba(10, 25, 47, 0.95)' : 'transparent'
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`h-12 glass-premium rounded-full flex items-center border border-white/10 overflow-hidden shadow-sm transition-colors ${!isExpanded && 'hover:bg-white/5 text-white'}`}
            >
                <button
                    onClick={handleOpen}
                    className="w-12 h-12 flex items-center justify-center shrink-0 text-white"
                >
                    <Search size={20} />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ürün ara..."
                    className="flex-1 bg-transparent border-none outline-none pr-4 text-sm font-bold w-full text-white placeholder:text-white/40"
                    style={{
                        opacity: isExpanded ? 1 : 0,
                        visibility: isExpanded ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease-in-out'
                    }}
                />

                {isExpanded && query && (
                    <button
                        onClick={() => setQuery('')}
                        className="w-10 h-12 flex items-center justify-center shrink-0 transition-colors text-white/50 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </motion.div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isExpanded && query && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[120%] right-0 w-[350px] rounded-3xl border shadow-2xl overflow-hidden z-[200] bg-[#0A192F]/95 border-white/10 backdrop-blur-xl"
                    >
                        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-radiant-amber" />
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                            {isNexusActive ? 'Nexus Semantik Analiz' : 'En İyi Sonuçlar'}
                                        </span>
                                        {isNexusActive && (
                                            <span className="flex items-center gap-1 text-[8px] bg-radiant-amber/20 text-radiant-amber px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                <div className="w-1 h-1 bg-radiant-amber rounded-full animate-pulse" />
                                                Nexus AI
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {results.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.slug}`}
                                                onClick={() => setIsExpanded(false)}
                                                className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/5"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0 relative overflow-hidden">
                                                    <Search className="w-4 h-4 opacity-20 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold truncate text-white">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                                                        {product.price.toLocaleString('tr-TR')} ₺
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 opacity-30 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-white/5 w-full text-center">
                                        <Link
                                            href={`/katalog?search=${query}`}
                                            onClick={() => setIsExpanded(false)}
                                            className="text-[10px] font-bold uppercase tracking-widest transition-colors text-white/60 hover:text-radiant-amber"
                                        >
                                            Tüm Sonuçlar &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-xs text-white/60">
                                        &quot;{query}&quot; için sonuç bulunamadı.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
