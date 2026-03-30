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

async function forcePromote(email: string) {
    console.log(`Searching for ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log(`User ${email} not found in the list. Attempting to create...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: { role: 'ADMIN' }
        });
        if (createError) {
            console.error('Direct creation also failed:', createError.message);
        } else {
            console.log(`Successfully created new ADMIN: ${email}`);
        }
    } else {
        console.log(`Found user ID: ${user.id}. Updating metadata to ADMIN...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, role: 'ADMIN' }
        });

        if (updateError) {
            console.error('Error updating role:', updateError.message);
        } else {
            console.log(`Successfully promoted ${email} to ADMIN!`);
        }
    }
}

forcePromote('emirhan00zcan@gmail.com');
