"use server";

import { createClient } from '@/lib/supabase/server';

/**
 * Resolve the store_id for the currently authenticated vendor.
 * Returns null if the user has no store linked.
 */
export async function resolveStoreId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

    return profile?.store_id ?? null;
}
