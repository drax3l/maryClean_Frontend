import React, { useState } from "react";
import { usuariosService, Empleado } from "./usuariosService";
import toast from "react-hot-toast";
import { X, Key, Save } from "lucide-react";

interface ModalEditPasswordProps {
  empleado: Empleado;
  onClose: () => void;
}

export const ModalEditPassword: React.FC<ModalEditPasswordProps> = ({ empleado, onClose }) => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await usuariosService.cambiarPassword(empleado.idEmpleado, password);
      toast.success("Contraseña actualizada exitosamente.");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-500 rounded-xl">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-main text-lg">Cambiar Clave</h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">@{empleado.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="input-field bg-white" 
              placeholder="Nueva contraseña (min. 6 char)"
              autoFocus
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {submitting ? "Guardando..." : "Guardar Clave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
