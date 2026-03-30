import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerServiceRequestsClient from './CustomerServiceRequestsClient';

export default async function CustomerServiceRequestsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    return (
        <div className="w-full h-full p-4">
            <CustomerServiceRequestsClient customerId={user.id} />
        </div>
    );
}
