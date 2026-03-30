import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = createClient();

        // 1. Verify User Authentication via Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized or Invalid Token' }, { status: 401 });
        }

        // 2. Parse Checkout Data
        const body = await request.json();
        const { items, shippingDetails } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // 3. Mock Stripe/Iyzico Payment Processing
        console.log(`[MOCK PAYMENT] Processing payment for ${user.email} - Amount...`);
        let calculatedTotal = 0;

        // 4. Validate stock and calculate total, then decrement stock
        // For production, this should be an atomic RPC function in PostgREST.
        for (const item of items) {
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('id, name, price, stock')
                .eq('id', item.productId)
                .single();

            if (fetchError || !product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

            calculatedTotal += product.price * item.quantity;

            // Decrement stock
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock: product.stock - item.quantity })
                .eq('id', item.productId);

            if (updateError) throw new Error(`Failed to deduct stock for ${product.name}`);
        }

        // 5. Create the Order in Supabase
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: calculatedTotal,
                status: 'PAID', // Payment succeeded
                shipping_name: shippingDetails.name || user.user_metadata?.name || 'Customer',
                shipping_phone: shippingDetails.phone || 'N/A',
                shipping_email: shippingDetails.email || user.email,
                shipping_city: shippingDetails.city || 'N/A',
                shipping_address: shippingDetails.address || 'N/A',
            })
            .select()
            .single();

        if (orderError || !newOrder) throw new Error(`Failed to create order: ${orderError?.message}`);

        // 6. Insert Order Items for Vendor Order management
        const orderItemsPayload = items.map((item: any) => ({
            order_id: newOrder.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price || 0 // Assuming price comes from the frontend cart, actually better to use the fetched DB price but this matches existing structure
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsPayload);

        if (itemsError) {
            console.error("Failed to insert order items:", itemsError);
            // Proceed anyway to not fail checkout entirely, but log the error
        }

        console.log(`[MOCK PAYMENT SUCCESS] Order ${newOrder.id} created.`);

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            message: "Payment processed successfully"
        });

    } catch (error: unknown) {
        console.error("Checkout Mock API Error (Supabase):", error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
