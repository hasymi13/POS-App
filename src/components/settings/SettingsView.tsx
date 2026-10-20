import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Store,
  Receipt,
  QrCode,
  Bell,
  Volume2,
  Percent,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefault } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [taxPercent, setTaxPercent] = useState(settings.taxPercent);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(settings.autoPrintReceipt);
  const [lowStockThresholdDefault, setLowStockThresholdDefault] = useState(
    settings.lowStockThresholdDefault
  );
  const [qrisMerchantName, setQrisMerchantName] = useState(settings.qrisMerchantName);
  const [qrisNmid, setQrisNmid] = useState(settings.qrisNmid);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      address,
      phone,
      email,
      receiptFooter,
      enableTax,
      taxPercent,
      soundEnabled,
      autoPrintReceipt,
      lowStockThresholdDefault,
      qrisMerchantName,
      qrisNmid,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin me-reset seluruh database toko ke data awal bawaan?')) {
      resetToDefault();
      alert('Database berhasil di-reset ke data bawaan.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Sistem & Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi identitas toko, format struk belanja, QRIS, dan batas notifikasi
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Tersimpan!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Profil Toko / Usaha</h3>
              <p className="text-[11px] text-slate-400">Dicantumkan pada header struk kasir & laporan</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Toko / Usaha</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Slogan / Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">No. Telepon / WA</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Toko</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Receipt & Thermal Printer Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cetak Struk & Printer Thermal</h3>
              <p className="text-[11px] text-slate-400">Pesan penutup struk dan preferensi otomatis</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Pesan Footer Struk</label>
            <textarea
              rows={3}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Buka Struk Otomatis Setelah Pembayaran
                </span>
                <span className="text-[11px] text-slate-500">
                  Secara langsung menampilkan struk kasir setelah kasir menekan tombol bayar
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Efek Suara POS & Beep Barcode (Web Audio)
                </span>
                <span className="text-[11px] text-slate-500">
                  Bunyi beep saat memindai barang dan bunyi gemerincing saat pembayaran lunas
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* QRIS Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Integrasi QRIS Pembayaran</h3>
              <p className="text-[11px] text-slate-400">Parameter identitas QRIS Dinamis</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Merchant QRIS</label>
            <input
              type="text"
              value={qrisMerchantName}
              onChange={(e) => setQrisMerchantName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nomor NMID Merchant</label>
            <input
              type="text"
              value={qrisNmid}
              onChange={(e) => setQrisNmid(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tax (PPN) & Stock Alert Thresholds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pajak (PPN) & Ambang Batas Stok</h3>
              <p className="text-[11px] text-slate-400">Aturan penghitungan kasir dan notifikasi gudang</p>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={enableTax}
              onChange={(e) => setEnableTax(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Aktifkan Pajak Pertambahan Nilai (PPN)
              </span>
              <span className="text-[11px] text-slate-500">
                Menambahkan persentase PPN secara otomatis ke total belanja pelanggan
              </span>
            </div>
          </label>

          {enableTax && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tarif PPN (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Batas Minimum Stok Default (Peringatan Notifikasi)
            </label>
            <input
              type="number"
              min={1}
              value={lowStockThresholdDefault}
              onChange={(e) => setLowStockThresholdDefault(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Sistem akan memicu notifikasi peringatan jika stok produk berada di bawah angka ini.
            </p>
          </div>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="bg-red-50 p-5 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-red-900 text-sm">Reset Database Toko ke Pengaturan Bawaan</h4>
          <p className="text-xs text-red-700 mt-0.5">
            Menghapus transaksi uji coba dan mengembalikan persediaan barang ke sampel awal
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Data Toko
        </button>
      </div>
    </div>
  );
};
