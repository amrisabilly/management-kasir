// src/services/authService.ts
import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'kasir' | 'supervisor' | 'manager';
  createdAt: Date;
}

interface LoginResponse {
  status: 'success' | 'error';
  user: {
    id: string;
    name: string;
    email: string;
    role: 'kasir' | 'supervisor' | 'manager';
  };
  token: string;
  detail?: string;
}

export const authService = {
  /**
   * Login dengan email dan password
   */
  login: async (payload: LoginPayload): Promise<AuthUser> => {
    const data = await api.post<LoginResponse>('/api/auth/login', payload);

    // Validasi response structure
    if (data.status !== 'success' || !data.user) {
      throw new Error('Respons data dari server tidak valid.');
    }

    // Validasi role manager
    if (data.user.role !== 'manager') {
      throw new Error('Hanya akun dengan role manager yang dapat mengakses website ini.');
    }

    // Simpan token ke localStorage
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }

    // Return authenticated user
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      createdAt: new Date(),
    };
  },

  /**
   * Logout - hapus token dari localStorage
   */
  logout: (): void => {
    localStorage.removeItem('access_token');
  },

  /**
   * Get token dari localStorage
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
};
