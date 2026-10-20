import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  CreditCard,
  QrCode,
  Banknote,
  UserCheck,
  RotateCcw,
  Sparkles,
  Package,
  AlertTriangle,
  Receipt,
  ScanLine,
} from 'lucide-react';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { ProductCategory, PaymentMethod, Product } from '../../types';
import { QrisModal } from './QrisModal';

const CATEGORIES: ('Semua' | ProductCategory)[] = [
  'Semua',
  'Makanan',
  'Minuman',
  'Sembako',
  'Kebutuhan Rumah',
  'Obat & Perawatan',
  'Elektronik & Aksesoris',
];

export const PosView: React.FC = () => {
  const {
    products,
    cart,
    cartTotal,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCartDiscount,
    checkout,
    currentUser,
    settings,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products by category & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode search / scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      const added = addToCart(matched, 1);
      if (added) {
        setBarcodeInput('');
      }
    } else {
      alert(`Barcode "${barcodeInput}" tidak ditemukan di database gudang!`);
    }
  };

  // Cash change calculation
  const cashChange = Math.max(0, cashAmount - cartTotal.total);
  const isCashSufficient = paymentMethod !== 'cash' || cashAmount >= cartTotal.total;

  // Handle preset cash buttons
  const setExactCash = () => setCashAmount(cartTotal.total);
  const addCashPreset = (val: number) => setCashAmount(val);

  // Trigger checkout
  const handleCompleteOrder = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'cash' && cashAmount < cartTotal.total) {
      alert(`Uang tunai kurang sebesar ${formatRupiah(cartTotal.total - cashAmount)}`);
      return;
    }

    if (paymentMethod === 'qris') {
      setIsQrisModalOpen(true);
      return;
    }

    setIsProcessing(true);
    await checkout({
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashAmount : undefined,
      cashChange: paymentMethod === 'cash' ? cashChange : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: orderNotes || undefined,
    });

    // Reset cashier input state
    setCashAmount(0);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setIsProcessing(false);
  };

  const handleQrisSuccess = async (qrisRef: string) => {
    setIsQrisModalOpen(false);
    setIsProcessing(true);
    await checkout({
      paymentMethod: 'qris',
      qrisRef,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: orderNotes || undefined,
    });
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
      {/* LEFT: Product Catalog & Search (Scrollable) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200">
        {/* Top Control Bar: Search & Barcode Scanner Simulator */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama produk atau SKU barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Barcode Scanner Form */}
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5">
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-36 sm:w-44 pl-8 pr-2 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Pindai barcode dan masukkan ke keranjang"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scan
              </button>
            </form>
          </div>

          {/* Categories Pill Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((i) => i.product.id === product.id);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;
              const remainingStock = product.stock - inCartQty;
              const isOutOfStock = remainingStock <= 0;
              const isLowStock = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product, 1)}
                  className={`group relative bg-white rounded-xl border transition-all flex flex-col overflow-hidden text-left ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed'
                      : 'border-slate-200/80 hover:border-indigo-400 hover:shadow-md cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-10 h-10" />
                      </div>
                    )}

                    {/* Category tag */}
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {product.category}
                    </span>

                    {/* Stock alert badge */}
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          HABIS
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Sisa {remainingStock}
                        </span>
                      ) : (
                        <span className="bg-slate-900/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                          Stok: {remainingStock}
                        </span>
                      )}
                    </div>

                    {/* Quantity in Cart indicator */}
                    {inCartQty > 0 && (
                      <div className="absolute bottom-2 right-2 bg-indigo-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-full shadow-md">
                        {inCartQty} di keranjang
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        {product.sku}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-indigo-600">
                        {formatRupiah(product.sellPrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        /{product.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm">Produk tidak ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci pencarian lain atau pilih kategori Semua</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart, Customer Info & Payment (Fixed Sidebar) */}
      <div className="w-full lg:w-[420px] xl:w-[450px] bg-white flex flex-col shadow-lg border-l border-slate-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pesanan Kasir (POS)</h3>
              <p className="text-[11px] text-slate-500">
                Kasir: <span className="font-semibold text-indigo-600">{currentUser.name}</span>
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer Input Collapsible / Light */}
        <div className="px-4 py-2.5 bg-slate-100/50 border-b border-slate-200 flex items-center gap-2 text-xs">
          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Nama Pelanggan (opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs"
          />
          <input
            type="text"
            placeholder="No. WhatsApp"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-28 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs font-mono"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="font-bold text-sm text-slate-600">Keranjang Masih Kosong</p>
              <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
                Pilih produk dari katalog di sebelah kiri atau scan barcode untuk memulai transaksi
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.sellPrice * item.quantity;
              const discountVal = (itemTotal * item.discountPercent) / 100;
              const netTotal = itemTotal - discountVal;

              return (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {item.product.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Discount & Subtotal */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Diskon percent quick button */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Disc:</span>
                      <select
                        value={item.discountPercent}
                        onChange={(e) =>
                          applyCartDiscount(item.product.id, Number(e.target.value))
                        }
                        className="text-[10px] font-semibold bg-slate-100 border border-slate-200 rounded-md px-1 py-0.5 text-slate-700 outline-none"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>

                    {/* Net subtotal */}
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-slate-900 block">
                        {formatRupiah(netTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calculation & Payment Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Summary Details */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cartTotal.itemCount} barang):</span>
              <span className="font-semibold text-slate-800">
                {formatRupiah(cartTotal.subtotal)}
              </span>
            </div>

            {cartTotal.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Diskon:</span>
                <span>-{formatRupiah(cartTotal.discountTotal)}</span>
              </div>
            )}

            {settings.enableTax && (
              <div className="flex justify-between text-slate-600">
                <span>PPN ({settings.taxPercent}%):</span>
                <span>{formatRupiah(cartTotal.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
              <span className="font-bold text-sm">TOTAL TAGIHAN</span>
              <span className="font-extrabold text-xl text-indigo-600 font-mono">
                {formatRupiah(cartTotal.total)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Metode Pembayaran
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                  paymentMethod === 'cash'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Tunai
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                  paymentMethod === 'qris'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QRIS Instan
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition ${
                  paymentMethod === 'debit'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Debit / EDC
              </button>
            </div>
          </div>

          {/* If Cash: Quick Presets & Change Calculation */}
          {paymentMethod === 'cash' && cart.length > 0 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Uang Diterima (Rp):</span>
                <button
                  type="button"
                  onClick={setExactCash}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Uang Pas
                </button>
              </div>

              <input
                type="number"
                value={cashAmount || ''}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                placeholder="Masukkan nominal uang tunai..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none"
              />

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[20000, 50000, 100000, 200000, 500000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => addCashPreset(nominal)}
                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                  >
                    {formatNumber(nominal)}
                  </button>
                ))}
              </div>

              {/* Change / Kembalian */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Kembalian:</span>
                <span
                  className={`font-mono font-extrabold text-sm ${
                    cashAmount >= cartTotal.total ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {cashAmount >= cartTotal.total
                    ? formatRupiah(cashChange)
                    : `Kurang ${formatRupiah(cartTotal.total - cashAmount)}`}
                </span>
              </div>
            </div>
          )}

          {/* Final Checkout Button */}
          <button
            onClick={handleCompleteOrder}
            disabled={cart.length === 0 || !isCashSufficient || isProcessing}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
              paymentMethod === 'qris'
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              'Memproses Transaksi...'
            ) : paymentMethod === 'qris' ? (
              <>
                <QrCode className="w-4 h-4" />
                Tampilkan QRIS & Bayar
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                Bayar & Cetak Struk
              </>
            )}
          </button>
        </div>
      </div>

      {/* QRIS Modal */}
      <QrisModal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        onPaymentSuccess={handleQrisSuccess}
        amount={cartTotal.total}
      />
    </div>
  );
};
