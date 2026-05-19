'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  // Mengosongkan nilai default agar user mengisi mandiri, atau Anda bisa pasang kredensial uji coba Anda
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Menghubungkan ke endpoint FastAPI yang telah Anda buat
      // Jika sudah dideploy, ganti 'http://localhost:8000' dengan URL API Produksi Anda
      const response = await fetch('https://fastapi-kasir.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Jika FastAPI merespon dengan error (status code selain 2xx)
      if (!response.ok) {
        throw new Error(data.detail || 'Email atau password salah');
      }

      // Pastikan format response dari FastAPI sesuai sebelum dimasukkan ke state
      if (data.status === 'success' && data.user) {
        // Cek apakah user memiliki role manager
        if (data.user.role !== 'manager') {
          throw new Error('Hanya akun dengan role manager yang dapat mengakses website ini.');
        }

        const authenticatedUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          createdAt: new Date(),
        };

        // Simpan JWT access token dari Supabase ke localStorage untuk request data masa mendatang
        if (data.token) {
          localStorage.setItem('access_token', data.token);
        }

        // Panggil fungsi login dari Zustand untuk menyimpan session secara global
        login(authenticatedUser);
        
        // Pindahkan halaman ke Dashboard utama
        router.push('/dashboard');
      } else {
        setError('Respons data dari server tidak valid.');
      }
    } catch (err: any) {
      // Mengambil pesan error dari backend FastAPI atau masalah jaringan offline
      setError(err.message || 'Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <div className="text-2xl font-bold text-blue-600">₹</div>
          </div>
          <h1 className="text-4xl font-bold text-white">Manager Kasir</h1>
          <p className="text-blue-100 mt-2">Sistem Manajemen Penjualan</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors duration-200 shadow-md"
            >
              {loading ? 'Memproses Autentikasi...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-8">
          © 2026 Manager Kasir. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}