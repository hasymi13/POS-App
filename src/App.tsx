/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/users/UserManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/receipt/ReceiptModal';
import { LowStockDrawer } from './components/notifications/LowStockDrawer';
import { SwitchUserModal } from './components/users/SwitchUserModal';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, setActiveTab } = useApp();

  // Guard: if user role doesn't have access to current activeTab, redirect safely
  useEffect(() => {
    if (currentUser.role === 'cashier' && (activeTab === 'dashboard' || activeTab === 'settings' || activeTab === 'users')) {
      setActiveTab('pos');
    } else if (currentUser.role === 'warehouse' && (activeTab === 'dashboard' || activeTab === 'pos' || activeTab === 'reports' || activeTab === 'settings' || activeTab === 'users')) {
      setActiveTab('inventory');
    }
  }, [currentUser.role, activeTab, setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace with Sidebar and Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global Modals & Drawers */}
      <ReceiptModal />
      <LowStockDrawer />
      <SwitchUserModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
