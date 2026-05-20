// src/services/userService.ts
import { api } from "./api";

export interface UserPayload {
  email?: string;
  password?: string;
  username?: string;
  full_name?: string;
  role?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  username: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  detail?: string;
}

export interface CreateUserResponse {
  user_id: string;
}

export const userService = {
  // GET /api/users
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<ApiResponse<Employee[]>>("/api/users");
    return response.data;
  },

  // POST /create-user
  createEmployee: async (data: UserPayload): Promise<CreateUserResponse> => {
    const response = await api.post<ApiResponse<CreateUserResponse>>("/create-user", data);
    return response.data;
  },

  // PUT /api/users/{id}
  updateEmployee: async (userId: string, data: UserPayload): Promise<void> => {
    await api.put<ApiResponse<unknown>>(`/api/users/${userId}`, data);
  },

  // DELETE /api/users/{id}
  deleteEmployee: async (userId: string): Promise<void> => {
    await api.delete<ApiResponse<unknown>>(`/api/users/${userId}`);
  }
};