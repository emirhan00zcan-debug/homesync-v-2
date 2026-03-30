import React from 'react';
import { createClient } from '@/lib/supabase/server';
import StoreVerificationClient from '@/components/StoreVerificationClient';

export default async function SuperAdminStoresPage() {
    const supabase = createClient();

    const { data: stores, error } = await supabase
        .from('stores')
        .select(`
            id, 
            name, 
            slug,
            logo_url,
            is_active, 
            is_verified,
            profiles:owner_id (email, full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching stores:', error);

    // Transforming the nested profiles to match the component type correctly
    const formattedStores = (stores || []).map(s => ({
        ...s,
        profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
    }));

    return <StoreVerificationClient stores={formattedStores as any} />;
}
