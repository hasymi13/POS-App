import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatNumber } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../utils/export';
import { Transaction } from '../../types';

export const ReportsView: React.FC = () => {
  const { transactions, setLastReceipt, setIsReceiptModalOpen, currentUser, settings } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);

      // Date match
      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = tx.timestamp.startsWith(todayStr);
      } else if (dateFilter === 'week') {
        matchDate = txDate >= startOfWeek;
      } else if (dateFilter === 'month') {
        matchDate = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      }

      // Payment match
      const matchPayment = paymentFilter === 'all' || tx.paymentMethod === paymentFilter;

      // Search match
      const matchSearch =
        tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.qrisRef && tx.qrisRef.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchDate && matchPayment && matchSearch;
    });
  }, [transactions, dateFilter, paymentFilter, searchQuery]);

  // Aggregate stats
  const totals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    let discount = 0;
    let tax = 0;

    filteredTransactions.forEach((tx) => {
      revenue += tx.total;
      cost += tx.totalCost;
      profit += tx.grossProfit;
      discount += tx.discountTotal;
      tax += tx.taxAmount;
    });

    const marginPercent = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    return {
      revenue,
      cost,
      profit,
      discount,
      tax,
      count: filteredTransactions.length,
      marginPercent,
    };
  }, [filteredTransactions]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setLastReceipt(tx);
    setIsReceiptModalOpen(true);
  };

  const isOwner = currentUser.role === 'owner';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Header and Export Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Penjualan & Laba Rugi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekap transaksi kasir, analisis omzet, dan ekspor laporan ke format Excel & PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel (CSV) */}
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel (CSV)
          </button>

          {/* Export to PDF (Print styled report) */}
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(totals.revenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dari {totals.count} transaksi kasir
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total HPP (Modal Barang)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono">
            {isOwner ? formatRupiah(totals.cost) : '***'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Harga pokok persediaan terjual
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
            {isOwner ? formatRupiah(totals.profit) : '***'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Margin Keuntungan: {isOwner ? `${totals.marginPercent}%` : '***'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Diskon & Promo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono">
            {formatRupiah(totals.discount)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Potongan belanja pelanggan
          </span>
        </div>
      </div>

      {/* Filter and Date Period Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No Invoice, Kasir, atau Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition"
          />
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              dateFilter === 'today'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              dateFilter === 'week'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              dateFilter === 'month'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              dateFilter === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Payment Method Filter */}
        <div className="sm:w-44">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS Dinamis</option>
            <option value="debit">Kartu Debit</option>
          </select>
        </div>
      </div>

      {/* Main Transactions Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-center">Jumlah Item</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Total Penjualan</th>
                {isOwner && <th className="py-3 px-4">Laba Kotor</th>}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    {tx.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {formatDateIndo(tx.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{tx.cashierName}</td>
                  <td className="py-3 px-4 text-slate-600">{tx.customerName || '-'}</td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-center font-mono">
                    {tx.items.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {formatRupiah(tx.subtotal)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {formatRupiah(tx.total)}
                  </td>
                  {isOwner && (
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      +{formatRupiah(tx.grossProfit)}
                    </td>
                  )}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenReceipt(tx)}
                        title="Buka / Cetak Struk"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-sm text-slate-600">Tidak ada data transaksi</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter rentang tanggal atau kata kunci</p>
          </div>
        )}
      </div>

      {/* HIDDEN PRINTABLE CONTAINER FOR PDF REPORT */}
      <div id="printable-report-area" className="hidden">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{settings.storeName}</h1>
          <p className="text-sm">{settings.address} | Telp: {settings.phone}</p>
          <h2 className="text-lg font-bold mt-2 uppercase">Laporan Keuangan & Penjualan Kasir (POS)</h2>
          <p className="text-xs text-gray-500">
            Dicetak pada: {formatDateIndo(new Date().toISOString())} oleh {currentUser.name}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="border p-3 rounded">
            <span className="block text-gray-600">Total Omzet Penjualan:</span>
            <span className="text-lg font-bold">{formatRupiah(totals.revenue)}</span>
          </div>
          <div className="border p-3 rounded">
            <span className="block text-gray-600">Total Modal (HPP):</span>
            <span className="text-lg font-bold">{formatRupiah(totals.cost)}</span>
          </div>
          <div className="border p-3 rounded">
            <span className="block text-gray-600">Laba Bersih/Kotor:</span>
            <span className="text-lg font-bold text-green-700">{formatRupiah(totals.profit)}</span>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-2">No Invoice</th>
              <th className="py-2 px-2">Tanggal</th>
              <th className="py-2 px-2">Kasir</th>
              <th className="py-2 px-2">Metode</th>
              <th className="py-2 px-2 text-right">Total (Rp)</th>
              <th className="py-2 px-2 text-right">Laba (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-1.5 px-2 font-mono">{tx.invoiceNumber}</td>
                <td className="py-1.5 px-2">{formatDateIndo(tx.timestamp)}</td>
                <td className="py-1.5 px-2">{tx.cashierName}</td>
                <td className="py-1.5 px-2 uppercase">{tx.paymentMethod}</td>
                <td className="py-1.5 px-2 text-right font-mono">{formatRupiah(tx.total)}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-green-700">
                  {formatRupiah(tx.grossProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex justify-between text-xs pt-8">
          <div className="text-center">
            <p>Dibuat oleh,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{currentUser.name}</p>
            <p className="text-gray-500">Staf Kasir / Operasional</p>
          </div>
          <div className="text-center">
            <p>Mengetahui,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Budi Santoso</p>
            <p className="text-gray-500">Pemilik Toko (Owner)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
