/**
 * ─── Supabase — Barrel Export ────────────────────────────────────────────────
 * Provides consistent, aliased imports across the project:
 *
 *   import { createBrowserClient } from '@/lib/supabase';    // browser
 *   import { createServerClient } from '@/lib/supabase';     // server (SSR)
 *   import { createAdminClient } from '@/lib/supabase';      // admin (service role)
 *
 * Note: server.ts and admin.ts both export `createClient` under different semantics,
 * so we alias them here to avoid import conflicts.
 */
export { createClient as createBrowserClient } from './client';
