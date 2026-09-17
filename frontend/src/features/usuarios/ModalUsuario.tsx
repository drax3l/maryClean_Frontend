import React, { useState } from "react";
import { usuariosService, EmpleadoCrearPayload } from "./usuariosService";
import toast from "react-hot-toast";
import { X, UserPlus, Save } from "lucide-react";

interface ModalUsuarioProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const ModalUsuario: React.FC<ModalUsuarioProps> = ({ onClose, onUpdate }) => {
  const [formData, setFormData] = useState<EmpleadoCrearPayload>({
    nombres: "",
    username: "",
    password: "",
    rol: "cajero",
    idSucursal: 1, // Por defecto
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.username || !formData.password) {
      toast.error("Llena todos los campos requeridos.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await usuariosService.crear(formData);
      toast.success("Usuario creado exitosamente.");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-main text-lg">Nuevo Empleado</h3>
              <p className="text-sm text-gray-500">Crear accesos al sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombres Completos</label>
            <input 
              type="text" 
              value={formData.nombres} 
              onChange={e => setFormData({...formData, nombres: e.target.value})} 
              className="input-field bg-white" 
              placeholder="Ej. Juan Pérez"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Usuario</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="input-field bg-white" 
                placeholder="jperez"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="input-field bg-white" 
                placeholder="******"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol Asignado</label>
            <select 
              value={formData.rol}
              onChange={e => setFormData({...formData, rol: e.target.value as any})}
              className="input-field bg-white"
            >
              <option value="cajero">Cajero</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {submitting ? "Creando..." : "Crear Empleado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
