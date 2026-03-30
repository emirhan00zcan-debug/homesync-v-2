"use client";

import React, { useState } from 'react';
import {
    Menu,
    X,
    Zap,
    LogOut,
    LayoutDashboard,
    Package,
    Briefcase,
    MapPin,
    Settings,
    CalendarCheck,
    Wallet,
    Star,
    HardHat,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface NavLink {
    icon: React.ElementType;
    label: string;
    href: string;
}

const links: NavLink[] = [
    { icon: LayoutDashboard, label: 'Genel Bakış', href: '/dashboard/technician' },
    { icon: Briefcase, label: 'Montaj Görevlerim', href: '/dashboard/technician/jobs' },
    { icon: Package, label: 'Ürünlerim', href: '/dashboard/technician/products' },
    { icon: MapPin, label: 'Hizmet Bölgelerim', href: '/dashboard/technician/area' },
    { icon: Star, label: 'Değerlendirmelerim', href: '/dashboard/technician/reviews' },
    { icon: CalendarCheck, label: 'Takvim & Müsaitlik', href: '/dashboard/technician/calendar' },
    { icon: Wallet, label: 'Hakediş & Kazanç', href: '/dashboard/technician/finance' },
    { icon: Settings, label: 'Ayarlar', href: '/dashboard/technician/settings' },
];

export default function CraftsmanLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) =>
        pathname === href || (href !== '/dashboard/technician' && pathname.startsWith(href));

    return (
        <div className="min-h-screen bg-cosmic-blue flex overflow-hidden">

            {/* ─── Left Sidebar (Desktop) ─── */}
            <aside className="hidden lg:flex w-72 border-r border-white/10 flex-col p-6 sticky top-0 h-screen bg-cosmic-blue z-50 shadow-2xl shrink-0 overflow-x-hidden">
                {/* Brand */}
                <Link href="/dashboard/technician" className="mb-3 flex items-center gap-4 group">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-radiant-amber/50 transition-all duration-500 group-hover:shadow-glow shrink-0">
                        <Zap className="text-radiant-amber" size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-white tracking-widest text-sm uppercase">HomeSync</h2>
                        <p className="text-[10px] text-radiant-amber font-bold uppercase tracking-widest">PRO Platform</p>
                    </div>
                </Link>

                {/* Section label */}
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 px-4">
                    Montajcı Platformu
                </p>

                {/* Nav */}
                <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
                    {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active
                                    ? 'bg-radiant-amber text-cosmic-blue font-bold shadow-glow'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <link.icon
                                    size={20}
                                    className={active
                                        ? 'text-cosmic-blue shrink-0'
                                        : 'group-hover:text-radiant-amber transition-colors shrink-0'
                                    }
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest truncate">
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto border-t border-white/10 pt-4 space-y-3">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                    </button>

                    <div className="flex items-center gap-3 p-4 glass rounded-3xl border border-white/5 bg-white/[0.02]">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-cosmic-blue text-xs shadow-lg">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-cosmic-blue flex items-center justify-center">
                                <HardHat size={8} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black text-white truncate">{user?.name}</p>
                            <p className="text-[9px] text-amber-400 uppercase tracking-widest">Sertifikalı Usta</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Top Bar ─── */}
            <div className="lg:hidden flex flex-col flex-1">
                <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-cosmic-blue/80 backdrop-blur-md sticky top-0 z-50">
                    <Link href="/dashboard/technician" className="flex items-center gap-2">
                        <div className="w-8 h-8 glass rounded-xl flex items-center justify-center border border-white/20">
                            <Zap size={16} className="text-radiant-amber" />
                        </div>
                        <div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">HomeSync</span>
                            <span className="block text-[8px] text-radiant-amber font-bold uppercase tracking-widest">PRO</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-cosmic-blue text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-8 h-8 glass rounded-xl flex items-center justify-center border border-white/10 text-white"
                        >
                            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="border-b border-white/10 bg-cosmic-blue z-40" style={{ animation: 'slideDown 0.2s ease-out' }}>
                        {links.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-5 py-4 border-b border-white/5 text-sm font-bold ${active ? 'text-radiant-amber bg-radiant-amber/5' : 'text-white/60'}`}
                                >
                                    <link.icon size={17} />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-5 py-4 text-red-400 text-sm font-bold"
                        >
                            <LogOut size={17} />
                            Çıkış Yap
                        </button>
                    </div>
                )}

                {/* Mobile Content */}
                <main className="flex-1 overflow-y-auto pb-6 relative custom-scrollbar">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radiant-amber/5 blur-[120px] pointer-events-none rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />
                    <div className="relative z-10">{children}</div>
                </main>
            </div>

            {/* ─── Desktop Main Content ─── */}
            <main className="hidden lg:block flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radiant-amber/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="relative z-10">{children}</div>
            </main>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
