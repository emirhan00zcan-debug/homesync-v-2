import React from 'react';
import { createClient } from '@/lib/supabase/server';
import VendorManagementClient from '@/components/VendorManagementClient';

export default async function SuperAdminVendorsPage() {
    const supabase = createClient();

    const { data: vendors, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, vendor_status, commission_rate, company_name, updated_at')
        .in('role', ['vendor', 'VENDOR', 'SELLER', 'seller', 'satici', 'SATICI'])
        .order('updated_at', { ascending: false });

    if (error) console.error('Error fetching vendors:', error);

    // Get product counts per vendor
    const vendorIds = (vendors || []).map(v => v.id);
    let productCounts: Record<string, number> = {};

    if (vendorIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('vendor_id')
            .in('vendor_id', vendorIds);

        if (products) {
            productCounts = products.reduce((acc, p) => {
                acc[p.vendor_id] = (acc[p.vendor_id] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        }
    }

    const enrichedVendors = (vendors || []).map(v => ({
        ...v,
        productCount: productCounts[v.id] || 0,
    }));

    return <VendorManagementClient vendors={enrichedVendors} />;
}
