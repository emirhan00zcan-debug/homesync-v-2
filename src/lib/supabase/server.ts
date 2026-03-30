import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    const cookieJar = await cookieStore;
                    return cookieJar.get(name)?.value
                },
                async set(name: string, value: string, options: CookieOptions) {
                    try {
                        const cookieJar = await cookieStore;
                        cookieJar.set({ name, value, ...options })
                    } catch {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                async remove(name: string, options: CookieOptions) {
                    try {
                        const cookieJar = await cookieStore;
                        cookieJar.set({ name, value: '', ...options })
                    } catch {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
