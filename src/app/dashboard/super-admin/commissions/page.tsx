import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CommissionsClient from '@/components/CommissionsClient';

export default async function SuperAdminCommissionsPage() {
    const supabase = createClient();

    const [vendorsRes, historyRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, full_name, email, commission_rate, vendor_status, company_name')
            .eq('role', 'vendor')
            .order('full_name'),
        supabase
            .from('vendor_commissions')
            .select('id, vendor_id, rate, note, created_at, profiles!vendor_commissions_vendor_id_fkey(full_name, email)')
            .order('created_at', { ascending: false })
            .limit(50),
    ]);

    return (
        <CommissionsClient
            vendors={(vendorsRes.data as unknown as any) || []}
            history={(historyRes.data as unknown as any) || []}
        />
    );
}
