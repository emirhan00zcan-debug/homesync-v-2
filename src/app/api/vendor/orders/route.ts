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

        // 3. Get all products beloning to this store
        const { data: storeProducts } = await supabase
            .from('products')
            .select('id')
            .eq('store_id', storeId);

        const productIds = (storeProducts || []).map(p => p.id);

        if (productIds.length === 0) {
            return NextResponse.json({ orders: [] }); // No products = no orders
        }

        // 4. Find order items that match store products
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('order_id, quantity, price')
            .in('product_id', productIds);

        if (itemsError || !orderItems || orderItems.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        // Group by order
        const orderSummaryMap: Record<string, { itemCount: number, vendorRevenue: number }> = {};
        for (const item of orderItems) {
            if (!orderSummaryMap[item.order_id]) {
                orderSummaryMap[item.order_id] = { itemCount: 0, vendorRevenue: 0 };
            }
            orderSummaryMap[item.order_id].itemCount += item.quantity;
            orderSummaryMap[item.order_id].vendorRevenue += (item.quantity * item.price);
        }

        const orderIds = Object.keys(orderSummaryMap);

        // 5. Fetch actual order rows
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, created_at, status, total_amount, shipping_name, shipping_city')
            .in('id', orderIds)
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error("Orders fetch error:", ordersError);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        // Combine data
        const enrichedOrders = (orders || []).map(order => ({
            ...order,
            vendor_item_count: orderSummaryMap[order.id].itemCount,
            vendor_revenue: orderSummaryMap[order.id].vendorRevenue
        }));

        return NextResponse.json({ orders: enrichedOrders });

    } catch (error: any) {
        console.error("API /vendor/orders Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
