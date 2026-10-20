import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, ShoppingCart, Package, Check } from 'lucide-react';
import { UserRole } from '../../types';

export const SwitchUserModal: React.FC = () => {
  const { allUsers, currentUser, setCurrentUser, isSwitchUserModalOpen, setIsSwitchUserModalOpen, setActiveTab } = useApp();

  if (!isSwitchUserModalOpen) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Pemilik (Owner) - Hak Akses Penuh
          </span>
        );
      case 'cashier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Kasir (POS) - Transaksi & Struk
          </span>
        );
      case 'warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Staf Gudang - Kelola Stok & Opname
          </span>
        );
    }
  };

  const handleSelectUser = (user: typeof allUsers[0]) => {
    setCurrentUser(user);
    // If cashier, jump straight to POS
    if (user.role === 'cashier') {
      setActiveTab('pos');
    } else if (user.role === 'warehouse') {
      setActiveTab('inventory');
    }
    setIsSwitchUserModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Ganti Pengguna & Hak Akses</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pilih akun staf untuk menguji pembagian hak akses (RBAC)</p>
          </div>
          <button
            onClick={() => setIsSwitchUserModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User list */}
        <div className="p-5 space-y-3">
          {allUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                      {isCurrent && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  {isCurrent ? (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition">
                      Pilih
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sistem Role-Based Access Control (RBAC) menyembunyikan menu sensitif seperti laporan laba dan pengaturan bila sedang login sebagai Kasir atau Gudang.
          </p>
        </div>
      </div>
    </div>
  );
};
