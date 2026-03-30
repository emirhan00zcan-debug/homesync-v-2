import { createClient } from '@supabase/supabase-js'

/**
 * Admin/Service Role Supabase client.
 * Bypasses RLS — use ONLY in trusted server-side contexts (API routes, Server Components).
 * Never expose this client to the browser.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
