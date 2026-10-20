import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Sparkles,
  Zap,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { formatRupiah, formatNumber, formatDateIndo } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    transactions,
    products,
    lowStockProducts,
    setActiveTab,
    simulateExternalSale,
    setLastReceipt,
    setIsReceiptModalOpen,
    setIsLowStockDrawerOpen,
  } = useApp();

  // Metrics calculation
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayDateStr = now.toISOString().slice(0, 10);

    let todayRevenue = 0;
    let todayProfit = 0;
    let todayOrdersCount = 0;

    let monthlyRevenue = 0;
    let monthlyProfit = 0;
    let monthlyOrdersCount = 0;

    let totalRevenueAllTime = 0;
    let totalProfitAllTime = 0;

    const paymentCounts: Record<string, number> = { cash: 0, qris: 0, debit: 0, transfer: 0 };
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number; category: string }> = {};

    transactions.forEach((tx) => {
      totalRevenueAllTime += tx.total;
      totalProfitAllTime += tx.grossProfit;

      const txDate = new Date(tx.timestamp);
      const isThisMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const isToday = tx.timestamp.startsWith(todayDateStr);

      if (isToday) {
        todayRevenue += tx.total;
        todayProfit += tx.grossProfit;
        todayOrdersCount++;
      }

      if (isThisMonth) {
        monthlyRevenue += tx.total;
        monthlyProfit += tx.grossProfit;
        monthlyOrdersCount++;
      }

      paymentCounts[tx.paymentMethod] = (paymentCounts[tx.paymentMethod] || 0) + tx.total;

      tx.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.name,
            qty: 0,
            revenue: 0,
            category: item.category,
          };
        }
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const avgBasketSize = monthlyOrdersCount > 0 ? Math.round(monthlyRevenue / monthlyOrdersCount) : 0;

    return {
      todayRevenue,
      todayProfit,
      todayOrdersCount,
      monthlyRevenue,
      monthlyProfit,
      monthlyOrdersCount,
      totalRevenueAllTime,
      totalProfitAllTime,
      avgBasketSize,
      paymentCounts,
      topProducts,
    };
  }, [transactions]);

  // Monthly Revenue Chart data for 12 Months
  const monthlyChartData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Baseline historical revenue pattern + real-time transactions addition
    const baseline = [
      12500000, 14200000, 16800000, 19500000, 22000000, 21400000,
      24500000, 26000000, 28500000, 0, 0, 0
    ];

    // Compute actual current month revenue from transactions
    let currentMonthReal = 0;
    transactions.forEach((tx) => {
      const d = new Date(tx.timestamp);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex) {
        currentMonthReal += tx.total;
      }
    });

    baseline[currentMonthIndex] = currentMonthReal + 31200000; // Realistic demo scale baseline + current real transactions

    const maxVal = Math.max(...baseline, 1000000);

    return months.map((monthName, idx) => ({
      month: monthName,
      revenue: baseline[idx],
      isCurrent: idx === currentMonthIndex,
      percentage: Math.round((baseline[idx] / maxVal) * 100),
    }));
  }, [transactions]);

  const handleOpenReceipt = (tx: typeof transactions[0]) => {
    setLastReceipt(tx);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Header & Simulation Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dasbor Pemilik Toko (Executive Dashboard)
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus kas, laba penjualan kasir POS, dan status gudang secara langsung
          </p>
        </div>

        {/* Live Multi-Device Simulation Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={simulateExternalSale}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            title="Simulasikan penjualan kasir di cabang lain untuk melihat grafik dan stok terpotong otomatis"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Simulasi Transaksi Kasir Lain
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Peringatan: {lowStockProducts.length} Produk Persediaan Menipis!
              </h3>
              <p className="text-xs text-white/90 mt-0.5">
                Stok barang telah mencapai atau di bawah batas minimum gudang. Segera lakukan restock agar penjualan kasir tidak terganggu.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLowStockDrawerOpen(true)}
            className="px-3.5 py-2 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs whitespace-nowrap transition cursor-pointer"
          >
            Lihat & Restock
          </button>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pendapatan Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(metrics.todayRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {metrics.todayOrdersCount} Transaksi
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">POS Aktif</span>
          </div>
        </div>

        {/* Card 2: Monthly Revenue (Live updated) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Omzet Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(metrics.monthlyRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14.8%
            </span>
            <span className="text-slate-500">dibanding bulan lalu</span>
          </div>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Estimasi Laba Kotor</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-violet-700 font-mono">
            {formatRupiah(metrics.monthlyProfit)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Margin Keuntungan:</span>
            <span className="font-bold text-violet-600">
              {metrics.monthlyRevenue > 0
                ? `${Math.round((metrics.monthlyProfit / metrics.monthlyRevenue) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Card 4: Average Basket Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Rata-rata Nilai Belanja</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(metrics.avgBasketSize)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <span>Basket Size per Pelanggan</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 12-Month Revenue Graph & Payment Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): 12-Month Revenue Graph */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Grafik Pertumbuhan Pendapatan Bulanan
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Update Otomatis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai omzet otomatis bertambah seketika kasir menyelesaikan transaksi POS
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Tahun {new Date().getFullYear()}
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-64 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-200">
            {monthlyChartData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-lg pointer-events-none z-10 font-mono">
                  {formatRupiah(item.revenue)}
                </div>

                {/* Animated Bar */}
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                    item.isCurrent
                      ? 'bg-gradient-to-t from-indigo-600 to-violet-500 shadow-md ring-2 ring-indigo-300'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  style={{ height: `${Math.max(10, item.percentage)}%` }}
                />

                <span
                  className={`text-[11px] font-bold mt-2 ${
                    item.isCurrent ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span>
                Bulan Ini (Aktif)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block"></span>
                Bulan Sebelumnya
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Skala Rupiah dinamis</span>
          </div>
        </div>

        {/* Right (1 Col): Payment Method Distribution & Top Products */}
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Metode Pembayaran Pelanggan
            </h3>
            <p className="text-xs text-slate-500 mb-4">Pilihan transaksi di kasir</p>

            <div className="space-y-3">
              {/* QRIS */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <QrCode className="w-3.5 h-3.5 text-red-600" />
                    QRIS Dinamis
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatRupiah(metrics.paymentCounts.qris || 0)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        metrics.monthlyRevenue > 0
                          ? Math.round(((metrics.paymentCounts.qris || 0) / metrics.monthlyRevenue) * 100)
                          : 50
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Cash */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Uang Tunai (Cash)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatRupiah(metrics.paymentCounts.cash || 0)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${
                        metrics.monthlyRevenue > 0
                          ? Math.round(((metrics.paymentCounts.cash || 0) / metrics.monthlyRevenue) * 100)
                          : 40
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Debit */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    Kartu Debit / EDC
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatRupiah(metrics.paymentCounts.debit || 0)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{
                      width: `${
                        metrics.monthlyRevenue > 0
                          ? Math.round(((metrics.paymentCounts.debit || 0) / metrics.monthlyRevenue) * 100)
                          : 10
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Top 5 Produk Terlaris</h3>
            <p className="text-xs text-slate-500 mb-3">Berdasarkan volume penjualan di kasir</p>

            <div className="space-y-2.5">
              {metrics.topProducts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono">{item.qty} Terjual</span>
                    <span className="text-[10px] text-slate-400 block">{formatRupiah(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cashier Transactions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Aktivitas Penjualan Kasir Terbaru</h3>
            <p className="text-xs text-slate-500">Struk transaksi terkini yang telah memotong stok gudang</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Lihat Semua Laporan <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Kasir</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3">Total Belanja</th>
                <th className="py-2.5 px-3 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                    {tx.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDateIndo(tx.timestamp)}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{tx.cashierName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tx.customerName || '-'}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        tx.paymentMethod === 'qris'
                          ? 'bg-red-100 text-red-800'
                          : tx.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {formatRupiah(tx.total)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleOpenReceipt(tx)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Cetak Ulang Struk"
                    >
                      <Printer className="w-3.5 h-3.5" />
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
};
