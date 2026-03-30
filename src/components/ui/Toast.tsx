"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
    const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
    const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);
    const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const icons: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/40 bg-red-500/10 text-red-400',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    warning: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const Icon = icons[t.type];

    useEffect(() => {
        const timer = setTimeout(() => onRemove(t.id), t.duration ?? 4000);
        return () => clearTimeout(timer);
    }, [t, onRemove]);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-md shadow-xl
                min-w-[280px] max-w-sm ${styles[t.type]}`}
            style={{
                background: 'rgba(10,25,47,0.85)',
                animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
        >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-white/90 leading-relaxed flex-1">{t.message}</p>
            <button
                onClick={() => onRemove(t.id)}
                className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
            >
                <X size={13} />
            </button>
        </div>
    );
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 items-end">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onRemove={onRemove} />
            ))}
            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(20px) scale(0.95); }
                    to   { opacity: 1; transform: translateX(0)     scale(1); }
                }
            `}</style>
        </div>
    );
}
