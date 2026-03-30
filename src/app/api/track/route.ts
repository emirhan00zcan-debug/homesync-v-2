import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import UserEvent from '@/lib/models/UserEvent';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { activity_type, entity_id, metadata } = await req.json();

        if (!activity_type) {
            return NextResponse.json({ error: 'activity_type is required' }, { status: 400 });
        }

        // ── Layer 1: Supabase (existing, preserved) ──────────────────────────────
        const { error: supabaseError } = await supabase.from('user_activity').insert({
            user_id: user.id,
            activity_type,
            entity_id,
            metadata: metadata || {}
        });

        if (supabaseError) {
            console.error('Error tracking activity (Supabase):', supabaseError);
        }

        // ── Layer 2: MongoDB (new — behavioural profile for recommendations) ─────
        // Only track events that carry product signals
        const isProductEvent =
            (activity_type === 'product_view' || activity_type === 'cart_add' || activity_type === 'purchase') &&
            entity_id &&
            metadata?.category;

        if (isProductEvent) {
            try {
                await connectMongoDB();

                const eventType =
                    activity_type === 'cart_add' ? 'cart' :
                        activity_type === 'purchase' ? 'purchase' :
                            'view';

                await UserEvent.create({
                    user_id: user.id,
                    product_id: entity_id,
                    category: metadata.category ?? 'Genel',
                    price: Number(metadata.price) || 0,
                    event_type: eventType,
                    timestamp: new Date(),
                });
            } catch (mongoErr) {
                // Never let MongoDB failure block the response
                console.error('MongoDB event write failed (non-fatal):', mongoErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Track API Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
