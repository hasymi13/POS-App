import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, Sparkles, Barcode } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { generateRandomSKU } from '../../utils/formatters';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES: ProductCategory[] = [
  'Makanan',
  'Minuman',
  'Sembako',
  'Kebutuhan Rumah',
  'Obat & Perawatan',
  'Elektronik & Aksesoris',
  'Alat Tulis',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, settings } = useApp();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Sembako');
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(settings.lowStockThresholdDefault);
  const [unit, setUnit] = useState('pcs');
  const [supplier, setSupplier] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setBuyPrice(productToEdit.buyPrice);
      setSellPrice(productToEdit.sellPrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setUnit(productToEdit.unit);
      setSupplier(productToEdit.supplier || '');
      setImage(productToEdit.image || '');
      setDescription(productToEdit.description || '');
    } else {
      setSku(generateRandomSKU('8991'));
      setName('');
      setCategory('Sembako');
      setBuyPrice(10000);
      setSellPrice(12500);
      setStock(20);
      setMinStock(settings.lowStockThresholdDefault);
      setUnit('pcs');
      setSupplier('');
      setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');
      setDescription('');
    }
  }, [productToEdit, isOpen, settings.lowStockThresholdDefault]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk tidak boleh kosong');
      return;
    }

    if (sellPrice < buyPrice) {
      if (!confirm('Harga jual lebih rendah dari harga beli (modal). Lanjutkan?')) {
        return;
      }
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku,
        name,
        category,
        buyPrice,
        sellPrice,
        stock,
        minStock,
        unit,
        supplier,
        image,
        description,
      });
    } else {
      addProduct({
        sku: sku || generateRandomSKU('8991'),
        name,
        category,
        buyPrice,
        sellPrice,
        stock,
        minStock,
        unit,
        supplier,
        image,
        description,
      });
    }

    onClose();
  };

  const margin = sellPrice - buyPrice;
  const marginPercent = buyPrice > 0 ? Math.round((margin / buyPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {productToEdit ? 'Ubah Data Produk' : 'Tambah Produk Baru ke Gudang'}
              </h3>
              <p className="text-xs text-slate-500">Kelola master data inventaris toko</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Barcode & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Barcode / SKU</label>
                <button
                  type="button"
                  onClick={() => setSku(generateRandomSKU('8991'))}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Produk</label>
            <input
              type="text"
              required
              placeholder="Contoh: Beras Premium Ramos 5 Kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Pricing: Modal & Jual & Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Harga Modal (Beli) Rp
              </label>
              <input
                type="number"
                min={0}
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-700 block mb-1">
                Harga Jual Kasir Rp
              </label>
              <input
                type="number"
                min={0}
                required
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-indigo-400 rounded-lg text-sm font-mono font-bold text-indigo-700 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2 text-xs flex justify-between items-center text-slate-600 pt-1">
              <span>Estimasi Margin Laba:</span>
              <span className={`font-bold font-mono ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                +Rp {margin.toLocaleString('id-ID')} ({marginPercent}%)
              </span>
            </div>
          </div>

          {/* Stock, Unit, Min Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Stok Fisik</label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Satuan</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="pcs">pcs</option>
                <option value="pack">pack</option>
                <option value="botol">botol</option>
                <option value="kotak">kotak</option>
                <option value="dus">dus</option>
                <option value="karung">karung</option>
                <option value="pouch">pouch</option>
                <option value="renceng">renceng</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-700 block mb-1">Batas Minimum</label>
              <input
                type="number"
                min={1}
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm font-mono font-bold text-amber-800 outline-none"
              />
            </div>
          </div>

          {/* Supplier & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pemasok (Suplier)</label>
              <input
                type="text"
                placeholder="Contoh: PT Indofood / CV Sumber Tani"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Foto / URL Gambar</label>
              <input
                type="text"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Keterangan / Deskripsi</label>
            <textarea
              rows={2}
              placeholder="Catatan spesifikasi atau lokasi rak penyimpanan di gudang..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              {productToEdit ? 'Simpan Perubahan' : 'Daftarkan ke Gudang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
