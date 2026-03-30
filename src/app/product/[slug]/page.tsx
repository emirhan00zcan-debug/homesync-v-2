import React from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/ProductClient';
import { incrementViewCount } from '@/app/actions/customer/product-interactions';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            reviews (
                *
            )
        `)
        .eq('slug', slug)
        .single();

    if (error || !product) {
        console.error("Failed to fetch product by slug:", error);
        notFound();
    }

    // Proactively increment view count
    incrementViewCount(product.id).catch(err => console.error("View increment failed:", err));

    return <ProductClient product={product} />;
}
