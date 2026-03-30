import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center text-slate-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/10 p-4 rounded-full">
                        <ShieldAlert className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Erişim Reddedildi</h1>
                <p className="text-slate-400 mb-8">
                    Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır.
                    Lütfen hesabınızın yetkilerini kontrol edin veya doğru hesapla giriş yapın.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
