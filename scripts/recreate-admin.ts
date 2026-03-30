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

async function recreateAdmin(email: string) {
    console.log(`Re-creating admin account for ${email}...`);

    // 1. Find user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);
    if (user) {
        console.log(`Deleting existing user ${user.id}...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error('Error deleting user:', deleteError.message);
            return;
        }
    }

    // 2. Create user cleanly
    console.log(`Creating fresh admin user...`);
    const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'AdminPassword123!',
        email_confirm: true,
        user_metadata: { role: 'ADMIN', name: 'Emirhan' }
    });

    if (createError) {
        console.error('Error creating user:', createError.message);
    } else {
        console.log(`Successfully created and confirmed admin user: ${newUser?.id}`);
        console.log(`Password set to: AdminPassword123!`);
    }
}

recreateAdmin('emirhan00zcan@gmail.com');
