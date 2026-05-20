// src/services/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fastapi-kasir.vercel.app";

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ambil token dari localStorage atau state management Anda
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as { detail?: string }).detail || "Terjadi kesalahan pada server");
  }

  return response.json();
}

export const api = {
  get: <T,>(endpoint: string) => fetchWithAuth<T>(endpoint, { method: "GET" }),
  post: <T,>(endpoint: string, body: unknown) => fetchWithAuth<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T,>(endpoint: string, body: unknown) => fetchWithAuth<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T,>(endpoint: string) => fetchWithAuth<T>(endpoint, { method: "DELETE" }),
};