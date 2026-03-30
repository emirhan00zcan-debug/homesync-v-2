"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


import VendorSidebar from '@/components/Sidebars/VendorSidebar';
import CustomerSidebar from '@/components/Sidebars/CustomerSidebar';
import AdminSidebar from '@/components/Sidebars/AdminSidebar';
import SuperAdminSidebar from '@/components/Sidebars/SuperAdminSidebar';
import CraftsmanLayout from '@/components/layouts/CraftsmanLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth?mode=LOGIN');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cosmic-blue flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-radiant-amber border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    // ── Technician gets its own layout (bottom nav + top bar) ──────────────────
    if (user.role === 'TECHNICIAN') {
        return (
            <CraftsmanLayout>{children}</CraftsmanLayout>
        );
    }

    // SUPER_ADMIN is handled by the standard sidebar layout below (with SuperAdminSidebar)

    // ── Vendor / Admin / SuperAdmin / Customer: left sidebar layout ───────────
    const renderSidebar = () => {
        switch (user.role) {
            case 'VENDOR': return <VendorSidebar />;
            case 'ADMIN': return <AdminSidebar />;
            case 'SUPER_ADMIN': return <SuperAdminSidebar />;
            default: return <CustomerSidebar />;
        }
    };

    return (
        <div className="min-h-screen bg-cosmic-blue flex overflow-hidden">
            <React.Suspense fallback={<div className="w-20 lg:w-72 bg-cosmic-blue border-r border-white/10" />}>
                {renderSidebar()}
            </React.Suspense>
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radiant-amber/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="relative z-10">{children}</div>
            </main>
        </div>
    );
}
