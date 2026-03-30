import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import UserEvent from '@/lib/models/UserEvent';

const RECOMMENDER_URL = process.env.RECOMMENDER_URL ?? 'http://localhost:8001';
const FALLBACK_PRODUCT_LIMIT = 8;

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // ── Fetch all products from Supabase (candidates) ──────────────────────
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, slug, name, price, category, imageUrl:image_url, description, stockCount:stock_count')
            .gt('stock_count', 0)
            .order('created_at', { ascending: false })
            .limit(80); // Fetch a broad candidate set

        if (productsError) {
            return NextResponse.json({ error: productsError.message }, { status: 500 });
        }

        // ── Unauthenticated: return latest products as "popular" fallback ───────
        if (!user) {
            return NextResponse.json({
                personalized: false,
                products: (products ?? []).slice(0, FALLBACK_PRODUCT_LIMIT),
            });
        }

        // ── Try to get personalized recommendations from Python service ─────────
        try {
            const db = await connectMongoDB();

            if (!db) {
                return NextResponse.json({
                    personalized: false,
                    products: (products ?? []).slice(0, FALLBACK_PRODUCT_LIMIT),
                });
            }

            // Build a minimal user profile from MongoDB (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const events = await UserEvent
                .find({ user_id: user.id, timestamp: { $gte: thirtyDaysAgo } })
                .select('category price event_type')
                .lean();

            // If user has no events yet, fallback to popular
            if (!events.length) {
                return NextResponse.json({
                    personalized: false,
                    products: (products ?? []).slice(0, FALLBACK_PRODUCT_LIMIT),
                });
            }

            // Call Python FastAPI recommender
            const recommenderRes = await fetch(`${RECOMMENDER_URL}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    events: events,
                    candidate_products: products ?? [],
                    bypass_cache: false, // Can be dynamic based on request params
                }),
                signal: AbortSignal.timeout(3000), 
            });

            if (!recommenderRes.ok) {
                throw new Error(`Recommender service returned ${recommenderRes.status}`);
            }

            const data = await recommenderRes.json();

            return NextResponse.json({
                personalized: true,
                products: data.recommendations,
                metrics: {
                    latency_ms: data.latency_ms,
                    cache_hit: data.cache_hit,
                }
            });

        } catch (recommenderErr) {
            // Recommender down? Fallback gracefully
            console.warn('Recommender unavailable, falling back to popular:', recommenderErr);
            return NextResponse.json({
                personalized: false,
                products: (products ?? []).slice(0, FALLBACK_PRODUCT_LIMIT),
                reason: 'recommender_fallback'
            });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
