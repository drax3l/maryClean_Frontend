import React, { useState, useEffect } from "react";
import { pedidosService, Pedido } from "@/features/pedidos/pedidosService";
import { X, History, ExternalLink } from "lucide-react";

interface ModalHistorialClienteProps {
  idCliente: number;
  nombreCliente: string;
  onClose: () => void;
}

export const ModalHistorialCliente: React.FC<ModalHistorialClienteProps> = ({ idCliente, nombreCliente, onClose }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // La API de pedidos acepta cliente_id en el index()
    pedidosService.getAll({ cliente_id: idCliente } as any)
      .then(res => setPedidos(res.pedidos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [idCliente]);

  const totalGastado = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-brand-purple rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-main text-lg">Historial de Pedidos</h3>
              <p className="text-sm text-gray-500">{nombreCliente}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase">Pedidos Realizados</p>
              <p className="text-2xl font-extrabold text-brand-main">{pedidos.length}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase">Total Gastado</p>
              <p className="text-2xl font-extrabold text-emerald-700">S/ {totalGastado.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-bg text-brand-muted text-left">
                  <th className="px-4 py-3 font-semibold">Ticket</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center"><div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></td></tr>
                ) : pedidos.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Este cliente no tiene pedidos registrados.</td></tr>
                ) : (
                  pedidos.map(p => (
                    <tr key={p.idPedido} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-brand-primary">{p.codigoTicket}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.fechaRecepcion).toLocaleDateString("es-PE")}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-brand-main">S/ {parseFloat(p.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold text-gray-600">
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
