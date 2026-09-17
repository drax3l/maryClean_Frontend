import React, { useState, useEffect, useRef, useCallback } from "react";
import { clientesService, Cliente } from "@/features/pedidos/clientesService";
import { ModalHistorialCliente } from "./ModalHistorialCliente";
import { ModalEditarCliente } from "./ModalEditarCliente";
import toast from "react-hot-toast";
import { Search, UserPlus, History, Edit3, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Modales
  const [clienteHistorial, setClienteHistorial] = useState<Cliente | null>(null);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClientes = useCallback(async (busqueda: string) => {
    setLoading(true);
    try {
      const data = await clientesService.getAll({ q: busqueda });
      setClientes(data.clientes);
      setTotal(data.paginacion.total);
    } catch {
      toast.error("Error al cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes("");
  }, [fetchClientes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClientes(val);
    }, 400); // 400ms debounce
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-main flex items-center gap-2">
          <Users size={24} className="text-brand-primary" /> Gestión de Clientes
        </h1>
        <p className="text-sm text-gray-400 mt-1">Busca clientes, actualiza su información y revisa su historial de pedidos.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96 joyride-clientes-busqueda">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            value={q}
            onChange={handleSearchChange}
            className="w-full bg-gray-50 border border-gray-200 text-brand-main text-sm rounded-xl focus:ring-brand-primary focus:border-brand-primary block pl-10 p-2.5 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => navigate("/registrar-pedido")} 
          className="btn-primary flex items-center gap-2 whitespace-nowrap w-full sm:w-auto joyride-clientes-agregar"
        >
          <UserPlus size={18} /> Registrar Nuevo Cliente
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden joyride-clientes-tabla">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-left uppercase text-xs tracking-wider">
                <th className="px-5 py-4 font-semibold">Cliente</th>
                <th className="px-5 py-4 font-semibold">DNI / Documento</th>
                <th className="px-5 py-4 font-semibold">Teléfono</th>
                <th className="px-5 py-4 font-semibold">Dirección</th>
                <th className="px-5 py-4 font-semibold text-right joyride-clientes-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    <Users size={48} className="mx-auto text-gray-200 mb-3" />
                    <p>No se encontraron clientes que coincidan con la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                clientes.map(c => (
                  <tr key={c.idCliente} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                          {c.nombres.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-brand-main">{c.nombres}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono">{c.documento}</td>
                    <td className="px-5 py-4 font-medium">{c.telefono || <span className="text-gray-300 italic">Sin teléfono</span>}</td>
                    <td className="px-5 py-4 text-gray-500 truncate max-w-[200px]">{c.direccion || <span className="text-gray-300 italic">No especificada</span>}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => setClienteHistorial(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-purple bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          <History size={14} /> Historial
                        </button>
                        <button 
                          onClick={() => setClienteEditar(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            Mostrando {clientes.length} de {total} clientes encontrados.
          </div>
        )}
      </div>

      {/* Modales */}
      {clienteHistorial && (
        <ModalHistorialCliente 
          idCliente={clienteHistorial.idCliente} 
          nombreCliente={clienteHistorial.nombres}
          onClose={() => setClienteHistorial(null)} 
        />
      )}
      
      {clienteEditar && (
        <ModalEditarCliente 
          cliente={clienteEditar} 
          onClose={() => setClienteEditar(null)} 
          onUpdate={() => fetchClientes(q)} 
        />
      )}

    </div>
  );
};
