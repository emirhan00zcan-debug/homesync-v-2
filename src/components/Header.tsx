"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useThemeEffect } from '@/context/ThemeContext';
import { useCartCount } from '@/store';
import { ShoppingCart, User, Sparkles, LogOut, LayoutDashboard, Search, ChevronDown, Settings, Menu, X, Sun, Moon, LayoutGrid, Lightbulb, Zap, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

const NAV_ITEMS = [
    { label: 'Katalog', href: '/katalog' },
    { label: 'Mağazalar', href: '/magazalar' },
    { label: 'Usta Hizmetleri', href: '/usta-hizmetleri' },
    { label: 'Hakkımızda', href: '/hakkimizda' }
];

const MEGA_MENU_CATEGORIES = [
    { name: 'Tümü', id: 'all', icon: <LayoutGrid className="w-8 h-8 md:w-10 md:h-10 mb-3 text-radiant-amber" />, href: '/katalog', desc: 'Tüm Koleksiyon' },
    { name: 'Avizeler', id: 'chandeliers', icon: <Lightbulb className="w-8 h-8 md:w-10 md:h-10 mb-3 text-radiant-amber" />, href: '/katalog?category=chandeliers', desc: 'Premium Aydınlatma' },
    { name: 'Akıllı Ev', id: 'smart', icon: <Zap className="w-8 h-8 md:w-10 md:h-10 mb-3 text-radiant-amber" />, href: '/katalog?category=smart', desc: 'Geleceğin Teknolojisi' },
    { name: 'Ustalar', id: 'pros', icon: <Users className="w-8 h-8 md:w-10 md:h-10 mb-3 text-radiant-amber" />, href: '/katalog?category=pros', desc: 'Sertifikalı Zanaatkarlar' },
    { name: 'Hizmetler', id: 'services', icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 mb-3 text-radiant-amber" />, href: '/katalog?category=services', desc: 'Montaj & Kurulum' },
];

const Header = () => {
    const { user, logout } = useAuth();
    const cartCount = useCartCount();
    const pathname = usePathname();
    const { theme, toggleTheme } = useThemeEffect();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [dropdownHideTimeout, setDropdownHideTimeout] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Scroll listener for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dışarıya tıklayınca dropdown kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sayfa değişince dropdown ve mobile menüyü kapat
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (dropdownOpen) setDropdownOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (megaMenuOpen) setMegaMenuOpen(false);
    }

    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <header data-theme="dark" className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1400px] z-[100]">
            <div className={`transition-all duration-500 ease-in-out flex justify-between items-center px-6 lg:px-8 py-3 rounded-[2rem] ${
                pathname === '/'
                    ? (scrolled ? 'glass-pill border border-white/10' : 'bg-transparent')
                    : 'header-dark-pill'
            }`}>
                {/* Logo Section */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="group">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className="w-10 h-10 glass-pill rounded-xl flex items-center justify-center border border-current/10 group-hover:border-radiant-amber transition-all shadow-xl"
                            >
                                <Sparkles className="text-radiant-amber" size={20} />
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black tracking-tighter uppercase leading-tight text-foreground">
                                    HomeSync
                                </span>
                                <span className="text-[8px] font-black tracking-[0.4em] text-radiant-amber uppercase mt-1">
                                    Anti-Gravity
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center gap-10 relative">
                        {NAV_ITEMS.map((item) => {
                            if (item.label === 'Katalog') {
                                return (
                                    <div
                                        key={item.label}
                                        className="group"
                                        onMouseEnter={() => setMegaMenuOpen(true)}
                                        onMouseLeave={() => setMegaMenuOpen(false)}
                                    >
                                        <Link
                                            href={item.href}
                                            className="relative text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 text-foreground/50 hover:text-foreground py-4"
                                        >
                                            <span>{item.label}</span>
                                            <span className="absolute bottom-2 left-0 w-0 h-[2px] bg-radiant-amber transition-all group-hover:w-full" />
                                        </Link>

                                        {/* Mega Menu Dropdown */}
                                        <AnimatePresence>
                                            {megaMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[800px] z-50 cursor-default"
                                                >
                                                    <div className="rounded-[2rem] border p-6 backdrop-blur-2xl bg-background/95 border-current/10 shadow-2xl overflow-hidden relative">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-radiant-amber to-transparent opacity-50" />
                                                        
                                                        <div className="flex justify-between items-center mb-6 px-2">
                                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Koleksiyonu Keşfet</h3>
                                                            <Link href="/katalog" className="text-[10px] font-black uppercase tracking-[0.2em] text-radiant-amber hover:underline">Tümünü Gör</Link>
                                                        </div>

                                                        <div className="grid grid-cols-5 gap-4">
                                                            {MEGA_MENU_CATEGORIES.map((cat) => (
                                                                <Link 
                                                                    key={cat.id} 
                                                                    href={cat.href}
                                                                    onClick={() => setMegaMenuOpen(false)}
                                                                    className="group/item flex flex-col items-center text-center p-4 rounded-2xl hover:bg-current/5 transition-all duration-300 border border-transparent hover:border-current/10"
                                                                >
                                                                    <div className="group-hover/item:scale-110 transition-transform duration-300 group-hover/item:text-radiant-amber">
                                                                        {cat.icon}
                                                                    </div>
                                                                    <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover/item:text-radiant-amber transition-colors mb-1">{cat.name}</span>
                                                                    <span className="text-[9px] text-foreground/40 hidden md:block">{cat.desc}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="group relative text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 text-foreground/50 hover:text-foreground py-4"
                                >
                                    <span>{item.label}</span>
                                    {item.label === 'Mağazalar' && (
                                        <span className="bg-radiant-amber text-[7px] px-1.5 py-0.5 rounded text-background font-black animate-pulse">
                                            YENİ
                                        </span>
                                    )}
                                    <span className="absolute bottom-2 left-0 w-0 h-[2px] bg-radiant-amber transition-all group-hover:w-full" />
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        {/* Search Action */}
                        <SearchBar />

                        {/* Cart Action */}
                        <Link
                            href="/cart"
                            className="w-11 h-11 glass-pill rounded-full flex items-center justify-center border border-current/10 hover:border-radiant-amber transition-all relative text-foreground hover:bg-current/5"
                        >
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-radiant-amber text-background text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-background/20">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth / Profile Dropdown */}
                        {user ? (
                            <div
                                className="relative"
                                ref={dropdownRef}
                                onMouseEnter={() => {
                                    if (dropdownHideTimeout) {
                                        window.clearTimeout(dropdownHideTimeout);
                                        setDropdownHideTimeout(null);
                                    }
                                    setDropdownOpen(true);
                                }}
                                onMouseLeave={() => {
                                    const timeoutId = window.setTimeout(() => setDropdownOpen(false), 150);
                                    setDropdownHideTimeout(timeoutId);
                                }}
                            >
                                {/* İsim Barı - hover ile açılır */}
                                <button
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className="glass-pill px-5 h-11 rounded-full border border-current/10 flex items-center gap-2 transition-all cursor-pointer text-foreground hover:border-radiant-amber hover:text-radiant-amber hover:bg-current/10 hover:shadow-lg ring-1 ring-transparent hover:ring-radiant-amber"
                                >
                                    <User size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                                        {user.name}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={14} />
                                    </motion.div>
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute top-full right-0 mt-4 w-64 z-50"
                                        >
                                            <div className="rounded-2xl border p-2 backdrop-blur-xl shadow-2xl glass-ultra bg-background/90 border-current/10">

                                                {/* Kullanıcı adı göster */}
                                                <div className="px-4 py-3 mb-1 text-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                                                    {user.email}
                                                </div>
                                                <div className="h-[1px] w-full mb-1 bg-current/10" />

                                                {(() => {
                                                    const r = (user.role || '').toLowerCase();
                                                    let dashboardHref = '/dashboard/customer';
                                                    let dashboardLabel = 'Profilim / Siparişlerim';
                                                    let dashboardIcon = <User size={14} />;
                                                    let settingsHref = '/dashboard/customer/settings';

                                                    if (r === 'super_admin') {
                                                        dashboardHref = '/dashboard/super-admin';
                                                        dashboardLabel = 'Süper Admin Paneli';
                                                        dashboardIcon = <LayoutDashboard size={14} />;
                                                        settingsHref = '/dashboard/super-admin';
                                                    } else if (r === 'admin') {
                                                        dashboardHref = '/dashboard/admin';
                                                        dashboardLabel = 'Admin Paneli';
                                                        dashboardIcon = <LayoutDashboard size={14} />;
                                                        settingsHref = '/dashboard/admin';
                                                    } else if (r === 'vendor' || r === 'satici') {
                                                        dashboardHref = '/dashboard/vendor';
                                                        dashboardLabel = 'Satıcı Paneli';
                                                        dashboardIcon = <LayoutDashboard size={14} />;
                                                        settingsHref = '/dashboard/vendor/settings';
                                                    } else if (r === 'technician' || r === 'usta') {
                                                        dashboardHref = '/dashboard/technician';
                                                        dashboardLabel = 'Usta Paneli';
                                                        dashboardIcon = <LayoutDashboard size={14} />;
                                                        settingsHref = '/dashboard/technician/settings';
                                                    }

                                                    return (
                                                        <>
                                                            <Link
                                                                href={dashboardHref}
                                                                onClick={() => setDropdownOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:bg-current/5 text-foreground"
                                                            >
                                                                {dashboardIcon}
                                                                {dashboardLabel}
                                                            </Link>
                                                            <Link
                                                                href={settingsHref}
                                                                onClick={() => setDropdownOpen(false)}
                                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all hover:bg-current/5 text-foreground/70"
                                                            >
                                                                <Settings size={14} />
                                                                Profil Ayarları
                                                            </Link>
                                                        </>
                                                    );
                                                })()}

                                                <div className="h-[1px] w-full my-1 bg-current/10" />

                                                <button
                                                    onClick={async () => { setDropdownOpen(false); await logout(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-red-500 hover:bg-red-500/10"
                                                >
                                                    <LogOut size={14} />
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="glass-pill px-6 h-10 rounded-full border border-current/10 flex items-center gap-2 hover:border-radiant-amber transition-all font-black text-[9px] uppercase tracking-[0.2em] text-foreground hover:bg-current/5"
                            >
                                <User size={16} className="text-radiant-amber" />
                                <span>Giriş Yap / Kayıt Ol</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="xl:hidden w-11 h-11 glass-pill rounded-full flex items-center justify-center border border-current/10 text-foreground"
                    >
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[90] xl:hidden flex flex-col pt-32 px-10 pointer-events-auto bg-background"
                    >
                        <nav className="flex flex-col gap-8">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-3xl font-black uppercase tracking-tighter text-foreground"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto pb-20 space-y-8" />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
