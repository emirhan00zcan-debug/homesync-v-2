import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import StorePublicClient from '@/components/StorePublicClient';
import Header from '@/components/Header';

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = createClient();
    const { slug } = await params;

    // Fetch store with owner profile
    const { data: store, error } = await supabase
        .from('stores')
        .select(`
            id,
            name,
            slug,
            description,
            logo_url,
            banner_url,
            is_active,
            is_verified,
            created_at,
            profiles:owner_id (full_name, email)
        `)
        .eq('slug', slug)
        .single();

    if (error || !store) {
        notFound();
    }

    // Fetch all products for this store
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

    // Transform nested profile
    const formattedStore = {
        ...store,
        owner: Array.isArray(store.profiles) ? store.profiles[0] : store.profiles
    };

    return (
        <main className="bg-[#0A192F] min-h-screen text-white">
            <Header />
            <div className="pt-24 lg:pt-32">
                <StorePublicClient
                    store={formattedStore as any}
                    initialProducts={products || []}
                />
            </div>
        </main>
    );
}
