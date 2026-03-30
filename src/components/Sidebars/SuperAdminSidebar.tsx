"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Crown, LayoutDashboard, Users, Package, ShoppingCart,
    Percent, UserCircle, LogOut, ChevronRight, CheckSquare, Store, UserCheck, Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuperAdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Ana Sayfa', href: '/', icon: Home },
        { name: 'Genel Bakış', href: '/dashboard/super-admin', icon: LayoutDashboard },
        { name: 'Satıcı Yönetimi', href: '/dashboard/super-admin/vendors', icon: Users },
        { name: 'Mağazalar', href: '/dashboard/super-admin/stores', icon: Store },
        { name: 'Komisyonlar', href: '/dashboard/super-admin/commissions', icon: Percent },
        { name: 'Tüm Siparişler', href: '/dashboard/super-admin/orders', icon: ShoppingCart },
        { name: 'Kullanıcılar', href: '/dashboard/super-admin/users', icon: UserCircle },
        { name: 'Onay Bekleyenler', href: '/dashboard/super-admin/user-approvals', icon: UserCheck },
        { name: 'Ürün Onayları', href: '/dashboard/super-admin/approvals', icon: CheckSquare },
        { name: 'Tüm Ürünler', href: '/dashboard/super-admin/products', icon: Package },
    ];

    return (
        <aside className="w-72 border-r border-white/10 flex flex-col relative z-20 shrink-0"
            style={{ background: 'linear-gradient(180deg, #0c1e35 0%, #0A192F 100%)' }}>

            {/* Brand Header */}
            <div className="p-6 border-b border-white/10">
                <Link href="/dashboard/super-admin" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center font-black text-[#0A192F] shadow-[0_0_20px_rgba(255,191,0,0.6)]"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFBF00)' }}>
                        <Crown size={18} />
                    </div>
                    <div>
                        <h2 className="font-black tracking-widest uppercase text-sm text-white">HomeSync</h2>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-bold"
                            style={{ color: '#FFBF00' }}>Süper Admin</p>
                    </div>
                </Link>
            </div>

            {/* User Badge */}
            <div className="mx-4 mt-4 p-3 rounded-xl border border-yellow-500/20"
                style={{ background: 'rgba(255,191,0,0.05)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[#0A192F]"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFBF00)' }}>
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user?.name || 'Super Admin'}</p>
                        <p className="text-[10px] text-yellow-400/70 uppercase tracking-widest">Platform Sahibi</p>
                    </div>
                    <Crown size={12} className="text-yellow-400 shrink-0" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard/super-admin' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'text-[#0A192F] shadow-[0_0_20px_rgba(255,191,0,0.3)]'
                                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            style={isActive ? {
                                background: 'linear-gradient(135deg, #FFD700, #FFBF00)',
                            } : undefined}
                        >
                            <Icon size={17} className={`shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            <span className="font-semibold text-sm">{item.name}</span>
                            {isActive && <ChevronRight size={14} className="ml-auto shrink-0" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Admin Panel Link */}
            <div className="px-4 pb-2">
                <div className="border-t border-white/10 pt-3 space-y-1">
                    <Link
                        href="/dashboard/admin"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                        <LayoutDashboard size={14} />
                        Admin Paneli
                    </Link>
                </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut size={17} />
                    <span className="font-medium text-sm">Çıkış Yap</span>
                </button>
            </div>

            {/* Ambient Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(255,191,0,0.03), transparent)' }} />
        </aside>
    );
}
