import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerReviewsClient from '@/components/CustomerReviewsClient';

export default async function CustomerReviewsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Kullanıcının yaptığı değerlendirmeleri ve ürün detaylarını çek
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            products (
                id,
                name,
                image_url,
                category
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Değerlendirmeler çekilirken hata oluştu:", error);
    }

    return <CustomerReviewsClient reviews={reviews as any || []} />;
}
