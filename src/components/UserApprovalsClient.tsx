"use client";

import React, { useState, useTransition } from 'react';
import { UserCheck, CheckCircle, XCircle, Search, Mail, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { verifyUserAction } from '@/app/actions/admin/user-approvals';
import { useRouter } from 'next/navigation';

type DocumentType = {
    id: string;
    document_url: string;
    document_type: string;
    created_at: string;
};

type UserType = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    company_name: string | null;
    verification_status: string;
    verification_documents: DocumentType[];
};

export default function UserApprovalsClient({ initialUsers }: { initialUsers: UserType[] }) {
    const [users, setUsers] = useState<UserType[]>(initialUsers);

    // Subscribe to realtime user approval updates
    React.useEffect(() => {
        const { createClient } = require('@/lib/supabase/client');
        const supabase = createClient();

        const channel = supabase.channel('realtime_channel_user_approvals');

        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles'
            },
            (payload: any) => {
                const status = payload.new?.verification_status?.toLowerCase();
                if (payload.new && status === 'pending') {
                    setUsers((prev: UserType[]) => {
                        if (prev.find(u => u.id === payload.new.id)) return prev;
                        return [payload.new as any, ...prev];
                    });
                } else if (payload.new && status !== 'pending') {
                    setUsers((prev: UserType[]) => prev.filter(u => u.id !== payload.new.id));
                }
            }
        ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
    const [msg, setMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();

    const showMsg = (id: string, type: 'success' | 'error', text: string) => {
        setMsg({ id, type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setProcessingAction(action);
        setProcessingId(userId);
        startTransition(async () => {
            const result = await verifyUserAction(userId, action);
            if (result.success) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                showMsg(userId, 'success', action === 'approve' ? 'Onaylandı' : 'Reddedildi');
                router.refresh(); // Refresh to update server data if needed
            } else {
                showMsg(userId, 'error', result.error || 'İşlem başarısız');
            }
            setProcessingId(null);
            setProcessingAction(null);
        });
    };

    const filtered = users.filter(u =>
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.company_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <UserCheck className="text-blue-400" size={32} />
                    Onay Bekleyen Kullanıcılar
                </h1>
                <p className="text-white/50 text-sm mt-1">Platforma kayıt olan usta ve satıcıların belgelerini incele ve onayla.</p>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="İsim, email veya şirket adı ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                        />
                    </div>

                    {/* Pending Users List */}
                    <div className="space-y-4">
                        {filtered.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <CheckCircle className="mx-auto text-green-400 mb-4" size={48} opacity={0.5} />
                                <h3 className="text-lg font-bold text-white mb-2">Bekleyen Onay Yok</h3>
                                <p className="text-white/50 text-sm">Tüm kullanıcı doğrulama işlemleri tamamlandı.</p>
                            </div>
                        ) : filtered.map((user) => (
                            <div key={user.id} className="p-6 rounded-2xl border border-white/10 transition-all hover:border-white/20"
                                style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">{user.full_name || 'İsimsiz Kullanıcı'}</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {user.role}
                                            </span>
                                        </div>
                                        {user.company_name && (
                                            <p className="text-sm text-white/70 mb-1"><span className="opacity-50">Şirket:</span> {user.company_name}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-white/50 text-sm">
                                            <Mail size={14} />
                                            {user.email}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Yüklenen Belgeler</h4>
                                            {user.verification_documents && user.verification_documents.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {user.verification_documents.map(doc => (
                                                        <a
                                                            key={doc.id}
                                                            href={doc.document_url || (doc as any).file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-blue-400 transition-colors"
                                                        >
                                                            <FileText size={14} />
                                                            {doc.document_type || 'Belge'}
                                                            <ExternalLink size={12} className="opacity-50 ml-1" />
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-yellow-500/80 italic">Henüz belge yüklenmemiş</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/10">
                                            <button
                                                onClick={() => handleAction(user.id, 'approve')}
                                                disabled={isPending || processingId === user.id}
                                                className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                            >
                                                {processingId === user.id && processingAction === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                Onayla
                                            </button>
                                            <button
                                                onClick={() => handleAction(user.id, 'reject')}
                                                disabled={isPending || processingId === user.id}
                                                className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                            >
                                                {processingId === user.id && processingAction === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                Reddet
                                            </button>
                                        </div>
                                        {msg?.id === user.id && (
                                            <p className={`text-xs text-center font-medium mt-2 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {msg.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Özet</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Bekleyen İstekler</p>
                                <p className="text-3xl font-black text-white">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                        <p className="text-xs text-blue-200/80 leading-relaxed">
                            <strong>İpucu:</strong> Kullanıcıları onaylamadan önce yükledikleri belgelerin (Vergi levhası, kimlik vb.) geçerliliğini mutlaka kontrol edin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

