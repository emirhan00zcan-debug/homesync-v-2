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

async function inspectUser(email: string) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.log(`User ${email} NOT FOUND.`);
    } else {
        console.log('User Details:');
        console.log(JSON.stringify(user, null, 2));
    }
}

inspectUser('emirhan00zcan@gmail.com');
