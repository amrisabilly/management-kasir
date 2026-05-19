'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import { mockCashiers } from '@/lib/mockData';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState<User[]>(mockCashiers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'kasir' as const,
  });

  const handleAddCashier = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing
      setCashiers(
        cashiers.map((c) =>
          c.id === editingId
            ? { ...c, name: formData.name, email: formData.email }
            : c
        )
      );
      setEditingId(null);
    } else {
      // Add new
      const newCashier: User = {
        id: `cashier-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: 'kasir',
        createdAt: new Date(),
      };
      setCashiers([...cashiers, newCashier]);
    }

    setFormData({ name: '', email: '', role: 'kasir' });
    setShowForm(false);
  };

  const handleEdit = (cashier: User) => {
    setFormData({ name: cashier.name, email: cashier.email, role: 'kasir' });
    setEditingId(cashier.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kasir ini?')) {
      setCashiers(cashiers.filter((c) => c.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'kasir' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Kasir</h1>
          <p className="text-gray-600 mt-1">Kelola data kasir dan akun mereka</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Tambah Kasir
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingId ? 'Edit Kasir' : 'Tambah Kasir Baru'}
          </h2>
          <form onSubmit={handleAddCashier} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Kasir
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama kasir"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Masukkan email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Kasir'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cashiers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Bergabung</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.map((cashier, idx) => (
                <tr
                  key={cashier.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {cashier.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-gray-800">{cashier.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {cashier.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize flex items-center gap-1 w-fit">
                      <Shield size={14} />
                      {cashier.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(cashier.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cashier)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cashier.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cashiers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data kasir
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Total Kasir</p>
          <p className="text-3xl font-bold text-gray-800">{cashiers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Kasir Aktif</p>
          <p className="text-3xl font-bold text-green-600">{cashiers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm mb-2">Kasir Baru Bulan Ini</p>
          <p className="text-3xl font-bold text-blue-600">
            {cashiers.filter(
              (c) => new Date().getMonth() === c.createdAt.getMonth()
            ).length}
          </p>
        </div>
      </div>
    </div>
  );
}
