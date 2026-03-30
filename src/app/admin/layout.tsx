/**
 * ─── Admin Portal Layout ──────────────────────────────────────────────────────
 * Wraps all /admin/* routes. Guards: only ADMIN role is allowed.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Yönetici Paneli | HomeSync',
    description: 'Platform yönetimi — ürünler, satıcılar, siparişler.',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?callbackUrl=/admin');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)]">
            {/* Admin-specific sidebar / shell */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
