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
  cafe_id?: string; // TAMBAHAN: Simpan ID Kafe
  createdAt: Date;
}

interface LoginResponse {
  status: 'success' | 'error';
  user: {
    id: string;
    name: string;
    email: string;
    role: 'kasir' | 'supervisor' | 'manager';
    cafe_id?: string; // TAMBAHAN: Terima ID Kafe dari API
  };
  token: string;
  detail?: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthUser> => {
    const data = await api.post<LoginResponse>('/api/auth/login', payload);

    if (data.status !== 'success' || !data.user) {
      throw new Error('Respons data dari server tidak valid.');
    }

    if (data.user.role !== 'manager') {
      throw new Error('Hanya akun dengan role manager yang dapat mengakses website ini.');
    }

    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }

    // Return authenticated user beserta cafe_id
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      cafe_id: data.user.cafe_id, // TAMBAHAN: Teruskan ke store
      createdAt: new Date(),
    };
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
};