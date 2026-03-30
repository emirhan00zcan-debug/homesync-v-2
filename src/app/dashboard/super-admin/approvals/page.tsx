import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import PendingProductsClient from '@/components/PendingProductsClient';

export default async function SuperAdminApprovalsPage() {
    const supabase = createClient();

    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            price, 
            status,
            profiles:vendor_id (company_name, full_name)
        `)
        // .eq('status', 'pending') // Optional: uncomment if you only want to fetch pending, currently client does filtering by itself if wanted, or allows viewing all
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching products:', error);

    // Transforming the nested profiles to match the component type correctly
    const formattedProducts = (products || []).map(p => ({
        ...p,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
    }));

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <PendingProductsClient products={formattedProducts as any} />
        </Suspense>
    );
}
