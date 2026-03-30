import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('--- Database Diagnostics ---');

    // Check stores table
    const { data: stores, error: storesError } = await supabase.from('stores').select('*').limit(1);
    if (storesError) {
        console.error('❌ Table "stores" error:', storesError.message);
    } else {
        console.log('✅ Table "stores" is accessible.');
    }

    // Check products.store_id
    const { data: productCols, error: prodError } = await supabase.rpc('get_table_columns', { table_name: 'products' });
    // Note: rpc get_table_columns might not exist, let's try a direct select with one column
    const { error: storeIdError } = await supabase.from('products').select('store_id').limit(1);
    if (storeIdError) {
        console.error('❌ Column "products.store_id" error:', storeIdError.message);
    } else {
        console.log('✅ Column "products.store_id" exists.');
    }

    // Check profiles.store_id
    const { error: profileStoreIdError } = await supabase.from('profiles').select('store_id').limit(1);
    if (profileStoreIdError) {
        console.error('❌ Column "profiles.store_id" error:', profileStoreIdError.message);
    } else {
        console.log('✅ Column "profiles.store_id" exists.');
    }

    // Check if there are any stores
    const { count, error: countError } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    console.log(`📊 Total stores in database: ${count || 0}`);
}

diagnose();
