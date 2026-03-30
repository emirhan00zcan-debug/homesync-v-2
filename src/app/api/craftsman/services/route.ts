import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.user_metadata?.role?.toUpperCase();
        if (role !== 'TECHNICIAN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Requires Technician Role' }, { status: 403 });
        }

        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('usta_id', user.id)
            .order('created_at', { ascending: false });

        if (servicesError) {
            console.error("Services fetch error:", servicesError);
            return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
        }

        return NextResponse.json({ services: services || [] });

    } catch (error: any) {
        console.error("API /craftsman/services Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.user_metadata?.role?.toUpperCase();
        if (role !== 'TECHNICIAN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Requires Technician Role' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, price, duration } = body;

        if (!title || typeof price !== 'number') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: service, error: insertError } = await supabase.from('services').insert({
            title,
            description: description || '',
            price,
            duration: duration || null,
            usta_id: user.id
        }).select().single();

        if (insertError) {
            console.error("Service creation error:", insertError);
            return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
        }

        return NextResponse.json({ success: true, service });

    } catch (error: any) {
        console.error("API /craftsman/services POST Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
