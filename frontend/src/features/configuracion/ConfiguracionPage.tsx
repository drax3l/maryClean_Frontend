import React, { useState, useEffect } from "react";
import { configuracionService, DatosLavanderia, PrendaCatalogo } from "./configuracionService";
import { ModalNuevaPrenda } from "./ModalNuevaPrenda";
import { ModalEditarPrecio } from "./ModalEditarPrecio";
import toast from "react-hot-toast";
import { Settings, Store, Tag, Plus, Edit3, Power, PowerOff } from "lucide-react";

export const ConfiguracionPage: React.FC = () => {
  const [datos, setDatos] = useState<DatosLavanderia>({ nombre: "", direccion: "", telefono: "" });
  const [catalogo, setCatalogo] = useState<PrendaCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingDatos, setSavingDatos] = useState(false);

  // Modales
  const [showNuevaPrenda, setShowNuevaPrenda] = useState(false);
  const [prendaAEditar, setPrendaAEditar] = useState<PrendaCatalogo | null>(null);
  const [tabActivo, setTabActivo] = useState<"activos" | "inactivos">("activos");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        configuracionService.getDatosLavanderia(),
        configuracionService.getCatalogo()
      ]);
      setDatos(d);
      setCatalogo(c);
    } catch (error) {
      toast.error("Error al cargar configuración.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDatos(true);
    try {
      await configuracionService.guardarDatosLavanderia(datos);
      toast.success("Datos de la lavandería actualizados.");
    } catch (error) {
      toast.error("Error al guardar datos.");
    } finally {
      setSavingDatos(false);
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: 1 | 0) => {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    try {
      await configuracionService.cambiarEstadoPrenda(id, nuevoEstado);
      fetchData();
      toast.success(`Prenda marcada como ${nuevoEstado === 1 ? 'Activa' : 'Inactiva'}`);
    } catch (error) {
      toast.error("Error al cambiar estado.");
    }
  };

  // Eliminamos el spinner global que causaba el error de Joyride

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-brand-main flex items-center gap-2">
          <Settings size={24} className="text-brand-primary" /> Configuración del Sistema
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Datos de la Empresa */}
        <div className="lg:col-span-1 space-y-6 joyride-config-datos">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-brand-main flex items-center gap-2 mb-6">
              <Store size={18} /> Datos de la Lavandería
            </h2>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-lg"></div>
                <div className="h-10 bg-gray-100 rounded-lg"></div>
                <div className="h-10 bg-gray-100 rounded-lg"></div>
                <div className="h-10 bg-gray-100 rounded-lg mt-2"></div>
              </div>
            ) : (
            <form onSubmit={handleSaveDatos} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Comercial</label>
                <input 
                  type="text" 
                  value={datos.nombre} 
                  onChange={e => setDatos({...datos, nombre: e.target.value})} 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dirección Física</label>
                <input 
                  type="text" 
                  value={datos.direccion} 
                  onChange={e => setDatos({...datos, direccion: e.target.value})} 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  value={datos.telefono} 
                  onChange={e => setDatos({...datos, telefono: e.target.value})} 
                  className="input-field" 
                />
              </div>
              <button 
                type="submit" 
                disabled={savingDatos}
                className="w-full btn-primary bg-blue-500 hover:bg-blue-600 mt-2"
              >
                {savingDatos ? "Actualizando..." : "Actualizar Información"}
              </button>
            </form>
            )}
          </div>
        </div>

        {/* Lado Derecho: Tarifario */}
        <div className="lg:col-span-2 joyride-config-tarifario">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-brand-main flex items-center gap-2">
                <Tag size={18} /> Tarifario de Servicios
              </h2>
              <button 
                onClick={() => setShowNuevaPrenda(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors joyride-config-nuevo"
              >
                <Plus size={16} /> Nueva Prenda
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 bg-gray-50 p-1 rounded-xl w-fit joyride-config-tabs">
              <button
                onClick={() => setTabActivo("activos")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tabActivo === "activos"
                    ? "bg-white text-brand-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Activos ({catalogo.filter(p => p.estado === 1).length})
              </button>
              <button
                onClick={() => setTabActivo("inactivos")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tabActivo === "inactivos"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Inactivos ({catalogo.filter(p => p.estado === 0).length})
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-bg text-brand-muted text-left uppercase text-[10px] tracking-wider">
                    <th className="px-4 py-3 font-semibold">Tipo de Prenda</th>
                    <th className="px-4 py-3 font-semibold text-right">Precio Unitario</th>
                    <th className="px-4 py-3 font-semibold text-center">Estado</th>
                    <th className="px-4 py-3 font-semibold text-right joyride-config-acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-8 bg-gray-100 rounded"></div></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                        <td className="px-4 py-3"><div className="h-6 bg-gray-100 rounded-full w-12 mx-auto"></div></td>
                        <td className="px-4 py-3"><div className="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : (() => {
                    const filtrados = catalogo.filter(p => p.estado === (tabActivo === "activos" ? 1 : 0));
                    
                    if (filtrados.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                            No hay servicios {tabActivo} registrados.
                          </td>
                        </tr>
                      );
                    }

                    return filtrados.map((prenda: typeof catalogo[0]) => (
                      <tr key={prenda.idPrenda} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-brand-main">{prenda.nombrePrenda}</div>
                          <div className="text-xs text-gray-400">{prenda.servicio}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand-primary">
                          S/ {prenda.precio.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${prenda.estado === 1 ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                            {prenda.estado === 1 ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              title="Editar Precio"
                              onClick={() => setPrendaAEditar(prenda)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              title={prenda.estado === 1 ? "Desactivar" : "Activar"}
                              onClick={() => handleToggleEstado(prenda.idPrenda, prenda.estado)}
                              className={`p-1.5 rounded-lg transition-colors ${prenda.estado === 1 ? "text-red-400 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                            >
                              {prenda.estado === 1 ? <PowerOff size={16} /> : <Power size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-gray-400 mt-3 text-center">
              * Los cambios en los precios afectarán solo a los nuevos pedidos registrados a partir de ahora.
            </p>
          </div>
        </div>
      </div>

      {showNuevaPrenda && (
        <ModalNuevaPrenda onClose={() => setShowNuevaPrenda(false)} onUpdate={fetchData} />
      )}

      {prendaAEditar && (
        <ModalEditarPrecio prenda={prendaAEditar} onClose={() => setPrendaAEditar(null)} onUpdate={fetchData} />
      )}

    </div>
  );
};
