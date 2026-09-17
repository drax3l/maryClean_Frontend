import React, { useEffect, useState, useCallback } from "react";
import { pedidosService, Pedido, EstadoPedido } from "./pedidosService";
import { useAuthStore } from "@/core/store/authStore";
import { ModalCobro } from "./ModalCobro";
import { ModalDetallePedido } from "./ModalDetallePedido";
import toast from "react-hot-toast";
import { RefreshCw, Filter, DollarSign, Eye, Search } from "lucide-react";

// Colores de badge por estado
const ESTADO_STYLES: Record<EstadoPedido, string> = {
  Recibido:   "bg-blue-100 text-blue-700",
  "En Proceso": "bg-amber-100 text-amber-700",
  Listo:      "bg-emerald-100 text-emerald-700",
  Entregado:  "bg-gray-100 text-gray-500",
  Cancelado:  "bg-red-100 text-red-600",
};

const ESTADOS: EstadoPedido[] = ["Recibido", "En Proceso", "Listo", "Entregado", "Cancelado"];

// Skeleton row
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array(6).fill(0).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

export const PedidosPage: React.FC = () => {
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado para el modal de cobro
  const [cobroPedidoSeleccionado, setCobroPedidoSeleccionado] = useState<{ id: number; ticket: string } | null>(null);
  
  // Estado para el modal de detalle
  const [detallePedidoSeleccionado, setDetallePedidoSeleccionado] = useState<{ id: number; ticket: string; estado: EstadoPedido } | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pedidosService.getAll({
        estado: filtroEstado || undefined,
        search: searchQuery || undefined,
      });
      setPedidos(data.pedidos ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { 
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPedidos();
    }, 400);
  }, [fetchPedidos, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-main">Pedidos Activos</h1>
          <p className="text-sm text-gray-400 mt-1">{total} pedido(s) encontrado(s)</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Búsqueda Global */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm max-w-xs w-full joyride-pedidos-busqueda">
            <Search size={15} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar ticket, DNI o cliente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="outline-none text-brand-main bg-transparent w-full"
            />
          </div>
          {/* Filtro por estado */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm joyride-pedidos-filtro">
            <Filter size={15} className="text-gray-400" />
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="outline-none text-brand-main bg-transparent cursor-pointer"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button
            onClick={fetchPedidos}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50 joyride-pedidos-actualizar"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden joyride-pedidos-tabla">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-left">
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Recepcion</th>
                <th className="px-4 py-3 font-semibold joyride-pedidos-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : pedidos.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No hay pedidos que mostrar con el filtro seleccionado.
                      </td>
                    </tr>
                  )
                  : pedidos.map(pedido => (
                    <tr key={pedido.idPedido} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-brand-primary font-semibold">
                        {pedido.codigoTicket}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-main">{pedido.cliente}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_STYLES[pedido.estado]}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">S/ {parseFloat(pedido.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(pedido.fechaRecepcion).toLocaleString("es-PE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Boton Cobrar (cajero/admin) */}
                          {["cajero", "admin"].includes(user?.rol ?? "") && (
                            <button
                              onClick={() => setCobroPedidoSeleccionado({ id: pedido.idPedido, ticket: pedido.codigoTicket })}
                              className="text-xs flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                              title="Registrar Pago"
                            >
                              <DollarSign size={14} /> Cobrar
                            </button>
                          )}
                          
                          {/* Ver Detalle */}
                          <button
                            onClick={() => setDetallePedidoSeleccionado({ id: pedido.idPedido, ticket: pedido.codigoTicket, estado: pedido.estado })}
                            className="text-xs flex items-center gap-1 bg-brand-bg text-brand-primary border border-blue-100 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors font-bold"
                          >
                            <Eye size={14} /> Ver detalle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cobro */}
      {cobroPedidoSeleccionado && (
        <ModalCobro
          idPedido={cobroPedidoSeleccionado.id}
          ticketCodigo={cobroPedidoSeleccionado.ticket}
          onClose={() => setCobroPedidoSeleccionado(null)}
          onPagoExitoso={fetchPedidos}
        />
      )}

      {/* Modal Detalle Pedido */}
      {detallePedidoSeleccionado && (
        <ModalDetallePedido
          idPedido={detallePedidoSeleccionado.id}
          codigoTicket={detallePedidoSeleccionado.ticket}
          estadoActual={detallePedidoSeleccionado.estado}
          onClose={() => setDetallePedidoSeleccionado(null)}
          onUpdate={fetchPedidos}
        />
      )}
    </div>
  );
};