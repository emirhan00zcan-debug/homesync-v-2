import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VendorSettingsClient from '@/components/VendorSettingsClient';

export default async function VendorSettingsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Fetch vendor's profile (which holds store_id and personal info)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, store_id, phone, gender, birth_date')
        .eq('id', user.id)
        .single();

    // Fetch store details if available
    let store = null;
    if (profile?.store_id) {
        const { data: storeData } = await supabase
            .from('stores')
            .select('id, name, slug, description, logo_url, banner_url, is_active, is_verified')
            .eq('id', profile.store_id)
            .single();
        store = storeData;
    }

    return <VendorSettingsClient user={user} profile={profile} store={store} />;
}
