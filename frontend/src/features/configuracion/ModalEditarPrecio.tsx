import React, { useState } from "react";
import { configuracionService, PrendaCatalogo } from "./configuracionService";
import toast from "react-hot-toast";
import { X, Save, Edit3 } from "lucide-react";

interface ModalEditarPrecioProps {
  prenda: PrendaCatalogo;
  onClose: () => void;
  onUpdate: () => void;
}

export const ModalEditarPrecio: React.FC<ModalEditarPrecioProps> = ({ prenda, onClose, onUpdate }) => {
  const [precio, setPrecio] = useState(prenda.precio.toString());
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(precio);
    if (isNaN(val) || val <= 0) {
      toast.error("Ingresa un precio válido mayor a 0.");
      return;
    }

    setSubmitting(true);
    try {
      await configuracionService.actualizarPrecio(prenda.idPrenda, val);
      toast.success("Precio actualizado exitosamente.");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar precio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-brand-primary rounded-xl">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-main text-lg">Editar Precio</h3>
              <p className="text-sm text-gray-500">{prenda.nombrePrenda}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nuevo Precio Unitario (S/)</label>
            <input 
              type="number" 
              step="0.10"
              min="0.10"
              value={precio} 
              onChange={e => setPrecio(e.target.value)} 
              className="input-field font-bold text-lg text-brand-main" 
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Save size={16} /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
