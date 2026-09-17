import React, { useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { authService } from './authService';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitización básica: quitar espacios en blanco al inicio/final
    const cleanUsername = credentials.username.trim();
    const cleanPassword = credentials.password.trim();

    if (!cleanUsername || !cleanPassword) {
      toast.error('El usuario y la contraseña no pueden estar vacíos.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Conexión real a la API de CodeIgniter 4
      const response = await authService.login({
        username: cleanUsername,
        password: cleanPassword
      });

      if (response.success) {
        // Guardamos el token y datos del usuario en el estado global (Zustand)
        login(response.data.empleado, response.data.token);
        toast.success(response.message || 'Bienvenido de nuevo');
      }
    } catch (error: any) {
      // Manejo de excepciones desde CI4 (Ej: 401 Credenciales incorrectas)
      const errorMsg = error.response?.data?.message || 'Error de conexión con el servidor.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-sm mx-auto p-8 border-t-4 border-brand-cyan shadow-xl">
      <div className="flex justify-center mb-4">
        {/* Logo Placeholder */}
        <div className="w-20 h-20 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm">
          <span className="text-brand-main font-bold text-sm text-center">MaryClean</span>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-brand-main">Bienvenido de nuevo</h2>
        <p className="text-sm text-brand-muted mt-1">Inicia sesión para gestionar la lavandería</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-2 uppercase tracking-wide">
            <User size={14} /> Usuario
          </label>
          <input 
            type="text" 
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="input-field w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-shadow" 
            placeholder="Ej: admin" 
            required 
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-2 uppercase tracking-wide">
            <Lock size={14} /> Contraseña
          </label>
          <input 
            type="password" 
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="input-field w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-shadow" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full mt-2 bg-brand-cyan hover:bg-teal-400 text-brand-main font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
        >
          {isLoading ? (
            <span className="animate-pulse">Autenticando...</span>
          ) : (
            'Ingresar al Sistema'
          )}
        </button>
      </form>
    </div>
  );
};
