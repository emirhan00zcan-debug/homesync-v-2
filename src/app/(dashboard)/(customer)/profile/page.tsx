"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useThemeEffect } from '@/context/ThemeContext';
import {
    User,
    Package,
    Settings,
    Shield,
    Clock,
    ChevronRight,
    MapPin,
    CreditCard,
    Bell,
    Wrench,
    Sparkles,
    Brain
} from 'lucide-react';
import Link from 'next/link';

const ProfilePage = () => {
    const { user } = useAuth();
    const { isLightOn } = useThemeEffect();

    if (!user) return null;

    const sections = [
        {
            title: "Hesap Bilgileri",
            icon: <User className="text-radiant-amber" size={20} />,
            items: [
                { label: "Ad Soyad", value: user.name },
                { label: "E-Posta", value: user.email },
                { label: "Telefon", value: "+90 (5XX) XXX XX XX" }
            ]
        },
        {
            title: "Aktif Siparişler",
            icon: <Clock className="text-radiant-amber" size={20} />,
            items: [
                { label: "HS-9821 Chandelier", status: "Yolda", date: "22 Şub 2026" },
                { label: "HS-4420 Smart Lock", status: "Hazırlanıyor", date: "21 Şub 2026" }
            ]
        }
    ];

    return (
        <main className={`min-h-screen pt-32 pb-20 px-6 transition-all duration-1000 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'
            }`}>
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="text-radiant-amber text-xs font-black tracking-[0.4em] uppercase mb-2 block">
                            Kullanıcı Paneli
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            Merhaba, <span className="text-radiant-amber">{(user.name || 'Kullanıcı').split(' ')[0]}</span>
                        </h1>
                    </motion.div>

                    <div className="flex gap-3">
                        <button className="glass px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-radiant-amber transition-all">
                            Ayarları Düzenle
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className={`glass p-8 rounded-[40px] border transition-all duration-700 ${isLightOn ? 'bg-black/[0.03] border-black/5' : 'bg-white/5 border-white/10'
                            }`}>
                            <div className="w-24 h-24 rounded-[30px] bg-radiant-amber flex items-center justify-center mb-6 shadow-glow">
                                <span className="text-3xl font-black text-cosmic-blue">
                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-xl font-black mb-1">{user.name}</h3>
                            <p className="opacity-40 text-xs uppercase tracking-widest mb-6">{user.role} Üyeliği</p>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3 opacity-60">
                                    <MapPin size={16} className="text-radiant-amber" />
                                    <span className="text-xs">İstanbul, Türkiye</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-60">
                                    <CreditCard size={16} className="text-radiant-amber" />
                                    <span className="text-xs">**** 4421</span>
                                </div>
                            </div>
                        </div>

                        <div className={`glass p-8 rounded-[40px] border transition-all duration-700 ${isLightOn ? 'bg-black/[0.03] border-black/5' : 'bg-white/5 border-white/10'
                            }`}>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Hızlı Erişim</h4>
                            <div className="space-y-2">
                                {[
                                    { label: "Adreslerim", icon: <MapPin size={14} /> },
                                    { label: "Ödeme Yöntemleri", icon: <CreditCard size={14} /> },
                                    { label: "Bildirimler", icon: <Bell size={14} /> },
                                    { label: "Güvenlik", icon: <Shield size={14} /> }
                                ].map((item) => (
                                    <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-radiant-amber">{item.icon}</span>
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Main Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className={`glass p-8 md:p-12 rounded-[50px] border transition-all duration-700 ${isLightOn ? 'bg-black/[0.03] border-black/5' : 'bg-white/5 border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-10 h-10 rounded-xl bg-radiant-amber/10 flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                                </div>

                                <div className="space-y-6">
                                    {section.items.map((item: { label: string; value?: string; date?: string; status?: string }, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/5 last:border-0 gap-2">
                                            <div>
                                                <p className="opacity-40 text-[10px] uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-sm font-bold">{item.value || item.date}</p>
                                            </div>
                                            {item.status && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-radiant-amber shadow-glow-sm" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-radiant-amber">{item.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Preferred Installers */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`glass p-8 md:p-12 rounded-[50px] border transition-all duration-700 ${isLightOn ? 'bg-black/[0.03] border-black/5' : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-radiant-amber/10 flex items-center justify-center">
                                    <Wrench className="text-radiant-amber" size={20} />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">Kayıtlı Ustalar</h2>
                            </div>

                            <p className="opacity-40 text-sm italic mb-0">Henüz favori bir usta eklemediniz. Siparişinizden sonra ustaları puanlayarak buraya ekleyebilirsiniz.</p>
                        </motion.div>

                        {/* AI Suggestions Section */}
                        <AISuggestions isLightOn={isLightOn} />
                    </div>
                </div>
            </div>
        </main>
    );
};

const AISuggestions = ({ isLightOn }: { isLightOn: boolean }) => {
    const [report, setReport] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch('/api/ai/report');
                const data = await res.json();
                setReport(data.report);
            } catch (err) {
                console.error('Failed to fetch AI report:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`glass p-8 md:p-12 rounded-[50px] border border-radiant-amber/20 bg-radiant-amber/[0.02] transition-all duration-700 overflow-hidden relative group`}
        >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000 -rotate-12 pointer-events-none">
                <Brain size={200} className="text-radiant-amber" />
            </div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-radiant-amber/20 flex items-center justify-center shadow-glow-sm">
                    <Sparkles className="text-radiant-amber" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Size Özel AI Önerileri</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-radiant-amber">HomeSync Intelligence</p>
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-radiant-amber/20 border-t-radiant-amber rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Analiz Ediliyor...</p>
                </div>
            ) : report ? (
                <div className="relative z-10">
                    <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 text-sm leading-relaxed opacity-80 mb-8"
                        dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }} />
                    <button className="px-8 py-4 bg-radiant-amber text-cosmic-blue rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow transition-all">
                        Önerileri İncele
                    </button>
                </div>
            ) : (
                <p className="opacity-40 text-sm italic mb-0 relative z-10">Henüz yeterli aktivite veriniz bulunmuyor. Keşfetmeye devam ettikçe size özel teklifler sunacağız.</p>
            )}
        </motion.div>
    );
};

export default ProfilePage;
