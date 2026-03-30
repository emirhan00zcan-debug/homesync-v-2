import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.user_metadata?.role?.toUpperCase();
        if (role !== 'VENDOR' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Requires Vendor Role' }, { status: 403 });
        }

        // 2. Resolve Store ID for the Vendor
        const { data: profile } = await supabase
            .from('profiles')
            .select('store_id')
            .eq('id', user.id)
            .single();

        const storeId = profile?.store_id;
        if (!storeId) {
            return NextResponse.json({ error: 'Vendor profile/store not found' }, { status: 403 });
        }

        // 3. Parse and Validate Body
        const body = await request.json();
        const { name, price, description, category, imageUrl, lumens, wattage, difficulty, material } = body;

        if (!name || typeof price !== 'number' || !imageUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 4. Insert Product with Pending Status
        const slug = name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + Math.random().toString(36).substring(7);

        const { data: product, error: insertError } = await supabase.from('products').insert({
            name,
            slug,
            price,
            description: description || '',
            category: category || 'Lighting',
            image_url: imageUrl,
            lumens: lumens || 0,
            wattage: wattage || 0,
            difficulty: difficulty || 'Medium',
            material: material || 'Premium Material',
            vendor_id: user.id,
            store_id: storeId,
            stock_count: 10,
            status: 'pending' // Admin onayı bekliyor
        }).select().single();

        if (insertError) {
            console.error("Product creation error:", insertError);
            return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
        }

        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error("API /vendor/products Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
