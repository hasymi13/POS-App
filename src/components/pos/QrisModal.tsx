import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, Smartphone, CheckCircle, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (qrisRef: string) => void;
  amount: number;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
}) => {
  const { settings } = useApp();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isSimulating, setIsSimulating] = useState(false);
  const [qrisReference, setQrisReference] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setQrisReference(`QRIS-${Date.now().toString().slice(-8)}`);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onPaymentSuccess(qrisReference);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden flex flex-col">
        {/* QRIS Header with Official Colors */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-red-600 text-white font-black text-xs rounded-sm tracking-wider">
              QRIS
            </div>
            <span className="font-bold text-sm tracking-wide">Pembayaran Instan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QRIS Body */}
        <div className="p-5 flex flex-col items-center text-center">
          {/* Merchant info */}
          <div className="mb-3">
            <h4 className="font-extrabold text-slate-900 text-base">{settings.qrisMerchantName}</h4>
            <p className="text-[11px] text-slate-500 font-mono">NMID: {settings.qrisNmid}</p>
          </div>

          {/* Amount Badge */}
          <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl py-2 px-3 mb-4">
            <span className="text-[11px] text-indigo-600 font-semibold block">Total Tagihan</span>
            <span className="text-xl font-extrabold text-indigo-950 font-mono">
              {formatRupiah(amount)}
            </span>
          </div>

          {/* QR Code Container styled with standard QRIS borders */}
          <div className="relative p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-inner flex flex-col items-center">
            {/* Top GPN & QRIS Badge in card */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-[10px] font-black tracking-widest text-red-600">QRIS</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-xs">
                GPN Interoperable
              </span>
            </div>

            {/* QR Matrix SVG */}
            <div className="w-48 h-48 bg-white flex items-center justify-center p-1 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                {/* Simulated standard QR Code matrix pattern */}
                {/* Top-left locator */}
                <rect x="5" y="5" width="26" height="26" rx="3" fill="currentColor" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />

                {/* Top-right locator */}
                <rect x="69" y="5" width="26" height="26" rx="3" fill="currentColor" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />

                {/* Bottom-left locator */}
                <rect x="5" y="69" width="26" height="26" rx="3" fill="currentColor" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />

                {/* Data modules pattern */}
                <rect x="36" y="8" width="5" height="5" fill="currentColor" />
                <rect x="46" y="8" width="8" height="5" fill="currentColor" />
                <rect x="58" y="8" width="5" height="5" fill="currentColor" />

                <rect x="36" y="18" width="12" height="5" fill="currentColor" />
                <rect x="53" y="18" width="8" height="5" fill="currentColor" />

                <rect x="8" y="36" width="5" height="5" fill="currentColor" />
                <rect x="18" y="36" width="10" height="5" fill="currentColor" />
                <rect x="33" y="33" width="6" height="6" fill="currentColor" />
                <rect x="43" y="33" width="14" height="6" fill="currentColor" />
                <rect x="62" y="33" width="6" height="6" fill="currentColor" />
                <rect x="73" y="36" width="8" height="5" fill="currentColor" />
                <rect x="86" y="36" width="6" height="5" fill="currentColor" />

                <rect x="33" y="44" width="8" height="12" fill="currentColor" />
                <rect x="46" y="44" width="8" height="12" fill="currentColor" />
                <rect x="59" y="44" width="8" height="12" fill="currentColor" />
                <rect x="72" y="44" width="8" height="12" fill="currentColor" />
                <rect x="85" y="44" width="10" height="12" fill="currentColor" />

                <rect x="8" y="46" width="8" height="6" fill="currentColor" />
                <rect x="20" y="46" width="6" height="6" fill="currentColor" />

                <rect x="8" y="57" width="18" height="5" fill="currentColor" />
                <rect x="33" y="61" width="14" height="6" fill="currentColor" />
                <rect x="52" y="61" width="14" height="6" fill="currentColor" />
                <rect x="71" y="61" width="10" height="6" fill="currentColor" />
                <rect x="86" y="61" width="9" height="6" fill="currentColor" />

                <rect x="36" y="72" width="6" height="6" fill="currentColor" />
                <rect x="47" y="72" width="10" height="6" fill="currentColor" />
                <rect x="62" y="72" width="6" height="6" fill="currentColor" />
                <rect x="73" y="72" width="22" height="6" fill="currentColor" />

                <rect x="36" y="83" width="12" height="6" fill="currentColor" />
                <rect x="53" y="83" width="8" height="6" fill="currentColor" />
                <rect x="66" y="83" width="14" height="6" fill="currentColor" />
                <rect x="85" y="83" width="10" height="6" fill="currentColor" />

                {/* Center QRIS logo badge */}
                <rect x="42" y="42" width="16" height="16" rx="3" fill="white" />
                <circle cx="50" cy="50" r="6" fill="#dc2626" />
              </svg>
            </div>

            {/* Bottom text */}
            <span className="text-[10px] text-slate-500 font-mono mt-1">Ref: {qrisReference}</span>
          </div>

          {/* Countdown & status */}
          <div className="mt-4 flex items-center justify-between w-full text-xs px-2">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Menunggu pembayaran...</span>
            </div>

            <div className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {formattedTime}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI & seluruh mobile banking.
          </p>
        </div>

        {/* Action button: Customer Payment Simulation & Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
          <button
            onClick={handleSimulatePayment}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Memverifikasi Pembayaran Pelanggan...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Simulasi Bayar Berhasil (Pelanggan Telah Scan)
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Batal / Pilih Metode Lain
          </button>
        </div>
      </div>
    </div>
  );
};
