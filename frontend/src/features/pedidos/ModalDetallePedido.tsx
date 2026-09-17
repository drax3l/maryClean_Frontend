import React, { useState, useEffect } from "react";
import { pedidosService, EstadoPedido } from "./pedidosService";
import { useAuthStore } from "@/core/store/authStore";
import toast from "react-hot-toast";
import { X, Clock, User, CheckCircle, Package, Printer } from "lucide-react";
import { printTicket } from "@/core/utils/printUtils";
import { ModalHelp } from "@/shared/components/ModalHelp";

interface ModalDetallePedidoProps {
  idPedido: number;
  codigoTicket: string;
  estadoActual: EstadoPedido;
  onClose: () => void;
  onUpdate: () => void;
}

const ESTADO_STYLES: Record<EstadoPedido, string> = {
  Recibido:   "bg-blue-100 text-blue-700",
  "En Proceso": "bg-amber-100 text-amber-700",
  Listo:      "bg-emerald-100 text-emerald-700",
  Entregado:  "bg-gray-100 text-gray-500",
  Cancelado:  "bg-red-100 text-red-600",
};

export const ModalDetallePedido: React.FC<ModalDetallePedidoProps> = ({ 
  idPedido, 
  codigoTicket, 
  estadoActual, 
  onClose, 
  onUpdate 
}) => {
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    pedidosService.getTicket(idPedido)
      .then(data => setTicket(data))
      .catch(() => toast.error("Error al cargar detalles del pedido"))
      .finally(() => setLoading(false));
  }, [idPedido]);

  const estadosPermitidos = (estadoAct: EstadoPedido): EstadoPedido[] => {
    const flujo: EstadoPedido[] = ["Recibido", "En Proceso", "Listo", "Entregado"];
    const idx = flujo.indexOf(estadoAct);
    const siguientes = idx >= 0 ? flujo.slice(idx + 1) : [];
    if (user?.rol === "admin" && estadoAct !== "Cancelado") siguientes.push("Cancelado");
    return siguientes;
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoPedido) => {
    setCambiandoEstado(true);
    try {
      await pedidosService.cambiarEstado(idPedido, nuevoEstado);
      toast.success(`Estado actualizado a "${nuevoEstado}"`);
      onUpdate();
      // Refrescar el ticket local
      const data = await pedidosService.getTicket(idPedido);
      setTicket(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Error al cambiar estado.");
    } finally {
      setCambiandoEstado(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-2xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-24 bg-gray-100 rounded mb-4"></div>
          <div className="h-40 bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-brand-main text-xl">Detalle del Pedido</h3>
            <span className="font-mono text-sm bg-brand-bg text-brand-primary px-3 py-1 rounded-full font-bold">
              {codigoTicket}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ModalHelp
              label="¿Cómo usar?"
              items={[
                {
                  icon: '👤',
                  title: 'Info del Cliente',
                  description: 'Muestra el nombre y teléfono del cliente dueño del pedido.',
                },
                {
                  icon: '📅',
                  title: 'Datos del Pedido',
                  description: 'Fecha de recepción y el total a cobrar por el servicio. El total es calculado por el sistema.',
                },
                {
                  icon: '👕',
                  title: 'Prendas y Servicios',
                  description: 'Lista cada prenda ingresada: tipo, cantidad, precio unitario y subtotal.',
                },
                {
                  icon: '✅',
                  title: 'Cambiar Estado',
                  description: 'Selecciona el nuevo estado del pedido en el menú desplegable. El flujo es: Recibido → En Proceso → Listo → Entregado. Solo Admin puede cancelar.',
                },
                {
                  icon: '🖨️',
                  title: 'Imprimir Ticket',
                  description: 'Genera e imprime el ticket del pedido en tu tiquetera térmica o en PDF.',
                },
              ]}
            />
            <button onClick={() => printTicket(ticket)} className="text-gray-500 hover:text-brand-primary transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full flex items-center gap-2 text-sm font-bold px-4" title="Imprimir Ticket">
              <Printer size={16} /> <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-2 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Info Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <User size={14} /> Info. del Cliente
              </h4>
              <p className="font-bold text-brand-main text-base">{ticket?.cliente?.nombres}</p>
              <p className="text-sm text-gray-500 mt-1">Teléfono: <span className="font-semibold">{ticket?.cliente?.telefono}</span></p>
            </div>
            
            <div className="bg-brand-bg p-4 rounded-2xl border border-blue-50">
              <h4 className="text-xs font-bold text-brand-primary uppercase mb-3 flex items-center gap-2">
                <Clock size={14} /> Datos del Pedido
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                Fecha: <span className="font-semibold">{ticket?.encabezado?.fecha_emision}</span>
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100">
                <span className="text-sm font-bold text-brand-main">Total:</span>
                <span className="text-lg font-extrabold text-brand-primary">
                  S/ {parseFloat(ticket?.total ?? "0").toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Prendas */}
          <div>
            <h4 className="text-sm font-bold text-brand-main flex items-center gap-2 mb-3">
              <Package size={16} className="text-brand-primary" /> Prendas y Servicios
            </h4>
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Tipo de Prenda</th>
                    <th className="px-4 py-3 text-center font-semibold">Cant.</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio</th>
                    <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ticket?.detalles?.map((d: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-main">{d.prenda}</p>
                        <p className="text-xs text-gray-400">{d.servicio}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">{d.cantidad}</td>
                      <td className="px-4 py-3 text-right text-gray-500">S/ {parseFloat(d.precio_unitario ?? d.precioUnitario ?? '0').toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-main">S/ {parseFloat(d.subtotal ?? '0').toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cambiar Estado */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 border-dashed">
            <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Cambiar Estado del Pedido
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <span className="text-xs text-amber-700/70 uppercase font-bold block mb-1">Estado Actual</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold inline-block ${ESTADO_STYLES[ticket?.estado as EstadoPedido] || "bg-gray-100 text-gray-600"}`}>
                  {ticket?.estado}
                </span>
              </div>
              
              {estadosPermitidos(ticket?.estado).length > 0 ? (
                <div className="flex-1 w-full flex items-center gap-2">
                  <select
                    disabled={cambiandoEstado}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleCambiarEstado(e.target.value as EstadoPedido);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="w-full bg-white border border-amber-200 text-amber-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none font-medium cursor-pointer"
                  >
                    <option value="" disabled>Seleccionar nuevo estado...</option>
                    {estadosPermitidos(ticket?.estado).map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-500 italic text-right">
                  No hay estados siguientes.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
