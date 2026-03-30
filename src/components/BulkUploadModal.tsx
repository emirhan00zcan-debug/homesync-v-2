"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProductRow {
    isim: string;
    aciklama?: string;
    fiyat: string;
    stok_adedi: string;
    kategori: string;
    gorsel_url?: string;
}

interface InvalidRow {
    row: number;
    data: ProductRow;
    errors: string[];
}

interface PreviewResult {
    totalRows: number;
    validCount: number;
    invalidCount: number;
    invalidRows: InvalidRow[];
    sample: ProductRow[];
}

interface BulkUploadModalProps {
    onClose: () => void;
    onSuccess: (count: number) => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'done';

export default function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
    const [step, setStep] = useState<Step>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
    const [preview, setPreview] = useState<PreviewResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sendPreview = async (rows: Record<string, string>[]) => {
        setStep('preview');
        try {
            const res = await fetch('/api/vendor/bulk-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows, dryRun: true }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Önizleme hatası'); return; }
            setPreview(data);
        } catch {
            setError('Sunucuya bağlanılamadı.');
        }
    };

    const parseFile = useCallback((file: File) => {
        setError('');
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
                    defval: '',
                    raw: false,
                });

                if (rows.length === 0) {
                    setError('Dosya boş veya okunamıyor. Lütfen şablonu kullanın.');
                    return;
                }
                if (rows.length > 500) {
                    setError('Tek seferde en fazla 500 satır yüklenebilir.');
                    return;
                }

                setParsedRows(rows);
                setFileName(file.name);
                sendPreview(rows);
            } catch {
                setError('Dosya okunurken hata oluştu. Lütfen .xlsx veya .csv formatı kullanın.');
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleImport = async () => {
        if (!preview || preview.validCount === 0) return;
        setStep('importing');
        try {
            const res = await fetch('/api/vendor/bulk-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: parsedRows, dryRun: false }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'İçe aktarma hatası'); setStep('preview'); return; }
            setImportedCount(data.inserted);
            setStep('done');
            onSuccess(data.inserted);
        } catch {
            setError('Sunucuya bağlanılamadı.');
            setStep('preview');
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) parseFile(file);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-2xl rounded-[28px] border border-white/10 overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0d1f36 0%, #0A192F 100%)',
                        boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                                <FileSpreadsheet size={18} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-lg tracking-tight">Toplu Ürün Yükleme</h2>
                                <p className="text-white/30 text-xs">Excel veya CSV ile ürünleri içe aktarın</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/30 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Step 1: Upload */}
                        {step === 'upload' && (
                            <div className="space-y-5">
                                {/* Download template */}
                                <a
                                    href="/bulk-upload-template.csv"
                                    download
                                    className="flex items-center gap-3 p-4 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                                    style={{ background: 'rgba(59,130,246,0.05)' }}
                                >
                                    <Download size={16} className="text-blue-400 group-hover:text-blue-300" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-400 group-hover:text-blue-300">Şablonu İndir</p>
                                        <p className="text-[11px] text-white/30">Sütun başlıklarıyla örnek CSV dosyası</p>
                                    </div>
                                </a>

                                {/* Drop zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={onDrop}
                                    className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging
                                        ? 'border-blue-500/70 bg-blue-500/5'
                                        : 'border-white/10 hover:border-white/25 hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <motion.div
                                        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{ background: isDragging ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)' }}
                                    >
                                        <Upload size={24} className={isDragging ? 'text-blue-400' : 'text-white/30'} />
                                    </motion.div>
                                    <div className="text-center">
                                        <p className="text-white/70 font-semibold text-sm">Dosyayı buraya sürükleyin</p>
                                        <p className="text-white/25 text-xs mt-1">veya tıklayarak seçin &mdash; .xlsx, .csv desteklenir</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                                        <AlertTriangle size={16} className="text-red-400 shrink-0" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Preview */}
                        {step === 'preview' && (
                            <div className="space-y-5">
                                {!preview ? (
                                    <div className="py-16 flex flex-col items-center gap-3">
                                        <Loader2 size={28} className="text-blue-400 animate-spin" />
                                        <p className="text-white/40 text-sm font-semibold">Dosya analiz ediliyor…</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* File name */}
                                        <div className="flex items-center gap-2 text-xs text-white/30">
                                            <FileSpreadsheet size={14} />
                                            <span>{fileName}</span>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Toplam Satır', value: preview.totalRows, color: 'text-white' },
                                                { label: 'Geçerli', value: preview.validCount, color: 'text-green-400' },
                                                { label: 'Hatalı', value: preview.invalidCount, color: preview.invalidCount > 0 ? 'text-red-400' : 'text-white/30' },
                                            ].map(s => (
                                                <div key={s.label} className="p-4 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                                    <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Error rows accordion */}
                                        {preview.invalidCount > 0 && (
                                            <div className="rounded-2xl border border-red-500/15 overflow-hidden">
                                                <button
                                                    onClick={() => setShowErrors(!showErrors)}
                                                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-red-400 font-semibold hover:bg-red-500/5 transition-all"
                                                >
                                                    <span>{preview.invalidCount} hatalı satırı gör</span>
                                                    {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                                <AnimatePresence>
                                                    {showErrors && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="max-h-48 overflow-y-auto border-t border-red-500/10">
                                                                {preview.invalidRows.map((inv) => (
                                                                    <div key={inv.row} className="px-4 py-3 border-b border-red-500/5 last:border-0">
                                                                        <p className="text-xs font-bold text-red-400/80">Satır {inv.row}: {inv.data.isim || '(isim yok)'}</p>
                                                                        <ul className="mt-1 space-y-0.5">
                                                                            {inv.errors.map((err, i) => (
                                                                                <li key={i} className="text-[11px] text-red-400/50">• {err}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Preview sample */}
                                        {preview.sample.length > 0 && (
                                            <div>
                                                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">İlk {preview.sample.length} Geçerli Ürün</p>
                                                <div className="rounded-2xl border border-white/5 overflow-hidden">
                                                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                                                        <span>İsim</span><span>Fiyat</span><span>Stok</span><span>Kategori</span>
                                                    </div>
                                                    {preview.sample.map((row, i) => (
                                                        <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/[0.03] last:border-0 text-sm">
                                                            <p className="text-white/80 truncate font-medium">{String(row.isim)}</p>
                                                            <p className="text-radiant-amber font-bold">{String(row.fiyat)} ₺</p>
                                                            <p className="text-white/60">{String(row.stok_adedi)}</p>
                                                            <p className="text-white/40 truncate">{String(row.kategori)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                                <p className="text-red-400 text-sm">{error}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => { setStep('upload'); setParsedRows([]); setPreview(null); setError(''); }}
                                                className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-sm font-semibold transition-all"
                                            >
                                                Yeni Dosya Seç
                                            </button>
                                            <button
                                                onClick={handleImport}
                                                disabled={preview.validCount === 0}
                                                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-30"
                                                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                                            >
                                                {preview.validCount} Ürünü İçe Aktar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Importing */}
                        {step === 'importing' && (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 size={36} className="text-blue-400 animate-spin" />
                                <p className="text-white/70 font-semibold">Ürünler yükleniyor…</p>
                                <p className="text-white/30 text-sm">Lütfen bekleyin, sayfayı kapatmayın.</p>
                            </div>
                        )}

                        {/* Step 4: Done */}
                        {step === 'done' && (
                            <div className="py-16 flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                    className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
                                >
                                    <CheckCircle size={30} className="text-green-400" />
                                </motion.div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{importedCount} Ürün Yüklendi!</p>
                                    <p className="text-white/40 text-sm mt-1">Ürünler onay kuyruğuna eklendi.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-8 py-3 rounded-2xl text-white font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                                >
                                    Kapat
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
