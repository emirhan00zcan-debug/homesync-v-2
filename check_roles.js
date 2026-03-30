import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: vendors, error: vErr } = await supabase
        .from('profiles')
        .select('role')
        .limit(10);

    if (vErr) console.error(vErr);
    console.log('Roles found:', vendors);
}
check();
