import React from 'react';
import { createClient } from '@/lib/supabase/server';
import FavoritesClient from '@/components/FavoritesClient';
import { redirect } from 'next/navigation';

export default async function FavoritesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    const { data: favoriteProducts, error } = await supabase
        .from('favorites')
        .select(`
            id,
            product_id,
            products (
                id,
                name,
                slug,
                price,
                manufacturer,
                category,
                image_url
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching favorites:", error);
    }

    return <FavoritesClient favoriteProducts={favoriteProducts || []} />;
}
