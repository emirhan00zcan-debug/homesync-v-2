import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import UserApprovalsClient from '@/components/UserApprovalsClient';

export default async function SuperAdminUserApprovalsPage() {
    const supabase = createClient();

    // Fetch users with verification_status = 'pending'
    const { data: users, error } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            email,
            role,
            company_name,
            verification_status,
            verification_documents:technician_documents!usta_id (
                id,
                document_url:file_url,
                document_type,
                created_at
            )
        `)
        .in('verification_status', ['pending', 'PENDING'])
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending users:', error);
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl mx-4 my-8">
                <h2 className="text-xl font-bold text-red-400 mb-2">Veriler Yüklenemedi</h2>
                <p className="text-red-400/80">Kullanıcı verileri çekilirken bir hata oluştu. Lütfen sayfayı yenileyiniz.</p>
                <p className="text-xs text-red-400/50 mt-4">{error.message}</p>
            </div>
        );
    }

    const formattedUsers = (users || []).map(u => {
        // Handle potential different join name if alias didn't stick or renamed
        const docs = u.verification_documents || (u as any).technician_documents || [];
        return {
            ...u,
            verification_documents: Array.isArray(docs) ? docs : []
        };
    });

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserApprovalsClient initialUsers={formattedUsers as any} />
        </Suspense>
    );
}
