"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Send, User, Bot, Loader2, ChevronRight, ShoppingCart, Zap, Sun, Moon, Volume2, VolumeX, Camera, Plus } from 'lucide-react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store';
import { useThemeEffect } from '@/context/ThemeContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AuraProductCard = ({ productId }: { productId: string }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const supabase = createBrowserClient();
    const addToCart = useCartStore((s) => s.addToCart);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await supabase
                    .from('products')
                    .select('*, store:stores(id, name, slug)')
                    .eq('id', productId)
                    .single();

                if (data) setProduct(data);
            } catch (err) {
                console.error("Aura Product Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, supabase]);

    const handleAddToCart = () => {
        if (!product) return;
        setAdding(true);
        addToCart({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            vendorId: product.store?.id
        }, false);
        
        setTimeout(() => setAdding(false), 1000);
    };

    if (loading) return (
        <div className="w-full h-32 glass-premium rounded-3xl animate-pulse flex items-center justify-center border border-white/5">
            <Loader2 className="animate-spin text-radiant-amber/20" size={20} />
        </div>
    );

    if (!product) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full glass-premium rounded-[32px] overflow-hidden border border-white/10 shadow-xl group mb-4"
        >
            <div className="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute w-24 h-24 bg-radiant-amber/10 blur-3xl rounded-full"
                />
                <Zap className="text-radiant-amber/20 z-0" size={48} />

                <div className="absolute bottom-4 left-4 z-20">
                    <h5 className="text-foreground font-black text-xs uppercase tracking-widest">{product.name}</h5>
                    <p className="text-radiant-amber font-black text-sm">{product.price.toLocaleString('tr-TR')} ₺</p>
                </div>
            </div>
            <div className="p-4 flex gap-2">
                <Link
                    href={`/product/${product.slug}`}
                    className="flex-1 bg-current/5 hover:bg-current/10 text-foreground/80 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all border border-current/5"
                >
                    İncele
                </Link>
                <button 
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        adding ? 'bg-green-500 text-white scale-90' : 'bg-radiant-amber text-cosmic-blue hover:shadow-glow'
                    }`}
                >
                    {adding ? <Plus size={16} className="animate-ping" /> : <ShoppingCart size={16} />}
                </button>
            </div>
        </motion.div>
    );
};

const MessageRenderer = ({ content }: { content: string }) => {
    const parts = content.split(/(\[PRODUCT:[a-zA-Z0-9-]+\])/g);

    return (
        <div className="space-y-2">
            {parts.map((part, i) => {
                const match = part.match(/\[PRODUCT:([a-zA-Z0-9-]+)\]/);
                if (match) {
                    return <AuraProductCard key={i} productId={match[1]} />;
                }
                return part ? <p key={i} className="whitespace-pre-wrap">{part}</p> : null;
            })}
        </div>
    );
};

export default function AuraAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Selamlar. Ben Aura. Anti-Gravity evreninin dijital bilinciyim. Işığın ve yerçekimsizliğin mükemmel uyumunu keşfetmeye hazır mısın?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emotion, setEmotion] = useState<'CALM' | 'EXCITED' | 'TASK'>('CALM');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { theme, toggleTheme } = useThemeEffect();
    const isLightOn = theme === 'light';
    const pathname = usePathname();

    

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const speakText = (text: string) => {
        if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/\[PRODUCT:[a-zA-Z0-9-]+\]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);
        setEmotion('TASK');

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, chatHistory: messages })
            });
            const data = await res.json();
            
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                if (data.emotion) setEmotion(data.emotion);
                
                if (data.command) {
                    if (data.command === 'SET_THEME:LIGHT' && !isLightOn) toggleTheme();
                    if (data.command === 'SET_THEME:DARK' && isLightOn) toggleTheme();
                    if (data.command === 'ANALYZE_ROOM') {
                        fileInputRef.current?.click();
                    }
                }
                speakText(data.response);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Bağlantım kısa bir süreliğine zayıfladı. Tekrar dener misin?" }]);
                setEmotion('CALM');
            }
        } catch (error) {
            console.error('Aura Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Frekanslarda bir bozulma var." }]);
            setEmotion('CALM');
        } finally {
            setIsLoading(false);
        }
    };
if (pathname?.startsWith('/katalog') || pathname?.startsWith('/koleksiyonlar') || pathname?.startsWith('/magazalar')) {
        return null;
    }
    return (
        <div className="fixed bottom-28 right-6 md:bottom-32 md:right-12 xl:right-[calc(50vw-37rem)] z-[1000] pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(20px)' }}
                        className="pointer-events-auto absolute bottom-24 right-0 w-[400px] h-[600px] max-h-[80vh] glass-ultra bg-background/90 rounded-[48px] overflow-hidden shadow-2xl border border-current/10 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-current/5 bg-current/[0.02] flex justify-between items-center relative overflow-hidden">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -left-10 w-32 h-32 bg-radiant-amber/5 blur-3xl rounded-full" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-radiant-amber/10 flex items-center justify-center border border-radiant-amber/20 relative overflow-hidden">
                                    <Sparkles className="text-radiant-amber animate-pulse" size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-black text-foreground tracking-tighter leading-none">AURA</h4>
                                    <p className="text-[8px] text-radiant-amber font-black uppercase tracking-[0.4em] mt-1">v2.0 Consciousness</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 relative z-10">
                                <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`w-10 h-10 rounded-full flex items-center justify-center border border-current/10 transition-all ${isVoiceEnabled ? 'bg-radiant-amber/20 text-radiant-amber' : 'bg-current/5 text-foreground/40'}`}>
                                    {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="w-10 h-10 glass-ultra rounded-full flex items-center justify-center border border-current/10 hover:text-red-400 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${msg.role === 'user' ? 'bg-current/10 border-current/10' : 'bg-radiant-amber/10 border-radiant-amber/20'}`}>
                                        {msg.role === 'user' ? <User size={14} className="text-foreground/40" /> : <Bot size={14} className="text-radiant-amber" />}
                                    </div>
                                    <div className={`max-w-[85%] p-5 rounded-[28px] text-xs leading-relaxed font-medium ${msg.role === 'user' ? 'bg-radiant-amber text-cosmic-blue rounded-tr-none shadow-glow-sm' : 'bg-current/5 border border-current/5 text-foreground/80 rounded-tl-none'}`}>
                                        <MessageRenderer content={msg.content} />
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-radiant-amber/10 border border-radiant-amber/20 flex items-center justify-center"><Bot size={14} className="text-radiant-amber" /></div>
                                    <div className="flex gap-1.5 p-5 bg-current/5 rounded-[28px] rounded-tl-none">
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-radiant-amber/40 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-radiant-amber/60 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-radiant-amber/40 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-8 bg-current/[0.02] border-t border-current/5">
                            <form onSubmit={handleSend} className="relative">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { 
                                    if (e.target.files?.[0]) { 
                                        setMessages(prev => [...prev, { role: 'user', content: "[Görsel Yüklendi]" }]);
                                        setIsLoading(true);
                                        setEmotion('TASK'); 
                                        setTimeout(() => {
                                            setMessages(prev => [...prev, { role: 'assistant', content: "İnceledim. Bu alanın enerjisine ve derinliğine en uygun parçalardan biri [PRODUCT:cd2bdca4-5e16-4afc-bf77-172ab01bf3ce]. Nasıl, bu tasarımla mekanı tamamlayalım mı?" }]);
                                            setEmotion('CALM');
                                            setIsLoading(false);
                                        }, 2500);
                                    } 
                                }} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-foreground/20 hover:text-radiant-amber transition-colors"><Camera size={18} /></button>
                                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Bir şey sor..." className="w-full bg-current/5 border border-current/10 rounded-2xl py-4 pl-12 pr-14 text-xs text-foreground placeholder:text-foreground/20 focus:border-radiant-amber/40 outline-none transition-all" />
                                <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-radiant-amber text-cosmic-blue rounded-xl flex items-center justify-center hover:shadow-glow disabled:opacity-50 transition-all"><Send size={16} /></button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Orb Toggler */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto relative group">
                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center transition-all duration-1000 ${isOpen ? 'rotate-45 scale-90' : 'rotate-0'}`}>
                    <div className="absolute inset-0 bg-radiant-amber/20 blur-2xl group-hover:bg-radiant-amber/30 rounded-full" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-radiant-amber/20 rounded-[28px] opacity-40 group-hover:opacity-100" />
                    <div className={`w-14 h-14 glass-ultra bg-background flex items-center justify-center rounded-2xl border shadow-2xl relative overflow-hidden transition-all duration-500 ${emotion === 'TASK' ? 'border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.5)]' : emotion === 'EXCITED' ? 'border-radiant-amber shadow-[0_0_20px_rgba(255,191,0,0.5)] scale-110' : 'border-current/20'} group-hover:border-radiant-amber/50`}>
                        <div className={`absolute inset-0 bg-gradient-to-tr opacity-50 transition-all ${emotion === 'TASK' ? 'from-blue-500/20' : emotion === 'EXCITED' ? 'from-radiant-amber/40' : 'from-radiant-amber/20'}`} />
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}><X className="text-foreground" size={24} /></motion.div>
                            ) : (
                                <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} className="flex flex-col items-center">
                                    {emotion === 'TASK' ? <Loader2 className="text-blue-400 animate-spin" size={24} /> : <Sparkles className={emotion === 'EXCITED' ? 'text-foreground' : 'text-radiant-amber'} size={24} />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {!isOpen && [0, 90, 180, 270].map((deg) => (
                        <motion.div key={deg} animate={{ rotate: [deg, deg + 360], scale: emotion === 'EXCITED' ? [1, 1.8, 1] : [1, 1.2, 1] }} transition={{ duration: emotion === 'TASK' ? 2 : 15, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full p-2">
                            <div className={`w-1.5 h-1.5 rounded-full shadow-glow-sm transition-colors ${emotion === 'TASK' ? 'bg-blue-400' : 'bg-radiant-amber/40'}`} />
                        </motion.div>
                    ))}
                </div>
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute right-24 top-1/2 -translate-y-1/2 glass-ultra bg-background/80 backdrop-blur-xl border border-current/10 px-4 py-2 rounded-full whitespace-nowrap shadow-2xl">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-radiant-amber flex items-center gap-2"><span className="w-1 h-1 bg-radiant-amber rounded-full animate-ping" />Aura v2.0</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
