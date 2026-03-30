import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, FileCheck, Clock, Settings, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function VerifyPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth?mode=LOGIN');
    }

    // Get current verification status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified, verification_status')
        .eq('id', user.id)
        .single();

    if (profile?.is_verified) {
        // If already verified, redirect to their respective dashboard
        const role = (user.user_metadata?.role || 'customer').toLowerCase();
        redirect(`/dashboard/${role}`);
    }

    const role = (user.user_metadata?.role || 'customer').toUpperCase();
    const isVendor = role === 'VENDOR';
    const isTech = role === 'TECHNICIAN';

    // Check if documents are uploaded
    let hasDocuments = false;
    if (isTech) {
        const { count } = await supabase
            .from('technician_documents')
            .select('*', { count: 'exact', head: true })
            .eq('usta_id', user.id);
        hasDocuments = (count || 0) > 0;
    } else if (isVendor) {
        const { count } = await supabase
            .from('verification_documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        hasDocuments = (count || 0) > 0;
    }

    const status = profile?.verification_status || 'pending';
    const onboardingUrl = isVendor ? '/auth/vendor-onboarding' : isTech ? '/auth/technician-onboarding' : `/dashboard/${role.toLowerCase()}/settings`;

    return (
        <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/10 pointer-events-none" />
            <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[150px] bg-yellow-500/5 pointer-events-none" />

            <div className="max-w-xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {/* Decorative top border gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

                    <div className="flex flex-col items-center text-center">
                        {status === 'rejected' ? (
                            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <ShieldAlert size={40} />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 shadow-[0_0_30px_rgba(255,191,0,0.2)]">
                                <Clock size={40} />
                            </div>
                        )}

                        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                            {status === 'rejected' ? 'Başvuru Reddedildi' : 'Erişim Kısıtlandı'}
                        </h1>

                        <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
                            {status === 'rejected'
                                ? 'Yüklediğiniz belgeler uygun bulunmadı. Lütfen belgelerinizi kontrol edip tekrar yükleyin.'
                                : hasDocuments
                                    ? 'Bilgileriniz ve belgeleriniz başarıyla yüklendi. Panelinizin aktif edilmesi için admin onayı bekleniyor.'
                                    : 'Aramıza hoş geldiniz! Hesabınızı aktifleştirmek için 3 adımlı doğrulama sürecini tamamlamanız gerekmektedir: Önce Kimlik Doğrulaması (MERNİS), ardından İşletme Bilgileri ve son olarak Gerekli Belgeler.'}
                        </p>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                    <FileCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">Durum: <span className="uppercase text-yellow-400 tracking-widest text-[10px] ml-1">{status === 'rejected' ? 'REDDEDİLDİ' : hasDocuments ? 'ONAY BEKLİYOR' : 'EKSİK BELGE'}</span></p>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        {status === 'rejected' ? 'Lütfen belgeleri güncelleyin.' : hasDocuments ? 'İnceleme devam ediyor (1-3 iş günü).' : 'Kayıt sürecini tamamlayın.'}
                                    </p>
                                </div>
                            </div>

                            {status === 'rejected' && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200/80 leading-relaxed text-left">
                                    <strong className="text-red-400 block mb-1">Red Nedeniniz:</strong>
                                    Lütfen geçerli ve güncel belgelerinizi tekrar yükleyiniz.
                                </div>
                            )}
                        </div>

                        <div className="w-full h-px bg-white/10 my-8" />

                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            {!hasDocuments || status === 'rejected' ? (
                                <Link href={onboardingUrl} className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-radiant-amber text-cosmic-blue text-sm font-bold transition-all shadow-glow hover:scale-105 active:scale-95">
                                    <ShieldCheck size={16} />
                                    Doğrulamayı {status === 'rejected' ? 'Tekrarla' : 'Tamamla'}
                                </Link>
                            ) : (
                                <Link href="/" className="flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all">
                                    Ana Sayfaya Dön
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
