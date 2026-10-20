import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, CheckCircle, Share2, Copy, Send, RefreshCw } from 'lucide-react';
import { formatDateIndo, formatRupiah } from '../../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { lastReceipt, isReceiptModalOpen, setIsReceiptModalOpen, settings, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isReceiptModalOpen || !lastReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptText = () => {
    const divider = '================================';
    const lines = [
      settings.storeName.toUpperCase(),
      settings.tagline,
      settings.address,
      `Telp: ${settings.phone}`,
      divider,
      `No. Inv : ${lastReceipt.invoiceNumber}`,
      `Waktu   : ${formatDateIndo(lastReceipt.timestamp)}`,
      `Kasir   : ${lastReceipt.cashierName}`,
      `Customer: ${lastReceipt.customerName || 'Umum'}`,
      divider,
    ];

    lastReceipt.items.forEach((item) => {
      lines.push(`${item.name}`);
      lines.push(
        `  ${item.quantity} ${item.unit} x ${formatRupiah(item.sellPrice)} = ${formatRupiah(item.subtotal)}`
      );
      if (item.discountPercent > 0) {
        lines.push(`  Diskon: ${item.discountPercent}%`);
      }
    });

    lines.push(divider);
    lines.push(`Subtotal     : ${formatRupiah(lastReceipt.subtotal)}`);
    if (lastReceipt.discountTotal > 0) {
      lines.push(`Total Diskon : -${formatRupiah(lastReceipt.discountTotal)}`);
    }
    if (lastReceipt.taxAmount > 0) {
      lines.push(`PPN (${lastReceipt.taxPercent}%)  : ${formatRupiah(lastReceipt.taxAmount)}`);
    }
    lines.push(`TOTAL        : ${formatRupiah(lastReceipt.total)}`);
    lines.push(`Metode Bayar : ${lastReceipt.paymentMethod.toUpperCase()}`);

    if (lastReceipt.paymentMethod === 'cash') {
      lines.push(`Uang Diterima: ${formatRupiah(lastReceipt.cashReceived || lastReceipt.total)}`);
      lines.push(`Kembalian    : ${formatRupiah(lastReceipt.cashChange || 0)}`);
    } else if (lastReceipt.paymentMethod === 'qris') {
      lines.push(`Ref QRIS     : ${lastReceipt.qrisRef || '-'}`);
      lines.push(`Status       : LUNAS (QRIS Terverifikasi)`);
    }

    lines.push(divider);
    lines.push(settings.receiptFooter);
    return lines.join('\n');
  };

  const handleCopyText = () => {
    const text = generateReceiptText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = generateReceiptText();
    const encoded = encodeURIComponent(text);
    const phone = lastReceipt.customerPhone ? lastReceipt.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleNewOrder = () => {
    setIsReceiptModalOpen(false);
    setActiveTab('pos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base leading-tight">Transaksi Selesai & Lunas!</h3>
              <p className="text-xs text-emerald-100">Struk siap dicetak atau dikirim digital ke pelanggan</p>
            </div>
          </div>
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-emerald-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Size Selector & Quick Actions */}
        <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Ukuran Kertas:</span>
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-xs ${
                  paperWidth === '58mm'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                58mm (Thermal)
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-md font-bold transition text-xs ${
                  paperWidth === '80mm'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm (Standard)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyText}
              title="Salin Struk Teks"
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1 text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Tersalin' : 'Salin'}
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Kirim ke WhatsApp"
              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Receipt Container - Printable Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 flex justify-center">
          <div
            id="printable-receipt-area"
            ref={printContainerRef}
            className={`bg-white shadow-md rounded-sm p-4 text-slate-800 font-mono text-[11px] leading-relaxed transition-all ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="font-extrabold text-sm text-slate-900 tracking-wider">
                {settings.storeName}
              </h2>
              <p className="text-[10px] text-slate-600">{settings.tagline}</p>
              <p className="text-[10px] text-slate-600 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-600">Telp: {settings.phone}</p>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-600">No. Invoice:</span>
                <span className="font-bold text-slate-900">{lastReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Waktu:</span>
                <span>{formatDateIndo(lastReceipt.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kasir:</span>
                <span>{lastReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pelanggan:</span>
                <span>{lastReceipt.customerName || 'Umum'}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-2">
              {lastReceipt.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.sellPrice)}
                      {item.discountPercent > 0 && ` (-${item.discountPercent}%)`}
                    </span>
                    <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({lastReceipt.items.length} item):</span>
                <span>{formatRupiah(lastReceipt.subtotal)}</span>
              </div>

              {lastReceipt.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(lastReceipt.discountTotal)}</span>
                </div>
              )}

              {lastReceipt.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({lastReceipt.taxPercent}%):</span>
                  <span>{formatRupiah(lastReceipt.taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>{formatRupiah(lastReceipt.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Metode Bayar:</span>
                <span className="font-bold uppercase text-slate-900">
                  {lastReceipt.paymentMethod === 'qris'
                    ? 'QRIS DINAMIS (LUNAS)'
                    : lastReceipt.paymentMethod === 'cash'
                    ? 'TUNAI'
                    : lastReceipt.paymentMethod.toUpperCase()}
                </span>
              </div>

              {lastReceipt.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Uang Tunai:</span>
                    <span>{formatRupiah(lastReceipt.cashReceived || lastReceipt.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(lastReceipt.cashChange || 0)}</span>
                  </div>
                </>
              )}

              {lastReceipt.paymentMethod === 'qris' && lastReceipt.qrisRef && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Ref Transaksi:</span>
                  <span className="font-mono text-[9px]">{lastReceipt.qrisRef}</span>
                </div>
              )}
            </div>

            {/* Footer Message & Barcode simulation */}
            <div className="pt-3 text-center space-y-2">
              <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed">
                {settings.receiptFooter}
              </p>

              {/* Barcode graphic lines simulation */}
              <div className="flex flex-col items-center justify-center pt-1 opacity-70">
                <div className="h-6 w-44 flex items-center justify-between overflow-hidden">
                  {[...Array(42)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${(i % 3) + 1}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] tracking-widest text-slate-500 mt-0.5">
                  {lastReceipt.invoiceNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleNewOrder}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Transaksi Baru
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
