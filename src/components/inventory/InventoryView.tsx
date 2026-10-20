import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  PackagePlus,
  Layers,
  ArrowUpDown,
  Barcode,
  TrendingUp,
  X,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah, formatDateIndo, formatNumber } from '../../utils/formatters';
import { exportInventoryToCSV } from '../../utils/export';
import { ProductFormModal } from './ProductFormModal';
import { StockMutationModal } from './StockMutationModal';

export const InventoryView: React.FC = () => {
  const { products, mutations, deleteProduct, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [selectedProductForMutation, setSelectedProductForMutation] = useState<Product | null>(null);

  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  // Financial & inventory analytics
  const stats = useMemo(() => {
    let totalItems = products.length;
    let totalPhysicalUnits = 0;
    let totalCostAsset = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalPhysicalUnits += p.stock;
      totalCostAsset += p.stock * p.buyPrice;
      totalRetailValue += p.stock * p.sellPrice;
      if (p.stock === 0) outOfStockCount++;
      else if (p.stock <= p.minStock) lowStockCount++;
    });

    return {
      totalItems,
      totalPhysicalUnits,
      totalCostAsset,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalCostAsset,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

      let matchStatus = true;
      if (stockStatusFilter === 'out') matchStatus = p.stock === 0;
      else if (stockStatusFilter === 'low') matchStatus = p.stock > 0 && p.stock <= p.minStock;
      else if (stockStatusFilter === 'safe') matchStatus = p.stock > p.minStock;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter]);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenMutation = (product: Product) => {
    setSelectedProductForMutation(product);
    setIsMutationModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}" dari sistem gudang?`)) {
      deleteProduct(product.id);
    }
  };

  // Product mutation history list for drawer
  const productMutations = useMemo(() => {
    if (!selectedProductForHistory) return [];
    return mutations.filter((m) => m.productId === selectedProductForHistory.id);
  }, [mutations, selectedProductForHistory]);

  const canManageProducts = currentUser.role === 'owner' || currentUser.role === 'warehouse';
  const canViewCostPrice = currentUser.role === 'owner' || currentUser.role === 'warehouse';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Stok & Gudang (Warehouse)
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau persediaan barang masuk, barang keluar dari kasir, dan ambang batas stok minimum
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportInventoryToCSV(products)}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Ekspor Excel
          </button>

          {canManageProducts && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Baru
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Jenis SKU</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatNumber(stats.totalItems)} <span className="text-xs text-slate-400 font-normal">Item</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {formatNumber(stats.totalPhysicalUnits)} unit fisik tersimpan
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Nilai Aset Modal</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {canViewCostPrice ? formatRupiah(stats.totalCostAsset) : '***'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Total modal stok di rak
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Nilai Potensi Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(stats.totalRetailValue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Potensi Laba: {canViewCostPrice ? formatRupiah(stats.potentialProfit) : '***'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Peringatan Stok</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
              {stats.lowStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Menipis</span>
            {stats.outOfStockCount > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                {stats.outOfStockCount} Habis
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Perlu restock dari suplier
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang, barcode SKU, atau suplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Sembako">Sembako</option>
              <option value="Kebutuhan Rumah">Kebutuhan Rumah</option>
              <option value="Obat & Perawatan">Obat & Perawatan</option>
              <option value="Elektronik & Aksesoris">Elektronik & Aksesoris</option>
              <option value="Alat Tulis">Alat Tulis</option>
            </select>
          </div>

          {/* Stock Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                stockStatusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                stockStatusFilter === 'low'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              Menipis ({stats.lowStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                stockStatusFilter === 'out'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-100'
              }`}
            >
              Habis ({stats.outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Kategori</th>
                {canViewCostPrice && <th className="py-3.5 px-4">Harga Modal</th>}
                <th className="py-3.5 px-4">Harga Jual</th>
                <th className="py-3.5 px-4">Stok Fisik</th>
                <th className="py-3.5 px-4">Batas Min</th>
                <th className="py-3.5 px-4">Pemasok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition group">
                    {/* Product Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight text-xs sm:text-sm">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Diperbarui: {formatDateIndo(product.lastUpdated)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU Barcode */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                      <div className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{product.sku}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Buy Price */}
                    {canViewCostPrice && (
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {formatRupiah(product.buyPrice)}
                      </td>
                    )}

                    {/* Sell Price */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {formatRupiah(product.sellPrice)}
                    </td>

                    {/* Stock Level with Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.stock} {product.unit}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] text-red-600 font-extrabold uppercase">
                            HABIS
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Min Stock */}
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {product.minStock} {product.unit}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {product.supplier || '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Restock Button */}
                        <button
                          onClick={() => handleOpenMutation(product)}
                          title="Restock / Mutasi Masuk"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>

                        {/* Stock History Drawer */}
                        <button
                          onClick={() => setSelectedProductForHistory(product)}
                          title="Kartu Riwayat Mutasi Stok"
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        {canManageProducts && (
                          <button
                            onClick={() => handleOpenEdit(product)}
                            title="Ubah Produk"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        {currentUser.role === 'owner' && (
                          <button
                            onClick={() => handleDelete(product)}
                            title="Hapus Produk"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm text-slate-600">Tidak ada produk yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status stok</p>
          </div>
        )}
      </div>

      {/* Product Stock Card / Mutation History Drawer */}
      {selectedProductForHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kartu Mutasi Stok Barang</h3>
                <p className="text-xs text-slate-500">{selectedProductForHistory.name}</p>
                <span className="text-[10px] font-mono text-indigo-600">SKU: {selectedProductForHistory.sku}</span>
              </div>
              <button
                onClick={() => setSelectedProductForHistory(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-700 font-semibold block">Posisi Stok Saat Ini:</span>
                <span className="text-2xl font-extrabold text-indigo-950 font-mono">
                  {selectedProductForHistory.stock} {selectedProductForHistory.unit}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedProductForMutation(selectedProductForHistory);
                  setIsMutationModalOpen(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                Restock Cepat
              </button>
            </div>

            {/* Mutation Log List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Riwayat Keluar / Masuk ({productMutations.length} entri)
              </span>

              {productMutations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Belum ada riwayat mutasi untuk produk ini</p>
                </div>
              ) : (
                productMutations.map((m) => {
                  const isIncoming = m.quantityChange > 0;
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            isIncoming
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isIncoming ? `+${m.quantityChange}` : m.quantityChange} {selectedProductForHistory.unit}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDateIndo(m.timestamp)}</span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {m.notes || (isIncoming ? 'Barang Masuk / Restock' : 'Penjualan Kasir POS')}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Ref: {m.referenceNumber}</span>
                        <span>Operator: {m.operatorName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
      />

      <StockMutationModal
        isOpen={isMutationModalOpen}
        onClose={() => setIsMutationModalOpen(false)}
        product={selectedProductForMutation}
      />
    </div>
  );
};
