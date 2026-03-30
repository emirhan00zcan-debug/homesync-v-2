"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRoot() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push('/auth');
            return;
        }

        switch (user.role) {
            case 'SUPER_ADMIN':
                router.push('/dashboard/super-admin');
                break;
            case 'ADMIN':
                router.push('/dashboard/admin');
                break;
            case 'VENDOR':
                router.push('/dashboard/vendor');
                break;
            case 'TECHNICIAN':
                router.push('/dashboard/technician');
                break;
            case 'CUSTOMER':
                router.push('/dashboard/customer');
                break;
            default:
                router.push('/');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-cosmic-blue flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-radiant-amber border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
