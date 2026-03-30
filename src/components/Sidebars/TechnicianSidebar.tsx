"use client";

import React from 'react';
import {
    LayoutDashboard,
    Briefcase,
    MapPin,
    Settings,
    LogOut,
    Zap,
    CalendarCheck,
    Wallet,
    Star,
    HardHat,
    Home
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function TechnicianSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const links = [
        { icon: Home, label: "Ana Sayfa", href: "/" },
        { icon: LayoutDashboard, label: "Genel Bakış", href: "/dashboard/technician" },
        { icon: Briefcase, label: "Montaj Görevlerim", href: "/dashboard/technician/jobs" },
        { icon: MapPin, label: "Hizmet Bölgelerim", href: "/dashboard/technician/area" },
        { icon: Star, label: "Değerlendirmelerim", href: "/dashboard/technician/reviews" },
        { icon: CalendarCheck, label: "Takvim & Müsaitlik", href: "/dashboard/technician/calendar" },
        { icon: Wallet, label: "Hakediş & Kazanç", href: "/dashboard/technician/finance" },
        { icon: Settings, label: "Ayarlar", href: "/dashboard/technician/settings" },
    ];

    return (
        <aside className="w-20 lg:w-72 border-r border-white/10 flex flex-col p-4 lg:p-6 sticky top-0 h-screen bg-cosmic-blue z-50 shadow-2xl shrink-0">
            {/* Brand */}
            <Link href="/dashboard/technician" className="mb-10 flex items-center gap-4 group">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-radiant-amber/50 transition-all duration-500 group-hover:shadow-glow shrink-0">
                    <Zap className="text-radiant-amber" size={24} />
                </div>
                <div className="hidden lg:block">
                    <h2 className="font-black text-white tracking-widest text-sm uppercase">HomeSync</h2>
                    <p className="text-[10px] text-radiant-amber font-bold uppercase tracking-widest">PRO Platform</p>
                </div>
            </Link>

            {/* Section label */}
            <p className="hidden lg:block text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3 px-4">
                Montajcı Platformu
            </p>

            <nav className="flex-1 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard/technician' && pathname.startsWith(`${link.href}`));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`group flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-radiant-amber text-cosmic-blue font-bold shadow-glow scale-[1.02]'
                                : 'text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <link.icon size={20} className={isActive ? 'text-cosmic-blue shrink-0' : 'group-hover:text-radiant-amber transition-colors shrink-0'} />
                            <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest truncate">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-white/10 pt-4 space-y-3">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3.5 rounded-2xl text-red-500/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                    <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                </button>

                <div className="hidden lg:flex items-center gap-3 p-4 glass rounded-3xl border border-white/5 bg-white/[0.02]">
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
    );
}
