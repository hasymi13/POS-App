import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Bell,
  RefreshCw,
  UserCircle2,
  ShieldCheck,
  ShoppingCart,
  Package,
  Sparkles,
  Zap,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    settings,
    currentUser,
    lowStockProducts,
    setIsLowStockDrawerOpen,
    setIsSwitchUserModalOpen,
    syncNotification,
    lastSyncTime,
    simulateExternalSale,
  } = useApp();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'cashier':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warehouse':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'Pemilik (Owner)';
      case 'cashier':
        return 'Kasir (POS)';
      case 'warehouse':
        return 'Staf Gudang';
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Store Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                {settings.storeName}
              </h1>
              <span className="hidden md:inline-flex text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                POS & WAREHOUSE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
              Sistem Kasir & Persediaan Terintegrasi Real-Time
            </p>
          </div>
        </div>

        {/* Right: Actions, Sync indicator, Low stock alert, Current user */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Sync Status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sinkron Real-Time</span>
          </div>

          {/* Quick Simulation Button for Demo */}
          <button
            onClick={simulateExternalSale}
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
            title="Klik untuk memicu simulasi transaksi dari kasir cabang lain"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Tes Sinkronisasi</span>
          </button>

          {/* Low Stock Notification Bell */}
          <button
            onClick={() => setIsLowStockDrawerOpen(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Notifikasi Stok Rendah"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-xs animate-bounce">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {/* User Profile & Quick Switch Modal Button */}
          <button
            onClick={() => setIsSwitchUserModalOpen(true)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition text-left cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                {getRoleIcon(currentUser.role)}
                <span>{getRoleLabel(currentUser.role)}</span>
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Floating Animated Sync Notification Toast */}
      {syncNotification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs border border-slate-800 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="font-semibold">{syncNotification}</span>
          </div>
        </div>
      )}
    </>
  );
};
