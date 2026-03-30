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

async function checkFavoritesTable() {
    console.log('Checking for favorites table...');
    const { error } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('Table "favorites" error:', error.message);
    } else {
        console.log('Table "favorites" exists.');
    }
}

checkFavoritesTable();
