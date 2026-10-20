import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings } from 'lucide-react';
import { UserRole } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: LayoutDashboard,
      roles: ['owner'] as UserRole[],
    },
    {
      id: 'pos',
      label: 'Kasir',
      icon: ShoppingCart,
      roles: ['owner', 'cashier'] as UserRole[],
    },
    {
      id: 'inventory',
      label: 'Gudang',
      icon: Package,
      roles: ['owner', 'warehouse'] as UserRole[],
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: FileText,
      roles: ['owner', 'cashier'] as UserRole[],
    },
    {
      id: 'settings',
      label: 'Setting',
      icon: Settings,
      roles: ['owner'] as UserRole[],
    },
  ];

  const allowed = navItems.filter((i) => i.roles.includes(currentUser.role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg">
      {allowed.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
