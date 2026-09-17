import React, { useState, useEffect } from "react";
import { reportesApiService, DistribucionServicio } from "@/features/reportes/reportesApiService";
import { Star, Calendar, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";

export const ServiciosSolicitadosWidget: React.FC = () => {
  const [servicios, setServicios] = useState<DistribucionServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const fetchServicios = async () => {
    setLoading(true);
    try {
      // Tomamos los top 5 ordenando localmente, aunque el backend ya puede mandarlo ordenado
      const data = await reportesApiService.getDistribucionServicios(desde || undefined, hasta || undefined);
      // Ordenar por cantidad de prendas descendente y tomar 5
      const top5 = data.sort((a, b) => Number(b.cantidadPrendas) - Number(a.cantidadPrendas)).slice(0, 5);
      setServicios(top5);
    } catch (error) {
      toast.error("Error al cargar los servicios más solicitados.");
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full joyride-widget-servicios">
      
      {/* Header con Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-bold text-brand-main flex items-center gap-2 text-lg">
            <Star size={20} className="text-blue-500" /> Servicios Demandados
          </h2>
          <p className="text-xs text-gray-400 mt-1">Categorías más solicitadas</p>
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

      {/* Lista de Servicios */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Star size={48} className="text-gray-200 mb-3 opacity-50" />
            <p className="text-sm">No hay datos en este periodo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {servicios.map((servicio, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100/50 group">
                
                {/* Icono decorativo */}
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl font-bold bg-blue-100 text-blue-600`}>
                  <ArrowUpRight size={18} />
                </div>
                
                {/* Datos del Servicio */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-main truncate" title={servicio.servicio}>
                    {servicio.servicio}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    <span className="font-semibold text-brand-primary">{servicio.cantidadPrendas}</span> items procesados
                  </p>
                </div>
                
                {/* Gasto Total */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5 group-hover:text-emerald-500 transition-colors">Ingresos</p>
                  <p className="font-extrabold text-emerald-600">S/ {parseFloat(servicio.ingresosGenerados).toFixed(2)}</p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
