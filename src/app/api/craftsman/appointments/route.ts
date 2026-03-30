import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.user_metadata?.role?.toUpperCase();
        if (role !== 'TECHNICIAN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Requires Technician Role' }, { status: 403 });
        }

        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select(`
                *,
                customer:profiles!customer_id (id, full_name, email, phone),
                service:services (id, title, price, duration)
            `)
            .eq('usta_id', user.id)
            .order('scheduled_at', { ascending: true });

        if (appointmentsError) {
            console.error("Appointments fetch error:", appointmentsError);
            return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
        }

        return NextResponse.json({ appointments: appointments || [] });

    } catch (error: any) {
        console.error("API /craftsman/appointments Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.user_metadata?.role?.toUpperCase();
        if (role !== 'TECHNICIAN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Requires Technician Role' }, { status: 403 });
        }

        const body = await request.json();
        const { appointment_id, status } = body;

        if (!appointment_id || !status) {
            return NextResponse.json({ error: 'Missing appointment_id or status' }, { status: 400 });
        }

        // Technically, RLS also prevents updating others' appointments, 
        // but it's good practice to enforce `usta_id` constraint too.
        const { data: updatedAppointment, error: updateError } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointment_id)
            .eq('usta_id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error("Appointment update error:", updateError);
            return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
        }

        return NextResponse.json({ success: true, appointment: updatedAppointment });

    } catch (error: any) {
        console.error("API /craftsman/appointments PUT Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
