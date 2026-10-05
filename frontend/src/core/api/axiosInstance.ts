import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Conexión directa al backend en producción (Render)
// CORS habilitado en el backend con CORS_ORIGINS=* — no necesita proxy
export const api = axios.create({
  baseURL: 'https://maryclean-backend.onrender.com/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para inyectar el Token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag para evitar múltiples toasts de "sesión expirada" simultáneos
let isLoggingOut = false;

// Interceptor para manejar errores globales (ej: Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      useAuthStore.getState().logout();
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      // Resetear el flag después de un breve delay para permitir futuros logouts reales
      setTimeout(() => { isLoggingOut = false; }, 2000);
    }
    return Promise.reject(error);
  }
);

