/**
 * ─── Admin Hub Page ───────────────────────────────────────────────────────────
 * Entry point for /admin route. Redirects to super-admin dashboard.
 */
import { redirect } from 'next/navigation';

export default function AdminHubPage() {
    redirect('/dashboard/super-admin');
}
