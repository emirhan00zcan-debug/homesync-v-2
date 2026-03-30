import React from 'react';
import { UserCircle, Crown, Store, Users, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const RoleBadge = ({ role }: { role: string }) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
        super_admin: { label: 'Süper Admin', color: '#FFBF00', bg: 'rgba(255,191,0,0.1)' },
        admin: { label: 'Admin', color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
        vendor: { label: 'Satıcı', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
        user: { label: 'Müşteri', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
        usta: { label: 'Usta', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    };
    const s = map[role] || { label: role, color: '#ffffff', bg: 'rgba(255,255,255,0.05)' };
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ color: s.color, background: s.bg }}>
            {s.label}
        </span>
    );
};

const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'super_admin') return <Crown size={16} className="text-yellow-400" />;
    if (role === 'vendor') return <Store size={16} className="text-blue-400" />;
    if (role === 'admin') return <UserCircle size={16} className="text-pink-400" />;
    return <Users size={16} className="text-green-400" />;
};

export default async function SuperAdminUsersPage() {
    const supabase = createClient();

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, vendor_status, updated_at')
        .order('updated_at', { ascending: false });

    if (error) console.error('Error fetching users:', error);

    const users = profiles || [];
    const counts = {
        super_admin: users.filter(u => u.role === 'super_admin').length,
        admin: users.filter(u => u.role === 'admin').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        user: users.filter(u => u.role === 'user').length,
        usta: users.filter(u => u.role === 'usta').length,
    };

    return (
        <div className="space-y-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: '#FFBF00' }}>Süper Admin</p>
                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <UserCircle className="text-purple-400" size={32} />
                    Kullanıcı Yönetimi
                </h1>
                <p className="text-white/50 text-sm mt-1">Tüm platform üyelerini rollerine göre görüntüle</p>
            </div>

            {/* Role summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                    { label: 'Süper Admin', count: counts.super_admin, color: '#FFBF00', icon: Crown },
                    { label: 'Admin', count: counts.admin, color: '#f472b6', icon: UserCircle },
                    { label: 'Satıcı', count: counts.vendor, color: '#60a5fa', icon: Store },
                    { label: 'Müşteri', count: counts.user, color: '#34d399', icon: Users },
                    { label: 'Usta', count: counts.usta, color: '#a78bfa', icon: Package },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="p-4 rounded-2xl border border-white/10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <Icon size={18} style={{ color: item.color }} className="mx-auto mb-2" />
                            <p className="text-xl font-black text-white">{item.count}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Kullanıcı</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Email</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Rol</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Kayıt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-white/30 font-medium">
                                        Kayıtlı kullanıcı bulunamadı
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white/60 shrink-0"
                                                style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <RoleIcon role={u.role} />
                                            </div>
                                            <span className="font-semibold text-white text-sm">{u.full_name || 'İsimsiz'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/50 text-sm">{u.email}</td>
                                    <td className="p-4"><RoleBadge role={u.role} /></td>
                                    <td className="p-4 text-white/40 text-xs">
                                        {u.updated_at ? new Date(u.updated_at).toLocaleDateString('tr-TR') : '—'}
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
