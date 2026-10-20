import { Product, Transaction } from '../types';
import { formatDateIndo } from './formatters';

export function exportTransactionsToCSV(transactions: Transaction[], fileName = 'Laporan-Penjualan-POS.csv') {
  const headers = [
    'No Invoice',
    'Tanggal Transaksi',
    'Kasir',
    'Pelanggan',
    'Metode Bayar',
    'Status',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'PPN (Rp)',
    'Total Belanja (Rp)',
    'Total Modal (HPP)',
    'Laba Kotor (Rp)',
    'Rincian Barang',
  ];

  const rows = transactions.map((tx) => {
    const itemDetails = tx.items
      .map((item) => `${item.name} (${item.quantity} ${item.unit} @ Rp${item.sellPrice})`)
      .join('; ');

    return [
      `"${tx.invoiceNumber}"`,
      `"${formatDateIndo(tx.timestamp)}"`,
      `"${tx.cashierName}"`,
      `"${tx.customerName || '-'}"`,
      `"${tx.paymentMethod.toUpperCase()}"`,
      `"${tx.status === 'completed' ? 'Selesai' : 'Batal'}"`,
      tx.subtotal,
      tx.discountTotal,
      tx.taxAmount,
      tx.total,
      tx.totalCost,
      tx.grossProfit,
      `"${itemDetails.replace(/"/g, '""')}"`,
    ].join(',');
  });

  // UTF-8 BOM for Microsoft Excel compatibility (\uFEFF)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryToCSV(products: Product[], fileName = 'Laporan-Stok-Gudang.csv') {
  const headers = [
    'Barcode / SKU',
    'Nama Produk',
    'Kategori',
    'Satuan',
    'Harga Modal (Rp)',
    'Harga Jual (Rp)',
    'Margin Keuntungan (Rp)',
    'Stok Saat Ini',
    'Batas Minimum Stok',
    'Status Stok',
    'Total Nilai Aset (Rp)',
    'Suplier',
    'Update Terakhir',
  ];

  const rows = products.map((prd) => {
    const margin = prd.sellPrice - prd.buyPrice;
    const assetValue = prd.stock * prd.buyPrice;
    let status = 'Aman';
    if (prd.stock === 0) status = 'Habis';
    else if (prd.stock <= prd.minStock) status = 'Menipis';

    return [
      `"${prd.sku}"`,
      `"${prd.name.replace(/"/g, '""')}"`,
      `"${prd.category}"`,
      `"${prd.unit}"`,
      prd.buyPrice,
      prd.sellPrice,
      margin,
      prd.stock,
      prd.minStock,
      `"${status}"`,
      assetValue,
      `"${(prd.supplier || '-').replace(/"/g, '""')}"`,
      `"${formatDateIndo(prd.lastUpdated)}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
