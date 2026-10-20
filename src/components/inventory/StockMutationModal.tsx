import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowDownRight, ArrowUpRight, Check, PackagePlus, AlertCircle } from 'lucide-react';
import { Product } from '../../types';

interface StockMutationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockMutationModal: React.FC<StockMutationModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { restockProduct, adjustProductStock } = useApp();

  const [mode, setMode] = useState<'restock' | 'adjustment'>('restock');
  const [quantity, setQuantity] = useState<number>(10);
  const [exactStock, setExactStock] = useState<number>(product ? product.stock : 0);
  const [supplier, setSupplier] = useState(product?.supplier || '');
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'restock') {
      if (quantity <= 0) {
        alert('Jumlah penambahan harus lebih besar dari 0');
        return;
      }
      restockProduct(product.id, quantity, notes, supplier);
    } else {
      if (exactStock < 0) {
        alert('Stok fisik tidak boleh bernilai negatif');
        return;
      }
      adjustProductStock(product.id, exactStock, notes || 'Penyesuaian stok opname fisik gudang');
    }
    onClose();
  };

  const calculatedNewStock = mode === 'restock' ? product.stock + quantity : exactStock;
  const difference = calculatedNewStock - product.stock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Mutasi & Restock Barang</h3>
            <p className="text-xs text-slate-500 mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Restock vs Opname */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('restock')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'restock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            Penerimaan Barang (Restock)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('adjustment');
              setExactStock(product.stock);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'adjustment'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-amber-300" />
            Stock Opname (Penyesuaian)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Stock Preview Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Stok Gudang Saat Ini</span>
              <span className="text-lg font-mono font-extrabold text-slate-800">
                {product.stock} {product.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Stok Setelah Update</span>
              <span
                className={`text-lg font-mono font-extrabold ${
                  difference > 0
                    ? 'text-emerald-600'
                    : difference < 0
                    ? 'text-red-500'
                    : 'text-slate-800'
                }`}
              >
                {calculatedNewStock} {product.unit} ({difference >= 0 ? `+${difference}` : difference})
              </span>
            </div>
          </div>

          {mode === 'restock' ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jumlah Barang Masuk ({product.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-1">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuantity(amt)}
                        className="px-2 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pemasok / Suplier
                </label>
                <input
                  type="text"
                  placeholder="Nama suplier atau no. DO..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hasil Hitung Fisik Sebenarnya ({product.unit})
              </label>
              <input
                type="number"
                min={0}
                required
                value={exactStock}
                onChange={(e) => setExactStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gunakan saat terjadi selisih fisik di rak gudang (rusak, bocor, atau hilang).
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Mutasi</label>
            <input
              type="text"
              placeholder="Contoh: Faktur No. 8821 atau Hasil audit mingguan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              Simpan Mutasi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
