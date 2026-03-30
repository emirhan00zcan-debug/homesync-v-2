"use client";

import { createClient } from '@/lib/supabase/client';
import TechnicianJobsClient from '@/components/TechnicianJobsClient';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const supabase = createClient();

export default function TechnicianJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);

    const fetchJobs = useCallback(async (mounted = true) => {
        if (!user) return;
        const { data } = await supabase
            .from('service_requests')
            .select('*, profiles(full_name)')
            .eq('usta_id', user.id)
            .order('created_at', { ascending: false });

        if (mounted) {
            setJobs((data ?? []).map(j => ({
                ...j,
                customer_name: (j as any).profiles?.full_name ?? null,
            })));
        }
    }, [user]);

    useEffect(() => {
        let mounted = true;
        fetchJobs(mounted);
        return () => { mounted = false; };
    }, [fetchJobs]);

    const handleAccept = async (id: string) => {
        await supabase.from('service_requests').update({ status: 'accepted' }).eq('id', id);
        fetchJobs();
    };
    const handleStart = async (id: string) => {
        await supabase.from('service_requests').update({ status: 'in_progress' }).eq('id', id);
        fetchJobs();
    };
    const handleReject = async (id: string) => {
        await supabase.from('service_requests').update({ status: 'rejected' }).eq('id', id);
        fetchJobs();
    };
    const handleComplete = async (id: string) => {
        await supabase.from('service_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
        fetchJobs();
    };

    return (
        <TechnicianJobsClient
            jobs={jobs}
            onAccept={handleAccept}
            onStart={handleStart}
            onReject={handleReject}
            onComplete={handleComplete}
        />
    );
}
