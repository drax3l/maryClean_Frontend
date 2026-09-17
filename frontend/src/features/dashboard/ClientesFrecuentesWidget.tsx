import React, { useState, useEffect } from "react";
import { reportesApiService } from "@/features/reportes/reportesApiService";
import { Trophy, Calendar, Medal } from "lucide-react";
import toast from "react-hot-toast";

interface ClienteTop {
  idCliente: number;
  documento: string;
  nombres: string;
  totalPedidos: number;
  totalGastado: string;
}

export const ClientesFrecuentesWidget: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const data = await reportesApiService.getClientesFrecuentes(desde || undefined, hasta || undefined, 10);
      setClientes(data.clientes || []);
    } catch (error) {
      toast.error("Error al cargar el ranking de clientes.");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full joyride-widget-clientes">
      
      {/* Header con Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-bold text-brand-main flex items-center gap-2 text-lg">
            <Trophy size={20} className="text-amber-500" /> Clientes Frecuentes
          </h2>
          <p className="text-xs text-gray-400 mt-1">Ranking de los clientes con más pedidos</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-auto">
          <Calendar size={16} className="text-gray-400 ml-1" />
          <input 
            type="date" 
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-transparent text-xs text-brand-main outline-none cursor-pointer"
            title="Fecha Desde"
          />
          <span className="text-gray-300">-</span>
          <input 
            type="date" 
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-transparent text-xs text-brand-main outline-none cursor-pointer"
            title="Fecha Hasta"
          />
        </div>
      </div>

      {/* Lista / Ranking */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Trophy size={48} className="text-gray-200 mb-3 opacity-50" />
            <p className="text-sm">No hay datos en este periodo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientes.map((cliente, index) => {
              // Estilos para el Podio (1ro, 2do, 3ro)
              let podioColor = "bg-brand-primary/10 text-brand-primary";
              let medalColor = "";
              if (index === 0) { podioColor = "bg-amber-100 text-amber-600"; medalColor = "text-amber-500"; }
              else if (index === 1) { podioColor = "bg-gray-200 text-gray-600"; medalColor = "text-gray-400"; }
              else if (index === 2) { podioColor = "bg-orange-100 text-orange-600"; medalColor = "text-orange-500"; }

              return (
                <div key={cliente.idCliente} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  
                  {/* Posición / Medalla */}
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full font-bold ${podioColor}`}>
                    {index < 3 ? <Medal size={20} className={medalColor} /> : `#${index + 1}`}
                  </div>
                  
                  {/* Datos del Cliente */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-main truncate" title={cliente.nombres}>
                      {cliente.nombres}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {cliente.totalPedidos} pedidos realizados
                    </p>
                  </div>
                  
                  {/* Gasto Total */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Gastado</p>
                    <p className="font-extrabold text-brand-primary">S/ {parseFloat(cliente.totalGastado).toFixed(2)}</p>
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
