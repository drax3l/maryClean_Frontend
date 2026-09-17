import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nombres: string;
  rol: 'admin' | 'cajero' | 'recepcionista';
  sucursal: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

/**
 * Decodifica el payload de un JWT sin librerías externas.
 * Retorna null si el token es inválido.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Verifica si un JWT ha expirado (o expirará en los próximos 30 segundos).
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true; // Sin exp = inválido
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + 30; // 30s de margen
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
    }),
    {
      name: 'maryclean-auth',
      // Al rehidratar del localStorage, verificar si el token sigue siendo válido
      onRehydrateStorage: () => (state) => {
        if (state?.token && isTokenExpired(state.token)) {
          // Token expirado → limpiar sesión silenciosamente
          state.logout();
        }
      },
    }
  )
);
