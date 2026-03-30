'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';

export interface JobItemType {
    id: string;
    service_type: string;
    status: string;
    description: string;
    created_at: string;
    customer_id: string;
    profiles?: {
        full_name: string | null;
        address?: string | null;
    } | null;
}

const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
        case 'yeni':
            return 'bg-radiant-amber/20 text-radiant-amber border-radiant-amber/30';
        case 'devam_ediyor':
        case 'devam ediyor':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'iptal':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'tamamlandi':
        case 'tamamlandı':
        default:
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
};

export default function JobsClient({ initialJobs }: { initialJobs: JobItemType[] }) {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobItemType[]>(initialJobs);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<{ [key: string]: string }>({});
    const [summarizingId, setSummarizingId] = useState<string | null>(null);

    const handleSummarize = async (jobId: string, description: string) => {
        if (!description || summarizingId) return;

        setSummarizingId(jobId);
        try {
            const res = await fetch('/api/ai/summarize-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            const data = await res.json();
            if (data.summary) {
                setSummaries(prev => ({ ...prev, [jobId]: data.summary }));
            }
        } catch (error) {
            console.error('Summarize error:', error);
        } finally {
            setSummarizingId(null);
        }
    };

    const handleCopyAddress = (id: string, address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Keep state in sync with server
    useEffect(() => {
        setJobs(initialJobs);
    }, [initialJobs]);

    // Supabase Realtime Subscription for Service Requests
    useEffect(() => {
        const channel = supabase
            .channel('technician-jobs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'service_requests' },
                (payload) => {
                    console.log('New job request came in!', payload);
                    alert("Yeni bir iş talebi geldi!");
                    router.refresh();
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'service_requests' },
                (payload) => {
                    console.log('Job request updated!', payload);
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return (
        <div className="flex flex-col gap-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-2">Güncel İş Talepleri</h2>
            {jobs.length === 0 ? (
                <div className="p-8 glass rounded-3xl border border-white/10 w-full flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-radiant-amber/10 flex items-center justify-center mx-auto mb-4 border border-radiant-amber/30">
                            <span className="text-radiant-amber text-2xl">🔧</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Yeni Görev Bulunmuyor</h3>
                        <p className="text-white/50 text-sm">Bölgenizde atanmış yeni bir kurulum görevi olduğunda burada listelenecektir.</p>
                    </div>
                </div>
            ) : (
                jobs.map(job => (
                    <div key={job.id} className="p-6 glass rounded-2xl border border-white/10 hover:border-radiant-amber/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-1">{job.service_type}</p>
                                <p className="text-lg font-bold text-white tracking-tight">{job.profiles?.full_name || 'Müşteri'}</p>
                                <p className="text-xs text-white/40 mt-1">{new Date(job.created_at).toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg border ${getStatusStyles(job.status)}`}>{job.status}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl relative">
                            {summaries[job.id] ? (
                                <div className="p-3 bg-radiant-amber/10 border border-radiant-amber/20 rounded-lg mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles size={14} className="text-radiant-amber" />
                                        <span className="text-[10px] uppercase font-black tracking-widest text-radiant-amber">AI Özet</span>
                                    </div>
                                    <p className="text-sm font-bold text-white leading-relaxed">{summaries[job.id]}</p>
                                </div>
                            ) : null}
                            <p className="text-sm text-white/70 leading-relaxed mb-4">{job.description || 'Detay girilmemiş'}</p>

                            {!summaries[job.id] && job.description && (
                                <button
                                    onClick={() => handleSummarize(job.id, job.description)}
                                    disabled={summarizingId === job.id}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-blue border border-white/10 rounded-lg text-xs font-bold text-white/70 hover:text-radiant-amber hover:border-radiant-amber/50 transition-colors disabled:opacity-50"
                                >
                                    {summarizingId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    AI ile Özetle
                                </button>
                            )}
                        </div>

                        {job.profiles?.address && (
                            <div className="mt-4 flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                                <div className="pr-4">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Adres</p>
                                    <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{job.profiles.address}</p>
                                </div>
                                <button
                                    onClick={() => handleCopyAddress(job.id, job.profiles?.address || '')}
                                    className="p-2.5 rounded-lg bg-white/5 text-white/50 hover:text-radiant-amber hover:bg-radiant-amber/10 transition-all shrink-0"
                                    title="Adresi Kopyala"
                                >
                                    {copiedId === job.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
