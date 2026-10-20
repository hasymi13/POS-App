import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, PackagePlus, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export const LowStockDrawer: React.FC = () => {
  const {
    isLowStockDrawerOpen,
    setIsLowStockDrawerOpen,
    lowStockProducts,
    restockProduct,
    setActiveTab,
    currentUser,
  } = useApp();

  const [restockAmountMap, setRestockAmountMap] = useState<Record<string, number>>({});
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isLowStockDrawerOpen) return null;

  const handleRestock = (productId: string, qty: number, name: string) => {
    restockProduct(productId, qty, `Restock darurat dari panel notifikasi stok rendah`, 'Pemasok Resmi');
    setSuccessId(productId);
    setTimeout(() => setSuccessId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-red-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Notifikasi Stok Rendah</h3>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {lowStockProducts.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Persediaan barang telah mencapai atau di bawah batas minimum</p>
            </div>
          </div>
          <button
            onClick={() => setIsLowStockDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Semua Stok Gudang Aman!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Tidak ada produk yang berada di bawah ambang batas minimum. Transaksi kasir dapat berjalan lancar.
              </p>
            </div>
          ) : (
            lowStockProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const percent = Math.min(100, Math.round((product.stock / product.minStock) * 100));
              const qtyToAdd = restockAmountMap[product.id] || 20;

              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border transition ${
                    isOutOfStock
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <PackagePlus className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500">SKU: {product.sku}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-600 font-medium">{product.category}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isOutOfStock
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {isOutOfStock ? 'HABIS' : 'KRITIS'}
                    </span>
                  </div>

                  {/* Stock level info */}
                  <div className="mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Sisa Stok Saat Ini:</span>
                      <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-amber-700'}`}>
                        {product.stock} {product.unit} (Min: {product.minStock})
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOutOfStock ? 'bg-red-500 w-0' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>Harga Modal: {formatRupiah(product.buyPrice)}</span>
                      <span>Suplier: {product.supplier || '-'}</span>
                    </div>
                  </div>

                  {/* Quick restock input (for Owner & Warehouse roles) */}
                  {currentUser.role !== 'cashier' ? (
                    <div className="mt-3 pt-2 flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            setRestockAmountMap((prev) => ({
                              ...prev,
                              [product.id]: Math.max(5, (prev[product.id] || 20) - 5),
                            }))
                          }
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono text-xs font-semibold text-slate-800">
                          +{qtyToAdd}
                        </span>
                        <button
                          onClick={() =>
                            setRestockAmountMap((prev) => ({
                              ...prev,
                              [product.id]: (prev[product.id] || 20) + 10,
                            }))
                          }
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRestock(product.id, qtyToAdd, product.name)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-xs ${
                          successId === product.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {successId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Berhasil Ditambah!
                          </>
                        ) : (
                          <>
                            <PackagePlus className="w-3.5 h-3.5" />
                            Tambah +{qtyToAdd} {product.unit}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-slate-500 italic flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-slate-400" />
                      Role Kasir: Hubungi Staf Gudang / Pemilik untuk restock barang.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {lowStockProducts.length > 0 ? 'Segera lakukan pemesanan ke pemasok' : 'Sistem terpantau aman'}
          </span>
          <button
            onClick={() => {
              setIsLowStockDrawerOpen(false);
              setActiveTab('inventory');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Buka Modul Gudang <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
