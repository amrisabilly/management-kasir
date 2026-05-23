'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { StockOpname, StockOpnameItem, Ingredient } from '@/types';
import { formatDate, formatCurrency, exportToExcel, exportToPDF } from '@/lib/utils';
// IMPORT API SERVICE ANDA (Sesuaikan path-nya)
import { api } from '@/services/api'; 

export default function StockOpnamePage() {
  const [stockOpnameList, setStockOpnameList] = useState<StockOpname[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk menarik data Bahan Baku dari Database (FastAPI)
  const handleCreateStockOpname = async () => {
    setIsCreating(true);
    setIsLoading(true);

    try {
      // NANTI AKTIFKAN KODE INI JIKA ENDPOINT FASTAPI SUDAH SIAP
      // const response = await api.get('/api/ingredients');
      // const ingredientsData: Ingredient[] = response.data;

      // SEMENTARA MENGGUNAKAN DATA DUMMY BAHAN BAKU
      const ingredientsData: Ingredient[] = [
        { id: 'ing-1', name: 'Biji Kopi Arabika', stock: 2500, unit: 'gram', cost: 150 },
        { id: 'ing-2', name: 'Susu Segar Diamond', stock: 5000, unit: 'ml', cost: 20 },
        { id: 'ing-3', name: 'Gula Aren Cair', stock: 1500, unit: 'ml', cost: 25 },
        { id: 'ing-4', name: 'Gelas Plastik', stock: 150, unit: 'pcs', cost: 500 },
      ];

      const newItems: StockOpnameItem[] = ingredientsData.map((ing) => ({
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        systemStock: ing.stock,
        physicalStock: ing.stock, // Default disamakan dulu
        difference: 0,
        cost: ing.cost || 0,
      }));

      const totalValue = newItems.reduce((sum, item) => sum + item.physicalStock * item.cost, 0);

      const newStockOpname: StockOpname = {
        id: `SO-${Date.now()}`,
        date: new Date(),
        products: newItems,
        totalValue,
        notes: '',
      };

      // Tambahkan ke paling atas
      setStockOpnameList([newStockOpname, ...stockOpnameList]);
    } catch (error) {
      console.error("Gagal mengambil data bahan baku:", error);
      alert("Gagal memuat data bahan baku dari server.");
    } finally {
      setIsCreating(false);
      setIsLoading(false);
    }
  };

  // Fungsi saat Manager mengetik angka stok fisik (Bisa Desimal)
  const handleUpdatePhysicalStock = (
    stockOpnameId: string,
    ingredientId: string,
    physicalStock: number
  ) => {
    setStockOpnameList(
      stockOpnameList.map((so) =>
        so.id === stockOpnameId
          ? {
              ...so,
              products: so.products.map((item) =>
                item.ingredientId === ingredientId
                  ? {
                      ...item,
                      physicalStock,
                      difference: physicalStock - item.systemStock,
                    }
                  : item
              ),
              // Hitung ulang total nilai uangnya
              totalValue: so.products.reduce((sum, item) => {
                if (item.ingredientId === ingredientId) {
                  return sum + physicalStock * item.cost;
                }
                return sum + item.physicalStock * item.cost;
              }, 0),
            }
          : so
      )
    );
  };

  // Fungsi untuk menyimpan perubahan ke Database
  const handleSaveToDatabase = async (so: StockOpname) => {
    try {
      alert(`Menyimpan data SO ${so.id} ke database... \n(Endpoint FastAPI belum aktif)`);
      // NANTI AKTIFKAN KODE INI:
      // await api.post('/api/stock-opname/save', {
      //   stock_opname_id: so.id,
      //   notes: so.notes,
      //   items: so.items.map(i => ({
      //     ingredient_id: i.ingredientId,
      //     physical_stock: i.physicalStock
      //   }))
      // });
      // alert('Stok Opname berhasil disimpan dan stok sistem telah diperbarui!');
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan ke database');
    }
  };

  // ... (Fungsi handleExportExcel dan handleExportPDF sama, cukup ganti .products jadi .items dan productName jadi ingredientName) ...

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Stok Opname (Gudang)</h1>
          <p className="text-gray-600 mt-1">Verifikasi stok fisik bahan baku dengan sistem</p>
        </div>
        {!isCreating && (
          <button
            onClick={handleCreateStockOpname}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
            Tarik Data Bahan Baku
          </button>
        )}
      </div>

      <div className="space-y-6">
        {stockOpnameList.map((so) => (
          <div key={so.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Draft Opname: {so.id}</h2>
                  <p className="text-blue-100 mt-1">Tanggal: {formatDate(so.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Estimasi Nilai Aset</p>
                  <p className="text-2xl font-bold">{formatCurrency(so.totalValue)}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Bahan Baku</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Satuan</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Sistem</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Fisik (Real)</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Selisih</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {so.products.map((item, idx) => (
                    <tr key={item.ingredientId} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{item.ingredientName}</p>
                        <p className="text-xs text-gray-500">ID: {item.ingredientId}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                        {item.systemStock}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          step="0.01" // PENTING: Izinkan input desimal (misal: 10.5 gram)
                          value={item.physicalStock}
                          onChange={(e) => handleUpdatePhysicalStock(so.id, item.ingredientId, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className={`font-semibold ${item.difference === 0 ? 'text-gray-800' : item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.difference === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <Check size={14} /> Cocok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            <AlertTriangle size={14} /> Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Audit</label>
                <textarea
                  value={so.notes}
                  onChange={(e) => setStockOpnameList(stockOpnameList.map(item => item.id === so.id ? { ...item, notes: e.target.value } : item))}
                  placeholder="Misal: Biji kopi tumpah 100 gram saat shift pagi..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleSaveToDatabase(so)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} /> Simpan ke Database
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}