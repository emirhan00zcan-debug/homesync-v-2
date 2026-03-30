import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Iyzico Callback Route
 * This is called by Iyzico after the user completes the payment on the hosted checkout form.
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const token = formData.get('token');

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 400 });
        }

        const supabase = createClient();

        // 1. In a production app, you should call Iyzico's "Retrieve Checkout Form" API here
        // to verify the payment result using the token.
        // For this demo/task, we assume success or simulate the retrieval.

        // Retrieve order by token (stored as payment_id)
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('payment_id', token)
            .single();

        if (orderError || !order) {
            console.error("Order not found for token:", token);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=order_not_found`, { status: 303 });
        }

        // 2. Update Order Status to 'paid' (Escrowed)
        // We also need to store the Iyzico paymentTransactionId for each item 
        // because we need it later for the 'Approve' call.

        await supabase.from('orders').update({
            payment_status: 'paid', // 'paid' means money is in the pool/escrow
            status: 'PAYMENT_RECEIVED'
        }).eq('id', order.id);

        // Update items with mock/real transaction IDs
        await Promise.all(order.order_items.map(async (item: any, index: number) => {
            const mockTransactionId = `tr-${order.id}-${index}`;
            await supabase.from('order_items').update({
                payment_transaction_id: mockTransactionId
            }).eq('id', item.id);
        }));

        // 3. Redirect to success page
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`, { status: 303 });

    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=system_error`, { status: 303 });
    }
}
