"use server";

import { createClient } from '@/lib/supabase/server';

export async function verifyUserAction(userId: string, action: 'approve' | 'reject') {
    const supabase = createClient();

    // Confirm that the current user is a super_admin or admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || (profile.role !== 'super_admin' && profile.role !== 'admin')) {
        return { success: false, error: 'Unauthorized role' };
    }

    const { error } = await supabase.rpc('handle_user_verification', {
        p_user_id: userId,
        p_action: action
    });

    if (error) {
        console.error('RPC Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
