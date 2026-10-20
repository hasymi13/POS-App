export type UserRole = 'owner' | 'cashier' | 'warehouse';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string;
  avatar: string;
  phone?: string;
  active: boolean;
}

export type ProductCategory = 
  | 'Makanan'
  | 'Minuman'
  | 'Sembako'
  | 'Kebutuhan Rumah'
  | 'Obat & Perawatan'
  | 'Elektronik & Aksesoris'
  | 'Alat Tulis';

export interface Product {
  id: string;
  sku: string; // Barcode / SKU
  name: string;
  category: ProductCategory;
  buyPrice: number; // Harga Modal
  sellPrice: number; // Harga Jual
  stock: number;
  minStock: number; // Ambang batas stok rendah
  unit: string; // 'pcs', 'pack', 'botol', 'dus', 'kg', dll
  supplier: string;
  image?: string;
  description?: string;
  lastUpdated: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  customPrice?: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit';

export interface TransactionItem {
  productId: string;
  sku: string;
  name: string;
  category: ProductCategory;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  unit: string;
  discountPercent: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string; // ISO string
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  totalCost: number; // Total harga modal (COGS)
  grossProfit: number; // total - totalCost
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  qrisRef?: string;
  status: 'completed' | 'cancelled';
  notes?: string;
}

export type MutationType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface StockMutation {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MutationType;
  quantityChange: number; // negative for sales, positive for restock
  previousStock: number;
  newStock: number;
  referenceNumber: string; // e.g. INV-..., PO-..., ADJ-...
  operatorName: string;
  timestamp: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxPercent: number; // e.g. 11 for PPN 11%
  enableTax: boolean;
  currency: string;
  receiptFooter: string;
  autoPrintReceipt: boolean;
  soundEnabled: boolean;
  lowStockThresholdDefault: number;
  qrisMerchantName: string;
  qrisNmid: string;
}
