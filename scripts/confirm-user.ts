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

async function forceConfirm(email: string) {
    console.log(`Force confirming email for ${email}...`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`User ${email} not found.`);
        return;
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        // Also set confirmed_at just in case
        user_metadata: { ...user.user_metadata, email_verified: true }
    });

    if (updateError) {
        console.error('Error confirming email:', updateError.message);
    } else {
        console.log(`Successfully confirmed email for ${email}!`);
    }
}

forceConfirm('emirhan00zcan@gmail.com');
