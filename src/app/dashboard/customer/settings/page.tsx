import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerSettingsClient from '@/components/CustomerSettingsClient';

export default async function CustomerSettingsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, gender, birth_date, bio')
        .eq('id', user.id)
        .single();

    return <CustomerSettingsClient user={user} profile={profile} />;
}


