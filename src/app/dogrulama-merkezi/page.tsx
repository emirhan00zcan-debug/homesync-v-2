'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    ShieldCheck,
    Smartphone,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    Upload,
    Clock,
    XCircle
} from 'lucide-react';
import { validateTCNo, toTurkishUpperCase } from '@/lib/validation';

type Status = 'pending' | 'approved' | 'rejected' | 'pending_approval';

export default function DogrulamaMerkezi() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [step, setStep] = useState(1);

    // Step 1: Phone
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    // Step 2: Identity
    const [tcNo, setTcNo] = useState('');
    const [ad, setAd] = useState('');
    const [soyad, setSoyad] = useState('');
    const [dogumYili, setDogumYili] = useState('');
    const [idVerified, setIdVerified] = useState(false);
    const [idVerifying, setIdVerifying] = useState(false);

    // Step 3: Documents
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [hasUploaded, setHasUploaded] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth?mode=LOGIN');
                return;
            }
            setUser(user);

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profile);

            if (profile?.status === 'active') {
                router.push('/dashboard');
                return;
            }

            // Auto fill from profile
            setTcNo(profile?.tc_no || '');
            setAd(profile?.ad || '');
            setSoyad(profile?.soyad || '');
            setDogumYili(profile?.dogum_yili?.toString() || '');
            setIdVerified(profile?.is_identity_verified || false);
            setPhone(profile?.phone || '');
            if (profile?.phone) setPhoneVerified(true);

            setLoading(false);
        }
        loadUser();
    }, []);

    const handleSendOtp = () => {
        setOtpSent(true);
        // Mock OTP send
    };

    const handleVerifyOtp = () => {
        if (otp === '123456') { // Mock OTP
            setPhoneVerified(true);
            setStep(2);
        } else {
            alert('Yanlış kod. Lütfen 123456 deneyin.');
        }
    };

    const handleIdVerify = async () => {
        if (!validateTCNo(tcNo)) return;
        setIdVerifying(true);
        try {
            const { data, error } = await supabase.functions.invoke('verify-id', {
                body: {
                    tc_no: tcNo,
                    first_name: toTurkishUpperCase(ad),
                    last_name: toTurkishUpperCase(soyad),
                    birth_year: parseInt(dogumYili)
                }
            });

            if (data?.success) {
                setIdVerified(true);
                // Update profile in DB
                const { error: updateError } = await supabase.from('profiles').update({
                    tc_no: tcNo,
                    ad: toTurkishUpperCase(ad),
                    soyad: toTurkishUpperCase(soyad),
                    dogum_yili: parseInt(dogumYili),
                    is_identity_verified: true
                }).eq('id', user.id);

                if (updateError) {
                    if (updateError.code === '23505') {
                        alert('Bu T.C. Kimlik Numarası zaten kayıtlı.');
                    } else {
                        throw updateError;
                    }
                } else {
                    setStep(3);
                }
            } else {
                alert('Kimlik bilgileri doğrulanamadı. Lütfen kontrol edin.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.status === 409 || err.code === '23505') {
                alert('Bu T.C. Kimlik Numarası sistemde başka bir kullanıcı tarafından kullanılıyor.');
            } else {
                alert('Hata oluştu.');
            }
        } finally {
            setIdVerifying(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setFiles([...files, ...newFiles]);
    };

    const submitDocuments = async () => {
        setUploading(true);
        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random()}.${fileExt}`;
                const { error } = await supabase.storage
                    .from('verification_documents')
                    .upload(fileName, file);

                if (!error) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('verification_documents')
                        .getPublicUrl(fileName);

                    await supabase.from('verification_documents').insert({
                        user_id: user.id,
                        file_url: publicUrl,
                        status: 'pending'
                    });
                }
            }

            // Update profile status to pending_approval
            await supabase.from('profiles').update({
                status: 'pending_approval'
            }).eq('id', user.id);

            setHasUploaded(true);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-cosmic-blue flex items-center justify-center">
            <Loader2 className="text-radiant-amber animate-spin" size={48} />
        </div>
    );

    if (profile?.status === 'pending_approval') {
        return (
            <div className="min-h-screen bg-cosmic-blue flex items-center justify-center p-6">
                <div className="glass p-12 rounded-[48px] max-w-xl text-center space-y-8 border border-white/10">
                    <div className="w-24 h-24 bg-radiant-amber/10 rounded-full flex items-center justify-center mx-auto border border-radiant-amber/20 shadow-glow">
                        <Clock className="text-radiant-amber" size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest">İnceleme Aşamasında</h1>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed">
                        Belgeleriniz başarıyla yüklendi. Uzman ekibimiz tarafından inceleniyor.
                        Hesabınız aktifleştiğinde bilgilendirileceksiniz.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-[24px] hover:bg-white/10 transition-all"
                    >
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cosmic-blue flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-radiant-amber/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Doğrulama <span className="text-radiant-amber">Merkezi</span></h1>
                    <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">HomeSync Güvenlik ve Uygunluk Protokolü</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 px-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -z-10" />
                    {[
                        { id: 1, icon: Smartphone, label: 'Telefon' },
                        { id: 2, icon: ShieldCheck, label: 'Kimlik' },
                        { id: 3, icon: FileText, label: 'Belgeler' }
                    ].map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-3">
                            <div className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700
                                ${step === s.id ? 'bg-radiant-amber text-cosmic-blue shadow-glow scale-110 rotate-[10deg]' :
                                    step > s.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/20'}
                            `}>
                                {step > s.id ? <CheckCircle2 size={24} /> : <s.icon size={24} />}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s.id ? 'text-white' : 'text-white/20'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="glass p-12 rounded-[56px] border border-white/10 shadow-3xl bg-white/[0.01] backdrop-blur-3xl overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold text-white">Telefon Doğrulaması</h3>
                                    <p className="text-white/40 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                        İşlemleriniz için güvenli bir iletişim kanalı oluşturun.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Telefon Numarası</label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-radiant-amber transition-colors" size={20} />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="05XX XXX XX XX"
                                                disabled={otpSent}
                                                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-white focus:outline-none focus:border-radiant-amber/40 transition-all font-mono tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    {otpSent && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Doğrulama Kodu</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="******"
                                                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white text-center text-2xl font-black tracking-[1em] focus:outline-none focus:border-radiant-amber/40 transition-all"
                                            />
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                                        className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[28px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3"
                                    >
                                        <span>{otpSent ? 'Kodu Doğrula' : 'SMS Gönder'}</span>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold text-white">NVİ Kimlik Doğrulaması</h3>
                                    <p className="text-white/40 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                        Resmi makamlar ile anlık kimlik doğrulaması.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Ad</label>
                                        <input
                                            type="text"
                                            value={ad}
                                            onChange={(e) => setAd(toTurkishUpperCase(e.target.value))}
                                            placeholder="AD"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 px-8 text-white focus:outline-none focus:border-radiant-amber/40 uppercase font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Soyad</label>
                                        <input
                                            type="text"
                                            value={soyad}
                                            onChange={(e) => setSoyad(toTurkishUpperCase(e.target.value))}
                                            placeholder="SOYAD"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 px-8 text-white focus:outline-none focus:border-radiant-amber/40 uppercase font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">T.C. Kimlik No</label>
                                        <input
                                            type="text"
                                            maxLength={11}
                                            value={tcNo}
                                            onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ''))}
                                            placeholder="11 HANELİ NO"
                                            className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white focus:outline-none focus:border-radiant-amber/40 font-mono tracking-[0.5em] text-center"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Doğum Yılı</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={dogumYili}
                                            onChange={(e) => setDogumYili(e.target.value.replace(/\D/g, ''))}
                                            placeholder="YYYY"
                                            className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white focus:outline-none focus:border-radiant-amber/40 font-mono tracking-[0.5em] text-center"
                                        />
                                    </div>

                                    <button
                                        onClick={handleIdVerify}
                                        disabled={idVerifying}
                                        className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[28px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3"
                                    >
                                        {idVerifying ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                <span>Kimliğimi Doğrula</span>
                                                <ShieldCheck size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold text-white">Belge Yükleme</h3>
                                    <p className="text-white/40 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                        {profile?.role === 'satici' ? 'Vergi levhası ve imza sirküleri.' : 'Ustalık belgesi ve adli sicil kaydı.'}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="text-radiant-amber" size={20} />
                                                    <span className="text-xs text-white/60 font-medium truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <button onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                                                    <XCircle className="text-red-400" size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <label className="w-full py-12 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-radiant-amber/40 hover:bg-radiant-amber/5 transition-all group">
                                        <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="text-white/20 group-hover:text-radiant-amber transition-colors" size={32} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Dosyaları Sürükle veya Seç</span>
                                    </label>

                                    <button
                                        onClick={submitDocuments}
                                        disabled={uploading || files.length === 0}
                                        className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-[28px] hover:shadow-glow active:scale-[0.98] transition-all duration-500 uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                <span>Başvuruyu Tamamla</span>
                                                <ChevronRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/20 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        İşlemi İptal Et ve Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
}
