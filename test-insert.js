import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing envs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const storeIdRes = await supabase.from('stores').select('id').limit(1);
  if (!storeIdRes.data || storeIdRes.data.length === 0) {
    console.log('No store found, cannot test insert.');
    return;
  }
  const storeId = storeIdRes.data[0].id;

  const { data, error } = await supabase.from('products').insert([
    {
      store_id: storeId,
      name: 'Test Product Bulk',
      description: 'Test',
      price: 15.5,
      stock_count: 50,
      category: 'Aydınlatma',
      image_url: null,
      is_active: true,
      status: 'pending',
    }
  ]).select();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
    // cleaning up
    await supabase.from('products').delete().eq('id', data[0].id);
  }
}

test();
