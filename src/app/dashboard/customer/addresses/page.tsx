import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerAddressesClient from '@/components/CustomerAddressesClient';

export default async function CustomerAddressesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Kullanıcının adreslerini çek
    const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Hata varsa veya tablo yoksa logla ama sayfayı patlatma
    if (error) {
        console.error("Adresler çekilirken hata oluştu:", error);
    }

    return <CustomerAddressesClient initialAddresses={addresses || []} userId={user.id} />;
}
