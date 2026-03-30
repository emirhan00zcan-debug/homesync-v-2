import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TechnicianDashboardClient from '@/components/TechnicianDashboardClient';

export default async function TechnicianDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, is_verified')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'usta') redirect('/dashboard');

    // technician_stats
    const { data: techStats } = await supabase
        .from('technician_stats')
        .select('*')
        .eq('usta_id', user.id)
        .single();

    // Fetch real jobs
    const { data: jobs } = await supabase
        .from('service_requests')
        .select(`
            *,
            profiles(full_name)
        `)
        .eq('usta_id', user.id)
        .order('created_at', { ascending: false });

    const stats = {
        fullName: profile.full_name,
        toplam_puan: Number(techStats?.toplam_puan ?? 0),
        tamamlanan_is_sayisi: techStats?.tamamlanan_is_sayisi ?? 0,
        toplam_kazanc: Number(techStats?.toplam_kazanc ?? 0),
        kesilen_komisyon: Number(techStats?.kesilen_komisyon ?? 0),
        pendingJobs: (jobs ?? []).filter(j => j.status === 'pending').length,
        activeJobs: (jobs ?? []).filter(j => j.status === 'in_progress' || j.status === 'accepted').length,
        isVerified: profile.is_verified ?? false,
    };

    const formattedJobs = (jobs ?? []).map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category,
        status: job.status,
        payment_type: job.payment_type,
        price_offered: job.price_offered,
        final_price: job.final_price,
        scheduled_at: job.scheduled_at,
        address: job.address,
        city: job.city,
        district: job.district,
        created_at: job.created_at,
        customer_name: (job as any).profiles?.full_name ?? 'Müşteri',
    }));

    return <TechnicianDashboardClient stats={stats} initialJobs={formattedJobs} />;
}
