import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Settings,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, lowStockProducts, setIsSwitchUserModalOpen } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dasbor Finansial',
      icon: LayoutDashboard,
      allowedRoles: ['owner'] as UserRole[],
      badge: null,
    },
    {
      id: 'pos',
      label: 'Kasir (POS)',
      icon: ShoppingCart,
      allowedRoles: ['owner', 'cashier'] as UserRole[],
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Stok & Gudang',
      icon: Package,
      allowedRoles: ['owner', 'warehouse'] as UserRole[],
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} menipis` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'reports',
      label: 'Laporan Penjualan',
      icon: FileText,
      allowedRoles: ['owner', 'cashier'] as UserRole[],
      badge: null,
    },
    {
      id: 'users',
      label: 'Hak Akses Staf',
      icon: Users,
      allowedRoles: ['owner'] as UserRole[],
      badge: null,
    },
    {
      id: 'settings',
      label: 'Pengaturan Toko',
      icon: Settings,
      allowedRoles: ['owner'] as UserRole[],
      badge: null,
    },
  ];

  // Filter items based on logged in user's role
  const accessibleItems = navItems.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>

        {accessibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Info & Quick Switch Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Peran Aktif
            </span>
            <span className="text-xs font-bold text-slate-800 capitalize">
              {currentUser.role === 'owner'
                ? '👑 Pemilik Toko'
                : currentUser.role === 'cashier'
                ? '🛒 Kasir POS'
                : '📦 Staf Gudang'}
            </span>
          </div>

          <button
            onClick={() => setIsSwitchUserModalOpen(true)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Ganti Pengguna / Role"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
          {currentUser.role === 'owner'
            ? 'Akses penuh ke laporan laba, keuangan, dan data gudang.'
            : currentUser.role === 'cashier'
            ? 'Akses khusus transaksi penjualan dan cetak struk kasir.'
            : 'Akses khusus mutasi stok, restock, dan opname barang.'}
        </p>
      </div>
    </aside>
  );
};
