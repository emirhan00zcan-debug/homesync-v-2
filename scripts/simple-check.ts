import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function check() {
    console.log('--- DB Check ---');
    const { data, error } = await supabase.from('stores').select('id').limit(1);
    if (error) {
        console.log('Stores Table Error:', error.message);
    } else {
        console.log('Stores Table OK');
    }

    const { data: pData, error: pError } = await supabase.from('profiles').select('store_id').limit(1);
    if (pError) {
        console.log('Profiles store_id Error:', pError.message);
    } else {
        console.log('Profiles store_id OK');
    }
}
check();
