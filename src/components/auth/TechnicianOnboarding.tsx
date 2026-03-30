'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    FileText,
    Wrench,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Loader2,
    ShieldCheck,
    AlertCircle,
    Check
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Confetti from '@/components/ui/Confetti';

interface OnboardingData {
    ad: string;
    soyad: string;
    tcKimlikNo: string;
    dogumYili: string;
    expertise: string[];
}

const STEPS = [
    { id: 'identity', title: 'Kimlik Doğrulama', icon: User },
    { id: 'expertise', title: 'Uzmanlık Alanı', icon: Wrench },
    { id: 'documents', title: 'Belge Yükleme', icon: FileText },
];

const EXPERTISE_OPTIONS = [
    'Aydınlatma Montajı',
    'Akıllı Ev Sistemleri',
    'Elektrik Tesisatı',
    'Avize Kurulumu',
    'LED Panel Montajı',
    'Dış Aydınlatma',
    'Güvenlik Kameraları'
];

export default function TechnicianOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        ad: '',
        soyad: '',
        tcKimlikNo: '',
        dogumYili: '',
        expertise: [],
    });

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Initial check for verified status
    useEffect(() => {
        const checkStatus = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_identity_verified, ad, soyad, tc_no, dogum_yili')
                .eq('id', user.id)
                .single();

            if (profile?.is_identity_verified) {
                setVerified(true);
                setData(prev => ({
                    ...prev,
                    ad: profile.ad || '',
                    soyad: profile.soyad || '',
                    tcKimlikNo: profile.tc_no || '',
                    dogumYili: profile.dogum_yili?.toString() || '',
                }));
                // Go to next step if identity is already verified
                setCurrentStep(1);
            }
        };
        checkStatus();
    }, []);

    // Identity Verification (Mernis)
    const handleVerifyIdentity = async () => {
        if (!data.ad || !data.soyad || !data.tcKimlikNo || !data.dogumYili) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tc_no: data.tcKimlikNo,
                    first_name: data.ad,
                    last_name: data.soyad,
                    birth_year: parseInt(data.dogumYili),
                    user_id: user?.id
                })
            });

            const result = await response.json();

            if (result?.success) {
                setVerified(true);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            } else {
                if (result?.error === 'INVALID_IDENTITY') {
                    setError('Bilgileriniz Nüfus Müdürlüğü kayıtlarıyla eşleşmiyor. Lütfen T.C. Kimlik No, Ad, Soyad ve Doğum Yılı bilgilerinizi kontrol edin.');
                } else if (result?.error === 'SERVICE_UNAVAILABLE') {
                    setError('Nüfus Müdürlüğü servisine ulaşılamıyor. Lütfen daha sonra tekrar deneyiniz.');
                } else {
                    setError(result?.message || result?.error || 'Kimlik doğrulaması başarısız oldu.');
                }
            }
        } catch (err) {
            setError('Doğrulama servisi ile bağlantı kurulamadı. Satıcı ve Ustalık işlemleri için kimlik doğrulaması zorunludur.');
        } finally {
            setVerifying(false);
        }
    };

    // Document Upload
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        identity_card: null,
        certificate: null
    });
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

    const handleFileUpload = async (type: string, file: File) => {
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', type.toUpperCase());

            const res = await fetch('/api/craftsman/upload-document', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (result.success) {
                setFiles(prev => ({ ...prev, [type]: file }));
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Dosya yüklenirken hata oluştu.');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const nextStep = () => {
        if (currentStep === 0 && !verified) {
            setError('Devam etmeden önce kimliğinizi doğrulamalısınız.');
            return;
        }
        if (currentStep === 1 && data.expertise.length === 0) {
            setError('Lütfen en az bir uzmanlık alanı seçin.');
            return;
        }
        if (currentStep === 2 && (!files.identity_card || !files.certificate)) {
            setError('Lütfen gerekli tüm belgeleri yükleyin.');
            return;
        }
        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update expertise in technician_stats
            const { error: statsError } = await supabase
                .from('technician_stats')
                .update({ expertise_areas: data.expertise.join(', ') })
                .eq('usta_id', user.id);

            if (statsError) throw statsError;

            // Update profile status to pending for admin approval
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    status: 'pending',
                    verification_status: 'pending',
                    is_verified: false
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/technician');
            }, 2000);
        } catch (err) {
            setError('Başvuru tamamlanırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center glass rounded-3xl border border-white/10 max-w-2xl mx-auto mt-20">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Başvurunuz Alındı!</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                    Tebrikler! Uzman kaydınız başarıyla oluşturuldu. Belgeleriniz admin ekibimiz tarafından incelendikten sonra profiliniz aktif edilecektir.
                </p>
                <div className="flex items-center gap-2 text-radiant-amber text-sm font-bold">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Panele yönlendiriliyorsunuz...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 relative">
            {showConfetti && <Confetti />}
            {/* Wizard Header */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10" />
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStep;
                    const isFullyActive = index === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                                ${isActive ? 'bg-radiant-amber text-cosmic-blue scale-110 shadow-[0_0_20px_rgba(255,191,0,0.3)]' : 'bg-white/5 text-white/30'}
                                ${isFullyActive ? 'ring-4 ring-radiant-amber/20' : ''}
                            `}>
                                <Icon size={20} />
                            </div>
                            <span className={`text-[10px] uppercase font-black tracking-widest ${isActive ? 'text-white' : 'text-white/30'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* Step Content */}
            <div className="glass p-8 rounded-3xl border border-white/10 min-h-[400px] flex flex-col">
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">T.C. Kimlik Doğrulama</h3>
                            <p className="text-white/50 text-sm">Resmi kayıtlarımız için kimlik bilgilerinizi doğrulamanız zorunludur. Doğrulama yapılmadan sonraki adıma geçilemez.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Ad</label>
                                <input
                                    type="text"
                                    placeholder="İSMİNİZ"
                                    value={data.ad}
                                    onChange={(e) => setData({ ...data, ad: e.target.value.toLocaleUpperCase('tr-TR') })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors"
                                    disabled={verified}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Soyad</label>
                                <input
                                    type="text"
                                    placeholder="SOYİSMİNİZ"
                                    value={data.soyad}
                                    onChange={(e) => setData({ ...data, soyad: e.target.value.toLocaleUpperCase('tr-TR') })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors"
                                    disabled={verified}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">T.C. Kimlik No</label>
                                <input
                                    type="text"
                                    maxLength={11}
                                    placeholder="11 HANELİ NO"
                                    value={data.tcKimlikNo}
                                    onChange={(e) => setData({ ...data, tcKimlikNo: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors font-mono tracking-tighter"
                                    disabled={verified}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Doğum Yılı</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="YYYY"
                                    value={data.dogumYili}
                                    onChange={(e) => setData({ ...data, dogumYili: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-radiant-amber/50 transition-colors font-mono tracking-tighter"
                                    disabled={verified}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                onClick={handleVerifyIdentity}
                                disabled={verifying || verified}
                                className={`
                                    flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all
                                    ${verified
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-full justify-center'
                                        : 'bg-radiant-amber text-cosmic-blue hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,191,0,0.3)]'}
                                    disabled:opacity-50
                                `}
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Doğrulanıyor...</span>
                                    </>
                                ) : verified ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>Bilgiler Kaydedildi</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        <span>Bilgileri Doğrula</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Uzmanlık Alanı</h3>
                            <p className="text-white/50 text-sm">Hangi kategorilerde hizmet vermek istiyorsunuz?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {EXPERTISE_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        if (data.expertise.includes(option)) {
                                            setData({ ...data, expertise: data.expertise.filter(e => e !== option) });
                                        } else {
                                            setData({ ...data, expertise: [...data.expertise, option] });
                                        }
                                    }}
                                    className={`
                                        p-4 rounded-xl border transition-all text-sm font-bold text-left
                                        ${data.expertise.includes(option)
                                            ? 'bg-radiant-amber/10 border-radiant-amber text-radiant-amber shadow-[0_0_15px_rgba(255,191,0,0.1)]'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {data.expertise.includes(option) && <CheckCircle2 size={16} />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-radiant-amber/5 border border-radiant-amber/10 rounded-2xl">
                            <div className="flex items-start gap-4 text-radiant-amber">
                                <AlertCircle className="shrink-0 mt-1" size={20} />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold uppercase tracking-tight">Onay Süreci Hakkında</p>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        Seçtiğiniz uzmanlık alanları doğrultusunda yüklediğiniz belgeler kontrol edilir. Onay sonrası bu kategorilerdeki görevleri almaya başlayabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Belge Yükleme</h3>
                            <p className="text-white/50 text-sm">Uzmanlık belgelerinizi ve kimlik fotokopinizi güvenle yükleyin.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['identity_card', 'certificate'].map((type) => (
                                <div key={type} className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">
                                        {type === 'identity_card' ? 'KİMLİK FOTOKOPİSİ' : 'USTALIK BELGESİ / SERTİFİKA'}
                                    </label>
                                    <div
                                        className={`
                                            relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center
                                            ${files[type] ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-radiant-amber/50 hover:bg-white/10'}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(type, file);
                                            }}
                                            disabled={uploading[type]}
                                        />

                                        {uploading[type] ? (
                                            <div className="space-y-2">
                                                <Loader2 size={32} className="text-radiant-amber animate-spin mx-auto" />
                                                <p className="text-xs text-white/50">Yükleniyor...</p>
                                            </div>
                                        ) : files[type] ? (
                                            <div className="space-y-2">
                                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                                    <Check size={24} className="text-emerald-400" />
                                                </div>
                                                <p className="text-xs text-white font-medium truncate max-w-[200px]">
                                                    {files[type]?.name}
                                                </p>
                                                <button className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 mt-2">DEĞİŞTİR</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload size={32} className="text-white/20 mx-auto" />
                                                <p className="text-xs text-white/60">Dosyayı sürükleyin veya <span className="text-radiant-amber">tıklayın</span></p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto pt-10 flex items-center justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0 || loading}
                        className={`
                            flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all
                            ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-white/60 hover:text-white'}
                        `}
                    >
                        <ArrowLeft size={18} />
                        <span>Geri</span>
                    </button>

                    {currentStep === STEPS.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || data.expertise.length === 0}
                            className="bg-emerald-500 text-white px-10 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            <span>Başvuruyu Tamamla</span>
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            className="bg-radiant-amber text-cosmic-blue px-10 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,191,0,0.3)] flex items-center gap-2"
                        >
                            <span>Sonraki Adım</span>
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
