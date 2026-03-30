import React from 'react';
import { Users, MoreVertical, Search, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminVendorsPage() {
    const supabase = createClient();

    // We will assume a 'profiles' table exists that mirrors auth.users for public querying
    const { data: vendors, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'VENDOR');

    if (error) {
        console.error("Error fetching vendors:", error);
    }

    const safeVendors = vendors || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 placeholder-content">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
                        <Users className="text-radiant-amber" /> Satıcı Yönetimi
                    </h1>
                    <p className="text-white/60">Platformdaki tüm satıcı hesaplarını ve durumlarını görüntüleyin.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Satıcı ara..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-radiant-amber/50 transition-colors"
                        />
                    </div>
                    <button className="bg-radiant-amber text-cosmic-blue font-bold px-6 py-2.5 rounded-xl text-sm whitespace-nowrap hover:scale-105 transition-transform shadow-glow">
                        Satıcı Ekle
                    </button>
                </div>
            </div>

            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">ID</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Satıcı Adı</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Email</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Durum</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Ürünler</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Puan</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {safeVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-white/40 font-medium">Kayıtlı satıcı bulunamadı.</td>
                                </tr>
                            ) : safeVendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono text-white/40 text-xs">{vendor.id}</td>
                                    <td className="p-4 font-bold text-white">{vendor.name}</td>
                                    <td className="p-4 text-white/60 text-sm">{vendor.email}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${vendor.status === 'ACTIVE' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                                            vendor.status === 'PENDING' ? 'bg-radiant-amber/10 text-radiant-amber border border-radiant-amber/20' :
                                                'bg-red-400/10 text-red-400 border border-red-400/20'
                                            }`}>
                                            {vendor.status === 'ACTIVE' && <CheckCircle size={10} />}
                                            {vendor.status === 'SUSPENDED' && <XCircle size={10} />}
                                            {vendor.status === 'PENDING' && <div className="w-2 h-2 rounded-full bg-radiant-amber animate-pulse" />}
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-white/80 font-medium">{vendor.products}</td>
                                    <td className="p-4 text-center text-radiant-amber font-bold">{vendor.rating > 0 ? vendor.rating : '-'}</td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
