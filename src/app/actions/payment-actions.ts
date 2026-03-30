"use server";

import { createClient } from '@/lib/supabase/server';
import { initializeCheckoutForm, approvePaymentItem, calculateSplit } from '@/lib/iyzico';
import { revalidatePath } from 'next/cache';

/**
 * Initializes a Marketplace payment with Iyzico.
 * This supports split payments by identifying the sub-merchant (technician/vendor).
 */
export async function initializeMarketplacePayment(orderId: string, customerId: string) {
    try {
        const supabase = createClient();

        // 1. Fetch Order and Items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    product:products(*)
                )
            `)
            .eq('id', orderId)
            .single();

        if (orderError || !order) throw new Error("Order not found");

        // 2. Fetch Customer Info
        const { data: customer } = await supabase.from('profiles').select('*').eq('id', customerId).single();

        // 3. Prepare Iyzico Request
        // In a real marketplace, each item might belong to a different sub-merchant.
        // For this flow, we assume the usta/vendor is the sub-merchant.
        const basketItems = await Promise.all(order.order_items.map(async (item: any) => {
            // Get sub-merchant key for the vendor
            const { data: vendor } = await supabase.from('profiles').select('sub_merchant_key, commission_rate').eq('id', item.vendor_id).single();

            const commissionRate = vendor?.commission_rate || 15;
            const split = calculateSplit(item.unit_price * item.quantity, commissionRate);

            return {
                id: item.product_id,
                name: item.product?.name || 'Product',
                category1: item.product?.category || 'General',
                itemType: 'PHYSICAL',
                price: (item.unit_price * item.quantity).toFixed(2),
                subMerchantKey: vendor?.sub_merchant_key || 'sub-merchant-placeholder',
                subMerchantPrice: split.subMerchantPrice
            };
        }));

        const iyzicoRequest = {
            locale: 'tr',
            conversationId: order.id,
            price: order.total_amount.toFixed(2),
            paidPrice: order.total_amount.toFixed(2),
            currency: 'TRY',
            basketId: order.id,
            paymentGroup: 'PRODUCT',
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
            enabledInstallments: [1, 2, 3, 6, 9],
            buyer: {
                id: customerId,
                name: customer?.full_name?.split(' ')[0] || 'Buyer',
                surname: customer?.full_name?.split(' ')[1] || 'Surname',
                gsmNumber: customer?.phone || '+905000000000',
                email: customer?.email || 'buyer@example.com',
                identityNumber: '11111111111', // Dummy for sandbox
                lastLoginDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
                registrationDate: customer?.created_at,
                registrationAddress: 'Address Placeholder',
                ip: '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34000'
            },
            shippingAddress: {
                contactName: order.shipping_name,
                city: order.shipping_city,
                country: 'Turkey',
                address: order.shipping_address,
                zipCode: '34000'
            },
            billingAddress: {
                contactName: order.shipping_name,
                city: order.shipping_city,
                country: 'Turkey',
                address: order.shipping_address,
                zipCode: '34000'
            },
            basketItems: basketItems
        };

        const result = await initializeCheckoutForm(iyzicoRequest);

        if (result.status === 'success') {
            // Update order with payment ID
            await supabase.from('orders').update({
                payment_id: result.token,
                payment_status: 'pending'
            }).eq('id', order.id);

            return { success: true, checkoutFormContent: result.checkoutFormContent, token: result.token };
        } else {
            return { success: false, error: result.errorMessage };
        }

    } catch (error: any) {
        console.error("Payment initialization error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirms the payment (Escrow Release).
 * Triggered by customer 'OTP' or 'Approval' of the work.
 */
export async function confirmOrderPayment(orderId: string) {
    try {
        const supabase = createClient();

        // 1. Get order items payment transaction IDs (stored after successful callback)
        const { data: items, error } = await supabase
            .from('order_items')
            .select('payment_transaction_id')
            .eq('order_id', orderId);

        if (error || !items) throw new Error("Order items not found");

        // 2. Approve each item in Iyzico (Marketplace Settlement)
        const approvalResults = await Promise.all(items.map(async (item) => {
            if (!item.payment_transaction_id) return { success: false, error: "No transaction ID" };
            return await approvePaymentItem(item.payment_transaction_id);
        }));

        const allSuccessful = approvalResults.every(res => res.status === 'success');

        if (allSuccessful) {
            await supabase.from('orders').update({
                payment_status: 'approved',
                status: 'COMPLETED'
            }).eq('id', orderId);

            revalidatePath('/dashboard/customer');
            return { success: true };
        } else {
            return { success: false, error: "Bazı ödeme kalemleri onaylanamadı." };
        }

    } catch (error: any) {
        console.error("Payment confirmation error:", error);
        return { success: false, error: error.message };
    }
}
