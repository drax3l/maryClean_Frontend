import { api } from '@/core/api/axiosInstance';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    empleado: {
      id: number;
      nombres: string;
      rol: 'admin' | 'cajero' | 'recepcionista';
      sucursal: string;
    }
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }
};
