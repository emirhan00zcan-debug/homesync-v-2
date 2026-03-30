const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- Supabase Frankfurt Connection Check ---');
    console.log('URL:', supabaseUrl);

    // 1. Check profiles table
    const { data: profiles, error: pError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (pError) console.error('Profiles table error:', pError.message);
    else console.log('✅ Profiles table exists. Count:', profiles);

    // 2. Check products table
    const { data: products, error: prError } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (prError) console.error('Products table error:', prError.message);
    else console.log('✅ Products table exists. Count:', products);

    // 3. Check functions (is_admin)
    const { data: funcCheck, error: fError } = await supabase.rpc('is_admin');
    if (fError) {
        // Expected to fail if no user is authenticated, but should not be "function not found"
        if (fError.message.includes('function "is_admin" does not exist')) {
            console.error('❌ Function "is_admin" is MISSING');
        } else {
            console.log('✅ Function "is_admin" exists (returned error as expected for anonymous call:', fError.message, ')');
        }
    } else {
        console.log('✅ Function "is_admin" exists and returned:', funcCheck);
    }

    // 4. Check Edge Function
    try {
        const fetch = require('node-fetch');
        const efUrl = `${supabaseUrl}/functions/v1/verify-id`;
        const response = await fetch(efUrl, { method: 'OPTIONS' });
        if (response.status === 200 || response.status === 204) {
            console.log('✅ Edge Function "verify-id" is reachable (OPTIONS PASSED)');
        } else {
            console.warn('⚠️ Edge Function "verify-id" returned unexpected status:', response.status);
        }
    } catch (e) {
        console.error('❌ Edge Function reachability test failed:', e.message);
    }

    console.log('-------------------------------------------');
}

verify();
