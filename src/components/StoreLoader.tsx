"use client";

import { useEffect } from 'react';
import { useAuthStore, useVendorStore } from '@/store';

export default function StoreLoader() {
    const user = useAuthStore(s => s.user);
    const isLoading = useAuthStore(s => s.isLoading);
    const refreshStore = useVendorStore(s => s.refreshStore);

    useEffect(() => {
        if (!isLoading) {
            refreshStore();
        }
    }, [user, isLoading, refreshStore]);

    return null;
}
