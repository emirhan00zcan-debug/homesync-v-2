"use client";

import React from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingBag,
    Settings,
    LogOut,
    Zap,
    Home
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const links = [
        { icon: Home, label: "Ana Sayfa", href: "/" },
        { icon: LayoutDashboard, label: "Yönetim Paneli", href: "/dashboard/admin" },
        { icon: Package, label: "Ürün Yönetimi", href: "/dashboard/admin/products" },
        { icon: ShoppingBag, label: "Tüm Siparişler", href: "/dashboard/admin/orders" },
        { icon: Users, label: "Üretici & Uzman Listesi", href: "/dashboard/admin/vendors" },
        { icon: Settings, label: "Site Ayarları", href: "/dashboard/admin/settings" },
    ];

    return (
        <aside className="w-20 lg:w-72 border-r border-white/10 flex flex-col p-6 sticky top-0 h-screen bg-cosmic-blue z-50 shadow-2xl">
            <Link href="/dashboard/admin" className="mb-12 flex items-center gap-4 group">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-radiant-amber/50 transition-all duration-500 group-hover:shadow-glow">
                    <Zap className="text-radiant-amber" size={24} />
                </div>
                <div className="hidden lg:block">
                    <h2 className="font-black text-white tracking-widest text-sm uppercase">HomeSync</h2>
                    <p className="text-[10px] text-radiant-amber font-bold uppercase tracking-widest">Sistem Yöneticisi</p>
                </div>
            </Link>

            <nav className="flex-1 space-y-3">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`group flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl transition-all duration-500 ${isActive
                                ? 'bg-radiant-amber text-cosmic-blue font-bold shadow-glow scale-[1.02]'
                                : 'text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <link.icon size={22} className={isActive ? 'text-cosmic-blue' : 'group-hover:text-radiant-amber transition-colors'} />
                            <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-8 space-y-3">
                <button
                    onClick={async () => await logout()}
                    className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl text-red-500/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-500 group"
                >
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">Güvenli Çıkış</span>
                </button>

                <div className="hidden lg:flex items-center gap-3 p-4 glass rounded-3xl border border-white/5 bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-xs shadow-lg">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-white truncate">{user?.name}</p>
                        <p className="text-[9px] text-white/40 truncate text-fuchsia-400">Yönetici Hesabı</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
