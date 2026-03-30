import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VerificationStatusClient from './status-client';
import { ShieldCheck, FileText } from 'lucide-react';

export const metadata = {
    title: 'Doğrulama Durumu | HomeSync Pro',
    description: 'Uzmanlık belgelerinizin onay durumunu takip edin.',
};

export default async function VerificationPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth');

    // Fetch profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'usta') redirect('/dashboard');

    // Fetch technician documents
    const { data: documents, error } = await supabase
        .from('technician_documents')
        .select('*')
        .eq('usta_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Documents fetch error:', error);
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-radiant-amber mb-1">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] uppercase font-black tracking-widest italic">Güvenlik ve Doğrulama</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        PRO <span className="text-radiant-amber">STATUS</span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                        Hesabınızın aktifleşmesi için belgelerinizin onaylanmış olması gerekmektedir.
                    </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-radiant-amber/20 rounded-xl flex items-center justify-center">
                        <FileText className="text-radiant-amber" size={20} />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Yüklenen Belge</p>
                        <p className="text-xl font-bold text-white">{documents?.length || 0}</p>
                    </div>
                </div>
            </div>

            <VerificationStatusClient documents={documents || []} />
        </div>
    );
}
