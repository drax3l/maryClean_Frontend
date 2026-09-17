import React, { useState, useEffect } from "react";
import { reportesService, EntregaUrgente } from "./dashboardService";
import { AlertTriangle, Clock, Phone, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return 'hace menos de una hora';
}

export const EntregasUrgentesWidget: React.FC = () => {
  const [entregas, setEntregas] = useState<EntregaUrgente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntregas = async () => {
    setLoading(true);
    try {
      const data = await reportesService.getEntregasUrgentes(5);
      setEntregas(data || []);
    } catch (error) {
      toast.error("Error al cargar entregas urgentes.");
      setEntregas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntregas();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'Recibido': return "bg-blue-100 text-blue-700";
      case 'En Proceso': return "bg-amber-100 text-amber-700";
      case 'Listo': return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full xl:col-span-2 joyride-widget-entregas">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-bold text-brand-main flex items-center gap-2 text-lg">
            <AlertTriangle size={20} className="text-red-500" /> Entregas Urgentes
          </h2>
          <p className="text-xs text-gray-400 mt-1">Pedidos activos más antiguos (Pendientes)</p>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : entregas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CheckCircle size={48} className="text-emerald-200 mb-3 opacity-50" />
            <p className="text-sm">Todo al día. No hay pedidos atrasados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entregas.map((entrega) => {
              const tiempo = formatTimeAgo(entrega.fechaRecepcion);
              return (
                <div key={entrega.idPedido} className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all group flex flex-col gap-3">
                  
                  {/* Top: Ticket & Estado */}
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-brand-primary text-sm bg-brand-primary/10 px-2 py-1 rounded-lg">
                      {entrega.codigoTicket}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getEstadoBadge(entrega.estado)}`}>
                      {entrega.estado}
                    </span>
                  </div>

                  {/* Middle: Cliente */}
                  <div>
                    <h3 className="font-bold text-brand-main truncate" title={entrega.cliente}>{entrega.cliente}</h3>
                    {entrega.telefonoCliente && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone size={12} /> {entrega.telefonoCliente}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Tiempo */}
                  <div className="mt-auto pt-3 border-t border-red-50 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-xl">
                    <Clock size={14} className="animate-pulse" />
                    Ingresó {tiempo}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

