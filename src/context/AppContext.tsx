import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  Transaction,
  StockMutation,
  StoreSettings,
  User,
  CartItem,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_MUTATIONS,
  INITIAL_USERS,
} from '../data/mockData';
import { generateInvoiceNumber } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface CheckoutPayload {
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  qrisRef?: string;
}

interface AppContextType {
  products: Product[];
  transactions: Transaction[];
  mutations: StockMutation[];
  settings: StoreSettings;
  currentUser: User;
  allUsers: User[];
  cart: CartItem[];
  cartTotal: {
    subtotal: number;
    discountTotal: number;
    taxAmount: number;
    total: number;
    totalCost: number;
    itemCount: number;
  };
  lowStockProducts: Product[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCartDiscount: (productId: string, discountPercent: number) => void;
  // Checkout
  checkout: (payload: CheckoutPayload) => Promise<Transaction | null>;
  // Product & Inventory actions
  addProduct: (productData: Omit<Product, 'id' | 'lastUpdated'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (productId: string, quantityToAdd: number, notes?: string, supplier?: string) => void;
  adjustProductStock: (productId: string, newStock: number, notes?: string) => void;
  // User Actions
  setCurrentUser: (user: User) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  // Settings Actions
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  // Modals & UI States
  lastReceipt: Transaction | null;
  setLastReceipt: (tx: Transaction | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  isLowStockDrawerOpen: boolean;
  setIsLowStockDrawerOpen: (open: boolean) => void;
  isSwitchUserModalOpen: boolean;
  setIsSwitchUserModalOpen: (open: boolean) => void;
  // Sync state
  lastSyncTime: Date;
  syncNotification: string | null;
  simulateExternalSale: () => void;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'pos_inventory_products_v2',
  TRANSACTIONS: 'pos_inventory_transactions_v2',
  MUTATIONS: 'pos_inventory_mutations_v2',
  SETTINGS: 'pos_inventory_settings_v2',
  USERS: 'pos_inventory_users_v2',
  CURRENT_USER: 'pos_inventory_current_user_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [mutations, setMutations] = useState<StockMutation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
      return saved ? JSON.parse(saved) : INITIAL_MUTATIONS;
    } catch {
      return INITIAL_MUTATIONS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return INITIAL_USERS[0]; // Default to Owner
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lastReceipt, setLastReceipt] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLowStockDrawerOpen, setIsLowStockDrawerOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(mutations));
    } catch (e) {
      console.error(e);
    }
  }, [mutations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    } catch (e) {
      console.error(e);
    }
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Real-time synchronization across browser tabs via BroadcastChannel & storage events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('pos_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_ALL') {
            try {
              const freshProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
              const freshTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
              const freshMutations = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
              if (freshProducts) setProducts(JSON.parse(freshProducts));
              if (freshTransactions) setTransactions(JSON.parse(freshTransactions));
              if (freshMutations) setMutations(JSON.parse(freshMutations));
              setLastSyncTime(new Date());
              setSyncNotification(event.data.message || 'Sinkronisasi real-time berhasil diperbarui');
              setTimeout(() => setSyncNotification(null), 4000);
            } catch (err) {
              console.error('Sync error:', err);
            }
          }
        };
      }
    } catch {
      // BroadcastChannel fallback
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS && e.newValue) {
        setProducts(JSON.parse(e.newValue));
        setLastSyncTime(new Date());
      }
      if (e.key === STORAGE_KEYS.TRANSACTIONS && e.newValue) {
        setTransactions(JSON.parse(e.newValue));
        setLastSyncTime(new Date());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const broadcastSync = (message: string) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('pos_sync_channel');
        channel.postMessage({ type: 'SYNC_ALL', message, timestamp: Date.now() });
        channel.close();
      }
    } catch {
      // Ignore
    }
    setLastSyncTime(new Date());
  };

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock);
  }, [products]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let totalCost = 0;
    let itemCount = 0;

    cart.forEach((item) => {
      const price = item.product.sellPrice;
      const itemSubtotal = price * item.quantity;
      const discount = (itemSubtotal * item.discountPercent) / 100;
      subtotal += itemSubtotal;
      discountTotal += discount;
      totalCost += item.product.buyPrice * item.quantity;
      itemCount += item.quantity;
    });

    const taxableAmount = Math.max(0, subtotal - discountTotal);
    const taxAmount = settings.enableTax ? Math.round((taxableAmount * settings.taxPercent) / 100) : 0;
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      discountTotal,
      taxAmount,
      total,
      totalCost,
      itemCount,
    };
  }, [cart, settings.enableTax, settings.taxPercent]);

  // Cart actions
  const addToCart = useCallback((product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) {
      if (settings.soundEnabled) playSound.warning();
      return false;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;
        if (newQty > product.stock) {
          if (settings.soundEnabled) playSound.warning();
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        if (quantity > product.stock) {
          if (settings.soundEnabled) playSound.warning();
          return prev;
        }
        return [...prev, { product, quantity, discountPercent: 0 }];
      }
    });

    if (settings.soundEnabled) playSound.beep();
    return true;
  }, [settings.soundEnabled]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          // Check stock limit
          const targetQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: targetQty };
        }
        return item;
      });
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const applyCartDiscount = useCallback((productId: string, discountPercent: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, discountPercent: Math.max(0, Math.min(100, discountPercent)) };
        }
        return item;
      })
    );
  }, []);

  // Checkout transaction
  const checkout = useCallback(async (payload: CheckoutPayload): Promise<Transaction | null> => {
    if (cart.length === 0) return null;

    // Verify stock availability
    for (const item of cart) {
      const liveProduct = products.find((p) => p.id === item.product.id);
      if (!liveProduct || liveProduct.stock < item.quantity) {
        if (settings.soundEnabled) playSound.warning();
        alert(`Stok tidak mencukupi untuk: ${item.product.name} (Tersisa: ${liveProduct ? liveProduct.stock : 0})`);
        return null;
      }
    }

    const nextInvoiceSeq = transactions.length + 1;
    const invoiceNumber = generateInvoiceNumber(nextInvoiceSeq);
    const nowIso = new Date().toISOString();

    const transactionItems = cart.map((item) => {
      const itemSubtotal = item.product.sellPrice * item.quantity;
      const discount = (itemSubtotal * item.discountPercent) / 100;
      return {
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        category: item.product.category,
        buyPrice: item.product.buyPrice,
        sellPrice: item.product.sellPrice,
        quantity: item.quantity,
        unit: item.product.unit,
        discountPercent: item.discountPercent,
        subtotal: itemSubtotal - discount,
      };
    });

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNumber,
      timestamp: nowIso,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerName: payload.customerName || 'Pelanggan Umum',
      customerPhone: payload.customerPhone,
      items: transactionItems,
      subtotal: cartTotal.subtotal,
      discountTotal: cartTotal.discountTotal,
      taxPercent: settings.enableTax ? settings.taxPercent : 0,
      taxAmount: cartTotal.taxAmount,
      total: cartTotal.total,
      totalCost: cartTotal.totalCost,
      grossProfit: cartTotal.total - cartTotal.totalCost,
      paymentMethod: payload.paymentMethod,
      cashReceived: payload.cashReceived,
      cashChange: payload.cashChange,
      qrisRef: payload.qrisRef,
      status: 'completed',
      notes: payload.notes,
    };

    // Prepare stock deductions & mutations
    const newMutations: StockMutation[] = [];
    const updatedProducts = products.map((prd) => {
      const cartItem = cart.find((item) => item.product.id === prd.id);
      if (cartItem) {
        const prevStock = prd.stock;
        const newStock = Math.max(0, prd.stock - cartItem.quantity);

        newMutations.push({
          id: `mut-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          productId: prd.id,
          productName: prd.name,
          sku: prd.sku,
          type: 'sale',
          quantityChange: -cartItem.quantity,
          previousStock: prevStock,
          newStock,
          referenceNumber: invoiceNumber,
          operatorName: `${currentUser.name} (Kasir)`,
          timestamp: nowIso,
          notes: `Penjualan Kasir - Invoice ${invoiceNumber}`,
        });

        return {
          ...prd,
          stock: newStock,
          lastUpdated: nowIso,
        };
      }
      return prd;
    });

    // Update state synchronously
    setProducts(updatedProducts);
    setTransactions((prev) => [newTransaction, ...prev]);
    setMutations((prev) => [...newMutations, ...prev]);

    // Clear cart and setup receipt modal
    setCart([]);
    setLastReceipt(newTransaction);
    if (settings.autoPrintReceipt) {
      setIsReceiptModalOpen(true);
    }

    // Play feedback
    if (settings.soundEnabled) playSound.success();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Confetti fallback
    }

    // Broadcast real-time stock change
    broadcastSync(`Penjualan ${invoiceNumber} berhasil. Stok diperbarui secara real-time.`);

    return newTransaction;
  }, [cart, products, settings, currentUser, transactions.length, cartTotal]);

  // Product & Inventory actions
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'lastUpdated'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };

    const newMutation: StockMutation = {
      id: `mut-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      type: 'restock',
      quantityChange: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      referenceNumber: `INIT-${newProduct.sku}`,
      operatorName: currentUser.name,
      timestamp: new Date().toISOString(),
      notes: 'Pendaftaran barang baru ke gudang',
    };

    setProducts((prev) => [newProduct, ...prev]);
    setMutations((prev) => [newMutation, ...prev]);
    broadcastSync(`Produk baru ditambahkan: ${newProduct.name}`);
    return newProduct;
  }, [currentUser.name]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prd) => {
        if (prd.id === id) {
          return {
            ...prd,
            ...updates,
            lastUpdated: new Date().toISOString(),
          };
        }
        return prd;
      })
    );
    broadcastSync('Informasi produk diperbarui di gudang');
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    broadcastSync('Produk dihapus dari sistem gudang');
  }, []);

  const restockProduct = useCallback((productId: string, quantityToAdd: number, notes?: string, supplier?: string) => {
    if (quantityToAdd <= 0) return;
    const nowIso = new Date().toISOString();

    setProducts((prev) =>
      prev.map((prd) => {
        if (prd.id === productId) {
          const prevStock = prd.stock;
          const newStock = prevStock + quantityToAdd;

          const newMutation: StockMutation = {
            id: `mut-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prd.id,
            productName: prd.name,
            sku: prd.sku,
            type: 'restock',
            quantityChange: quantityToAdd,
            previousStock: prevStock,
            newStock,
            referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
            operatorName: currentUser.name,
            timestamp: nowIso,
            notes: notes || `Restock gudang dari ${supplier || prd.supplier || 'Pemasok'}`,
          };

          setMutations((m) => [newMutation, ...m]);
          return {
            ...prd,
            stock: newStock,
            supplier: supplier || prd.supplier,
            lastUpdated: nowIso,
          };
        }
        return prd;
      })
    );

    if (settings.soundEnabled) playSound.beep();
    broadcastSync(`Restock berhasil: +${quantityToAdd} stok diperbarui.`);
  }, [currentUser.name, settings.soundEnabled]);

  const adjustProductStock = useCallback((productId: string, newStock: number, notes?: string) => {
    const nowIso = new Date().toISOString();

    setProducts((prev) =>
      prev.map((prd) => {
        if (prd.id === productId) {
          const prevStock = prd.stock;
          const diff = newStock - prevStock;

          const newMutation: StockMutation = {
            id: `mut-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prd.id,
            productName: prd.name,
            sku: prd.sku,
            type: 'adjustment',
            quantityChange: diff,
            previousStock: prevStock,
            newStock,
            referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
            operatorName: currentUser.name,
            timestamp: nowIso,
            notes: notes || 'Stock opname / penyesuaian fisik gudang',
          };

          setMutations((m) => [newMutation, ...m]);
          return {
            ...prd,
            stock: newStock,
            lastUpdated: nowIso,
          };
        }
        return prd;
      })
    );

    broadcastSync('Penyesuaian stok opname telah disimpan.');
  }, [currentUser.name]);

  // User Actions
  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setAllUsers((prev) => [...prev, newUser]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  }, [currentUser.id]);

  const updateSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Real-time Multi-device Simulation tool
  const simulateExternalSale = useCallback(() => {
    // Pick a random product with stock > 2
    const available = products.filter((p) => p.stock > 2);
    if (available.length === 0) return;
    const target = available[Math.floor(Math.random() * available.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const nowIso = new Date().toISOString();
    const inv = generateInvoiceNumber(transactions.length + 10);

    const prevStock = target.stock;
    const newStock = prevStock - qty;

    const newTx: Transaction = {
      id: `tx-sim-${Date.now()}`,
      invoiceNumber: inv,
      timestamp: nowIso,
      cashierId: 'usr-2',
      cashierName: 'Kasir 2 (Device Lain)',
      customerName: 'Pelanggan Walk-In',
      items: [
        {
          productId: target.id,
          sku: target.sku,
          name: target.name,
          category: target.category,
          buyPrice: target.buyPrice,
          sellPrice: target.sellPrice,
          quantity: qty,
          unit: target.unit,
          discountPercent: 0,
          subtotal: target.sellPrice * qty,
        },
      ],
      subtotal: target.sellPrice * qty,
      discountTotal: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: target.sellPrice * qty,
      totalCost: target.buyPrice * qty,
      grossProfit: (target.sellPrice - target.buyPrice) * qty,
      paymentMethod: 'qris',
      qrisRef: `QRIS-${Date.now().toString().slice(-6)}`,
      status: 'completed',
      notes: 'Transaksi dari terminal POS lain (Simulasi Sinkronisasi)',
    };

    const newMutation: StockMutation = {
      id: `mut-sim-${Date.now()}`,
      productId: target.id,
      productName: target.name,
      sku: target.sku,
      type: 'sale',
      quantityChange: -qty,
      previousStock: prevStock,
      newStock,
      referenceNumber: inv,
      operatorName: 'Kasir 2 (Device Lain)',
      timestamp: nowIso,
      notes: 'Penjualan di terminal kasir cabang',
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, stock: newStock, lastUpdated: nowIso } : p))
    );
    setTransactions((prev) => [newTx, ...prev]);
    setMutations((prev) => [newMutation, ...prev]);

    setSyncNotification(`Sinkronisasi Real-Time: ${target.name} (-${qty} pcs) terjual di Kasir 2!`);
    if (settings.soundEnabled) playSound.beep();
    setTimeout(() => setSyncNotification(null), 4000);
  }, [products, transactions.length, settings.soundEnabled]);

  const resetToDefault = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMutations(INITIAL_MUTATIONS);
    setSettings(INITIAL_SETTINGS);
    setAllUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCart([]);
    localStorage.clear();
    broadcastSync('Data aplikasi di-reset ke nilai default.');
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        transactions,
        mutations,
        settings,
        currentUser,
        allUsers,
        cart,
        cartTotal,
        lowStockProducts,
        activeTab,
        setActiveTab,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCartDiscount,
        checkout,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustProductStock,
        setCurrentUser,
        addUser,
        updateUser,
        updateSettings,
        lastReceipt,
        setLastReceipt,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        isLowStockDrawerOpen,
        setIsLowStockDrawerOpen,
        isSwitchUserModalOpen,
        setIsSwitchUserModalOpen,
        lastSyncTime,
        syncNotification,
        simulateExternalSale,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
