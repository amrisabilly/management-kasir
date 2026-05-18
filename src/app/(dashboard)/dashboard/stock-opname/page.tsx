'use client';

import { useState } from 'react';
import { Plus, Save, AlertTriangle, Check } from 'lucide-react';
import { mockProducts, mockStockOpname } from '@/lib/mockData';
import { StockOpname, StockOpnameItem } from '@/types';
import { formatDate, formatCurrency, exportToExcel, exportToPDF } from '@/lib/utils';

export default function StockOpnamePage() {
  const [stockOpnameList, setStockOpnameList] = useState<StockOpname[]>([mockStockOpname]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStockOpname = () => {
    const newItems: StockOpnameItem[] = mockProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      systemStock: product.stock,
      physicalStock: product.stock,
      difference: 0,
      cost: product.cost,
    }));

    const totalValue = newItems.reduce((sum, item) => {
      return sum + item.physicalStock * item.cost;
    }, 0);

    const newStockOpname: StockOpname = {
      id: `so-${Date.now()}`,
      date: new Date(),
      products: newItems,
      totalValue,
      notes: '',
    };

    setStockOpnameList([...stockOpnameList, newStockOpname]);
    setIsCreating(false);
  };

  const handleUpdatePhysicalStock = (
    stockOpnameId: string,
    productId: string,
    physicalStock: number
  ) => {
    setStockOpnameList(
      stockOpnameList.map((so) =>
        so.id === stockOpnameId
          ? {
              ...so,
              products: so.products.map((item) =>
                item.productId === productId
                  ? {
                      ...item,
                      physicalStock,
                      difference: physicalStock - item.systemStock,
                    }
                  : item
              ),
              totalValue: so.products.reduce((sum, item) => {
                if (item.productId === productId) {
                  return sum + physicalStock * item.cost;
                }
                return sum + item.physicalStock * item.cost;
              }, 0),
            }
          : so
      )
    );
  };

  const handleExportExcel = (so: StockOpname) => {
    const data = so.products.map((item) => ({
      'Kode Produk': item.productId,
      'Nama Produk': item.productName,
      'Stok Sistem': item.systemStock,
      'Stok Fisik': item.physicalStock,
      'Selisih': item.difference,
      'Harga Pokok': formatCurrency(item.cost),
      'Total Nilai': formatCurrency(item.physicalStock * item.cost),
    }));

    exportToExcel(data, `StokOpname_${formatDate(so.date)}`);
  };

  const handleExportPDF = (so: StockOpname) => {
    const data = so.products.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      systemStock: item.systemStock,
      physicalStock: item.physicalStock,
      difference: item.difference,
      cost: item.cost,
    }));

    exportToPDF(
      data,
      `Laporan_Stok_Opname_${formatDate(so.date)}`,
      ['productId', 'productName', 'systemStock', 'physicalStock', 'difference']
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Stok Opname</h1>
          <p className="text-gray-600 mt-1">Kelola dan verifikasi stok barang</p>
        </div>
        {!isCreating && (
          <button
            onClick={handleCreateStockOpname}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Buat Stok Opname
          </button>
        )}
      </div>

      {/* Stock Opname List */}
      <div className="space-y-6">
        {stockOpnameList.map((so) => (
          <div key={so.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Stok Opname - {so.id}</h2>
                  <p className="text-blue-100 mt-1">Tanggal: {formatDate(so.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Total Nilai Stok</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(so.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Produk</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Stok Sistem
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Stok Fisik
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Selisih
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">
                      Total Nilai
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {so.products.map((item, idx) => (
                    <tr
                      key={item.productId}
                      className={`border-b border-gray-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">{item.productId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-gray-800 font-semibold">
                          {item.systemStock}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={item.physicalStock}
                          onChange={(e) =>
                            handleUpdatePhysicalStock(
                              so.id,
                              item.productId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p
                          className={`font-semibold ${
                            item.difference === 0
                              ? 'text-gray-800'
                              : item.difference > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                        {formatCurrency(item.physicalStock * item.cost)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.difference === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <Check size={14} />
                            Cocok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            <AlertTriangle size={14} />
                            Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions and Notes */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  value={so.notes}
                  onChange={(e) => {
                    // Update notes
                    setStockOpnameList(
                      stockOpnameList.map((item) =>
                        item.id === so.id
                          ? { ...item, notes: e.target.value }
                          : item
                      )
                    );
                  }}
                  placeholder="Tambahkan catatan tentang stok opname..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExportExcel(so)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExportPDF(so)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Export PDF
                </button>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors ml-auto">
                  <Save size={20} />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Total Stok Opname</p>
          <p className="text-3xl font-bold text-gray-800">{stockOpnameList.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Total Nilai Stok</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(
              stockOpnameList.reduce((sum, so) => sum + so.totalValue, 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Total Selisih Item</p>
          <p className="text-3xl font-bold text-red-600">
            {stockOpnameList.reduce(
              (sum, so) =>
                sum +
                so.products.filter((item) => item.difference !== 0).length,
              0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
