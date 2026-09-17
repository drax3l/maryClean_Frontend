import React, { useState } from "react";
import { configuracionService } from "./configuracionService";
import toast from "react-hot-toast";
import { X, Plus, Package } from "lucide-react";

interface ModalNuevaPrendaProps {
  onClose: () => void;
  onUpdate: () => void;
}

const SERVICIOS = ["Lavado Simple", "Lavado y Planchado", "Lavado en Seco", "Planchado Especial"];

export const ModalNuevaPrenda: React.FC<ModalNuevaPrendaProps> = ({ onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombrePrenda: "",
    precio: "",
    servicio: "Lavado Simple"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombrePrenda.trim()) { toast.error("El nombre es requerido."); return; }
    
    const val = parseFloat(formData.precio);
    if (isNaN(val) || val <= 0) { toast.error("Ingresa un precio válido."); return; }

    setSubmitting(true);
    try {
      await configuracionService.agregarPrenda({
        nombrePrenda: formData.nombrePrenda,
        precio: val,
        servicio: formData.servicio,
        estado: 1
      });
      toast.success("Prenda agregada al tarifario.");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Error al agregar prenda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-main text-lg">Nueva Prenda</h3>
              <p className="text-sm text-gray-500">Añadir al Tarifario de Servicios</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50/50">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Prenda</label>
            <input 
              type="text" 
              value={formData.nombrePrenda} 
              onChange={e => setFormData({...formData, nombrePrenda: e.target.value})} 
              className="input-field" 
              placeholder="Ej. Sábanas King"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio (S/)</label>
              <input 
                type="number" 
                step="0.10"
                min="0.10"
                value={formData.precio} 
                onChange={e => setFormData({...formData, precio: e.target.value})} 
                className="input-field" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
              <select 
                value={formData.servicio}
                onChange={e => setFormData({...formData, servicio: e.target.value})}
                className="input-field"
              >
                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700">
              <Plus size={16} /> {submitting ? "Guardando..." : "Crear Prenda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
