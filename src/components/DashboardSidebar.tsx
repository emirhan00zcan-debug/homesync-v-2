"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Heart,
    ShoppingBag,
    CreditCard,
    Package,
    Users,
    Settings,
    LogOut,
    Hammer,
    Zap,
    MapPin,
    BarChart3,
    Briefcase,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const getLinks = () => {
        switch (user?.role) {
            case 'ADMIN':
                return [
                    { icon: LayoutDashboard, label: "Yönetici Paneli", href: "/dashboard/admin" },
                    { icon: Package, label: "Ürün Yönetimi", href: "/dashboard/admin/products" },
                    { icon: ShoppingBag, label: "Tüm Siparişler", href: "/dashboard/admin/orders" },
                    { icon: Users, label: "Üretici Listesi", href: "/dashboard/admin/vendors" },
                    { icon: Settings, label: "Site Ayarları", href: "/dashboard/admin/settings" },
                ];
            case 'VENDOR':
                return [
                    { icon: LayoutDashboard, label: "Genel Bakış", href: "/dashboard/vendor" },
                    { icon: Package, label: "Envanterim", href: "/dashboard/vendor/inventory" },
                    { icon: ShoppingBag, label: "Siparişlerim", href: "/dashboard/vendor/orders" },
                    { icon: BarChart3, label: "Satış Verileri", href: "/dashboard/vendor/sales" },
                    { icon: Settings, label: "Profil Ayarları", href: "/dashboard/vendor/settings" },
                ];
            case 'TECHNICIAN':
                return [
                    { icon: LayoutDashboard, label: "İş Panosu", href: "/dashboard/technician" },
                    { icon: Briefcase, label: "Görevlerim", href: "/dashboard/technician/jobs" },
                    { icon: MapPin, label: "Hizmet Bölgesi", href: "/dashboard/technician/area" },
                    { icon: Settings, label: "Müsaitlik Durumu", href: "/dashboard/technician/settings" },
                ];
            default: // CUSTOMER
                return [
                    { icon: LayoutDashboard, label: "Genel Bakış", href: "/dashboard/customer" },
                    { icon: ShoppingBag, label: "Siparişlerim", href: "/dashboard/customer/orders" },
                    { icon: MapPin, label: "Adres Bilgilerim", href: "/dashboard/customer/addresses" },
                    { icon: MessageSquare, label: "Değerlendirmelerim", href: "/dashboard/customer/reviews" },
                    { icon: Heart, label: "Favorilerim", href: "/dashboard/customer/favorites" },
                    { icon: Settings, label: "Ayarlar", href: "/dashboard/customer/settings" },
                ];
        }
    };

    const links = getLinks() || [];
    const roleLabel = user?.role === 'ADMIN' ? 'Sistem Yöneticisi' : user?.role === 'VENDOR' ? 'Üretici' : user?.role === 'TECHNICIAN' ? 'Kurulum Uzmanı' : 'Üye';

    if (user?.role === 'SUPER_ADMIN') {
        return null;
    }

    return (
        <aside className="w-20 lg:w-72 border-r border-white/10 flex flex-col p-6 sticky top-0 h-screen bg-cosmic-blue z-50">
            <Link href={user?.role === 'ADMIN' ? '/dashboard/admin' : '/'} className="mb-12 flex items-center gap-4 group">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-radiant-amber/50 transition-all duration-500 group-hover:shadow-glow">
                    <Zap className="text-radiant-amber" size={24} />
                </div>
                <div className="hidden lg:block">
                    <h2 className="font-black text-white tracking-widest text-sm uppercase">HomeSync</h2>
                    <p className="text-[10px] text-radiant-amber font-bold uppercase tracking-widest">{roleLabel} Merkezi</p>
                </div>
            </Link>

            <nav className="flex-1 space-y-3">
                {links.map((link) => {
                    const isActive = pathname === link.href;
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
                    onClick={logout}
                    className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-500 group"
                >
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                </button>

                <div className="hidden lg:flex items-center gap-3 p-4 glass rounded-3xl border border-white/5 bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-radiant-amber to-amber-600 flex items-center justify-center font-black text-cosmic-blue text-xs shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-white truncate">{user?.name}</p>
                        <p className="text-[9px] text-white/40 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
