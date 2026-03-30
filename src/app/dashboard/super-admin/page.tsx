import React from 'react';
import { Crown, Users, Package, ShoppingCart, TrendingUp, DollarSign, Activity, Award, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ApexAnalysis from '@/components/admin/ApexAnalysis';

export default async function SuperAdminOverview() {
    const supabase = createClient();

    const [vendorsRes, productsRes, ordersRes, usersRes, storesRes, pendingProductsRes, pendingUsersRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['vendor', 'VENDOR', 'seller', 'SELLER']),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['user', 'USER', 'customer', 'CUSTOMER']),
        supabase.from('stores').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('verification_status', ['pending', 'PENDING']),
    ]);

    const vendorCount = vendorsRes.count || 0;
    const productCount = productsRes.count || 0;
    const orderCount = ordersRes.count || 0;
    const userCount = usersRes.count || 0;
    const totalRevenue = ordersRes.data?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;
    const unverifiedStoresCount = storesRes.count || 0;
    const pendingProductsCount = pendingProductsRes.count || 0;
    const pendingUsersCount = pendingUsersRes.count || 0;

    const stats = [
        {
            label: 'Platform Cirosu',
            value: `₺${totalRevenue.toLocaleString('tr-TR')}`,
            icon: DollarSign,
            color: '#FFBF00',
            bg: 'rgba(255,191,0,0.08)',
            border: 'rgba(255,191,0,0.2)',
            desc: 'Brüt toplam',
        },
        {
            label: 'Aktif Satıcılar',
            value: vendorCount.toString(),
            icon: Users,
            color: '#60a5fa',
            bg: 'rgba(96,165,250,0.08)',
            border: 'rgba(96,165,250,0.2)',
            desc: 'Platforma kayıtlı',
        },
        {
            label: 'Bekleyen Onaylar',
            value: pendingUsersCount.toString(),
            icon: UserCheck,
            color: '#FFBF00',
            bg: 'rgba(255,191,0,0.08)',
            border: 'rgba(255,191,0,0.2)',
            desc: 'Kullanıcı doğrulamaları',
        },
        {
            label: 'Toplam Ürün',
            value: productCount.toString(),
            icon: Package,
            color: '#a78bfa',
            bg: 'rgba(167,139,250,0.08)',
            border: 'rgba(167,139,250,0.2)',
            desc: 'Tüm kategoriler',
        },
        {
            label: 'Onay Bekleyen Ürün',
            value: pendingProductsCount.toString(),
            icon: Package,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.08)',
            border: 'rgba(52,211,153,0.2)',
            desc: 'İncelenecek ürünler',
        },
    ];

    const quickLinks = [
        { label: 'Onay Bekleyenler', href: '/dashboard/super-admin/user-approvals', icon: UserCheck, color: '#FFBF00' },
        { label: 'Satıcı Yönetimi', href: '/dashboard/super-admin/vendors', icon: Users, color: '#60a5fa' },
        { label: 'Komisyon Düzenle', href: '/dashboard/super-admin/commissions', icon: Award, color: '#FFBF00' },
        { label: 'Siparişleri Görüntüle', href: '/dashboard/super-admin/orders', icon: ShoppingCart, color: '#34d399' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFBF00)', boxShadow: '0 0 20px rgba(255,191,0,0.4)' }}>
                    <Crown size={22} className="text-[#0A192F]" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: '#FFBF00' }}>
                        Super Admin · Kontrol Merkezi
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Platform Genel Bakış</h1>
                    <p className="text-white/50 text-sm mt-1">Platformun tüm metriklerini ve yönetim araçlarını buradan kontrol edebilirsin.</p>
                </div>
            </div>

            {/* Apex AI Analysis */}
            <ApexAnalysis />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02]"
                            style={{ background: stat.bg, borderColor: stat.border }}
                        >
                            <Icon size={22} style={{ color: stat.color }} className="mb-4" />
                            <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
                            <p className="text-[10px] text-white/25 mt-1">{stat.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickLinks.map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={i}
                                href={link.href}
                                className="group flex items-center gap-4 p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.02]"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: `${link.color}15`, border: `1px solid ${link.color}25` }}>
                                    <Icon size={18} style={{ color: link.color }} />
                                </div>
                                <span className="font-semibold text-sm text-white/70 group-hover:text-white transition-colors">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Super Admin note */}
            <div className="rounded-2xl p-5 border flex items-start gap-4"
                style={{ background: 'rgba(255,191,0,0.04)', borderColor: 'rgba(255,191,0,0.15)' }}>
                <Crown size={18} style={{ color: '#FFBF00' }} className="mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-white/80">Süper Admin Yetkisi</p>
                    <p className="text-xs text-white/40 mt-1">
                        Bu hesap platformun tek süper admin hesabıdır. Satıcı onaylama, komisyon oranı belirleme ve tüm platform verilerine erişim
                        yalnızca bu hesaba aittir.
                    </p>
                </div>
            </div>
        </div>
    );
}
