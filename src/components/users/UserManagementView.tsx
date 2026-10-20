import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit,
  ShoppingCart,
  Package,
  Check,
  X,
  Phone,
  UserCircle,
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { allUsers, currentUser, addUser, updateUser, setIsSwitchUserModalOpen } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [pin, setPin] = useState('1234');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      alert('Nama dan Username harus diisi');
      return;
    }

    addUser({
      name,
      username: username.toLowerCase().replace(/\s+/g, ''),
      role,
      pin,
      phone,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      active: true,
    });

    setIsAddModalOpen(false);
    setName('');
    setUsername('');
    setPhone('');
  };

  const permissionsMatrix = [
    {
      feature: 'Dasbor Finansial & Omzet Bulanan',
      owner: true,
      cashier: false,
      warehouse: false,
    },
    {
      feature: 'Transaksi Kasir POS & Pembayaran',
      owner: true,
      cashier: true,
      warehouse: false,
    },
    {
      feature: 'Cetak Struk Thermal & Digital',
      owner: true,
      cashier: true,
      warehouse: false,
    },
    {
      feature: 'Lihat Master Stok Gudang',
      owner: true,
      cashier: true,
      warehouse: true,
    },
    {
      feature: 'Tambah / Ubah Produk Gudang',
      owner: true,
      cashier: false,
      warehouse: true,
    },
    {
      feature: 'Restock Penerimaan Barang & Mutasi',
      owner: true,
      cashier: false,
      warehouse: true,
    },
    {
      feature: 'Lihat Harga Modal (HPP) & Margin Laba',
      owner: true,
      cashier: false,
      warehouse: true,
    },
    {
      feature: 'Laporan Laba Rugi & Ekspor Excel',
      owner: true,
      cashier: false,
      warehouse: false,
    },
    {
      feature: 'Manajemen Hak Akses & Akun Staf',
      owner: true,
      cashier: false,
      warehouse: false,
    },
    {
      feature: 'Pengaturan Identitas Toko & Pajak',
      owner: true,
      cashier: false,
      warehouse: false,
    },
  ];

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Pemilik (Owner)
          </span>
        );
      case 'cashier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Kasir (POS)
          </span>
        );
      case 'warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Staf Gudang
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Akses & Staf Toko (RBAC)
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Role-Based Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur wewenang dan batasan akses modul untuk Pemilik Toko, Kasir, dan Staf Gudang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSwitchUserModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <UserCircle className="w-4 h-4 text-indigo-600" />
            Ganti Akun Pengujian
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Staf Baru
          </button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allUsers.map((user) => {
          const isCurrent = user.id === currentUser.id;
          return (
            <div
              key={user.id}
              className={`bg-white p-5 rounded-2xl border transition shadow-2xs relative flex flex-col justify-between ${
                isCurrent ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SEDANG AKTIF
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                </div>

                <div className="mb-4">{getRoleBadge(user.role)}</div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">PIN Masuk:</span>
                    <span className="font-mono font-bold">••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Telp / WA:</span>
                    <span className="font-mono">{user.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Akun:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-[11px] text-slate-400">ID: {user.id}</span>
                <button
                  onClick={() => setIsSwitchUserModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Ganti ke Akun Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role & Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Matriks Wewenang & Hak Akses (RBAC)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar izin operasional berdasarkan peran untuk mencegah kesalahan kasir dan kebocoran data laba
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fitur / Hak Akses Modul</th>
                <th className="py-3 px-4 text-center">👑 Pemilik (Owner)</th>
                <th className="py-3 px-4 text-center">🛒 Kasir (POS)</th>
                <th className="py-3 px-4 text-center">📦 Staf Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {item.owner ? (
                      <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.cashier ? (
                      <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.warehouse ? (
                      <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center mx-auto">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Staf Toko Baru</h3>
                  <p className="text-xs text-slate-500">Buat akun untuk kasir atau staf gudang</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Hidayat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="kasir2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PIN (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Peran (Role Akses)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="cashier">Kasir (POS) - Hanya Transaksi & Cetak Struk</option>
                  <option value="warehouse">Staf Gudang - Kelola Stok, Restock, Opname</option>
                  <option value="owner">Pemilik Toko (Owner) - Akses Penuh Semua Modul</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telp</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
