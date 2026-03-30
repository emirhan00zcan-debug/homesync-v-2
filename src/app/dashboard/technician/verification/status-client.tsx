'use client';

import React from 'react';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    RefreshCcw
} from 'lucide-react';
import Link from 'next/link';

interface Document {
    id: string;
    document_type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    created_at: string;
    file_url: string;
}

interface VerificationStatusClientProps {
    documents: Document[];
}

const statusConfig = {
    PENDING: {
        icon: Clock,
        color: 'text-radiant-amber',
        bg: 'bg-radiant-amber/10',
        border: 'border-radiant-amber/20',
        label: 'İnceleme Bekliyor'
    },
    APPROVED: {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/20',
        label: 'Onaylandı'
    },
    REJECTED: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        label: 'Reddedildi'
    }
};

const getDocTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
        case 'IDENTITY':
        case 'IDENTITY_CARD':
            return 'Kimlik Kartı / Pasaport';
        case 'CERTIFICATE':
            return 'Mesleki Yeterlilik Belgesi';
        case 'CRIMINAL_RECORD':
            return 'Adli Sicil Kaydı';
        default:
            return type;
    }
};

export default function VerificationStatusClient({ documents }: VerificationStatusClientProps) {
    const allApproved = documents.length > 0 && documents.every(d => d.status === 'APPROVED');
    const hasRejected = documents.some(d => d.status === 'REJECTED');

    return (
        <div className="space-y-6">
            {/* Summary Alert */}
            {allApproved ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Hesabınız Doğrulandı!</h3>
                        <p className="text-white/60 text-sm">Tüm belgeleriniz onaylandı. Artık müşteri taleplerine cevap verebilirsiniz.</p>
                    </div>
                </div>
            ) : hasRejected ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-red-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Belge Eksikliği / Hata</h3>
                        <p className="text-white/60 text-sm">Bazı belgeleriniz reddedildi. Lütfen aşağıdaki notları inceleyip tekrar yükleyin.</p>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-radiant-amber/10 border border-radiant-amber/20 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-radiant-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="text-radiant-amber" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Doğrulama Devam Ediyor</h3>
                        <p className="text-white/60 text-sm">Belgeleriniz admin ekibimiz tarafından inceleniyor. Ortalama süre 24 saattir.</p>
                    </div>
                </div>
            )}

            {/* Documents List */}
            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => {
                    const config = statusConfig[doc.status];
                    const StatusIcon = config.icon;

                    return (
                        <div key={doc.id} className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <FileText className="text-white/40" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{getDocTypeLabel(doc.document_type)}</h4>
                                        <p className="text-white/30 text-xs uppercase tracking-widest font-black">
                                            {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-xl border ${config.bg} ${config.border} ${config.color} flex items-center gap-2 text-xs font-bold uppercase tracking-tighter`}>
                                        <StatusIcon size={14} />
                                        <span>{config.label}</span>
                                    </div>

                                    {doc.status === 'REJECTED' && (
                                        <Link
                                            href="/auth/technician-onboarding"
                                            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                                            title="Tekrar Yükle"
                                        >
                                            <RefreshCcw size={18} />
                                        </Link>
                                    )}

                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                                        title="Görüntüle"
                                    >
                                        <Download size={18} />
                                    </a>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {doc.status === 'REJECTED' && doc.rejection_reason && (
                                <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={16} />
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-red-400/60">Admin Notu:</p>
                                        <p className="text-sm text-red-200/80 leading-relaxed italic">
                                            &quot;{doc.rejection_reason}&quot;
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {documents.length === 0 && (
                    <div className="p-12 glass rounded-3xl border border-white/10 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <FileText className="text-white/20" size={32} />
                        </div>
                        <h4 className="text-white font-bold mb-2">Henüz Belge Yüklenmemiş</h4>
                        <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
                            Profilinizi aktifleştirmek için gerekli belgeleri onboarding sayfasından yükleyebilirsiniz.
                        </p>
                        <Link
                            href="/auth/technician-onboarding"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-radiant-amber text-cosmic-blue font-bold rounded-xl hover:scale-105 transition-all"
                        >
                            <span>Belge Yükle</span>
                            <RefreshCcw size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
