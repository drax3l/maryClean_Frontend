import React, { useState, useEffect } from "react";
import { reportesApiService, EvolucionDiaria, DistribucionServicio } from "./reportesApiService";
import { useAuthStore } from "@/core/store/authStore";
import toast from "react-hot-toast";
import { BarChart3, Calendar, AlertCircle, PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export const ReportesPage: React.FC = () => {
  const { user } = useAuthStore();
  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoy);
  
  const [evolucion, setEvolucion] = useState<EvolucionDiaria[]>([]);
  const [distribucion, setDistribucion] = useState<DistribucionServicio[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const [evoData, distData] = await Promise.all([
        reportesApiService.getEvolucionDiaria(desde, hasta),
        reportesApiService.getDistribucionServicios(desde, hasta)
      ]);
      setEvolucion(evoData);
      setDistribucion(distData);
    } catch {
      toast.error("Error al cargar los reportes gerenciales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === "admin") {
      fetchReportes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user?.rol !== "admin") {
    return (
      <div className="card p-10 text-center space-y-4 max-w-lg mx-auto mt-10">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-brand-main">Acceso Denegado</h2>
        <p className="text-gray-500">Solo los administradores pueden ver los reportes gerenciales.</p>
      </div>
    );
  }

  // Cálculos para resúmenes
  const totalIngresosPeriodo = distribucion.reduce((acc, curr) => acc + parseFloat(curr.ingresosGenerados), 0);
  const totalPrendasPeriodo = distribucion.reduce((acc, curr) => acc + Number(curr.cantidadPrendas), 0);

  // Formatear datos para Recharts
  const pieData = distribucion.map(d => ({
    name: d.servicio,
    value: parseFloat(d.ingresosGenerados)
  }));

  const barData = evolucion.map(e => ({
    name: e.fecha,
    ingresos: parseFloat(e.totalIngresos),
    pedidos: Number(e.cantidadPedidos)
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-main tracking-tight">Modern Report</h1>
          <p className="text-sm text-gray-500 mt-1">Análisis integral de rendimiento e ingresos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm joyride-reportes-filtros">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={18} className="text-brand-primary" />
            <input type="date" value={desde} max={hoy} onChange={e => setDesde(e.target.value)} className="bg-transparent text-sm text-brand-main outline-none cursor-pointer" />
            <span className="text-gray-300">-</span>
            <input type="date" value={hasta} max={hoy} onChange={e => setHasta(e.target.value)} className="bg-transparent text-sm text-brand-main outline-none cursor-pointer" />
          </div>
          <button onClick={fetchReportes} disabled={loading} className="btn-primary py-2 px-6 shadow-md whitespace-nowrap">
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] bg-gray-100 animate-pulse rounded-3xl"></div>
          <div className="h-[400px] bg-gray-100 animate-pulse rounded-3xl"></div>
        </div>
      ) : (
        <>
          <div className="border-t-2 border-brand-primary/20 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Left: Pie Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative joyride-reportes-pie">
              <h3 className="absolute top-8 left-8 font-bold text-gray-400 uppercase tracking-widest text-xs flex items-center gap-2">
                <PieChartIcon size={16} /> Distribución por Servicio
              </h3>
              {pieData.length > 0 ? (
                <div className="w-full h-[300px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => `S/ ${value.toFixed(2)}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">Sin datos</div>
              )}
            </div>

            {/* Top Right: Summary */}
            <div className="flex flex-col justify-center gap-8 p-8 joyride-reportes-resumen">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="font-extrabold text-xl">$</span>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-brand-main mb-1">S/ {totalIngresosPeriodo.toFixed(2)}</h2>
                  <p className="text-gray-500 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-xs text-gray-400 mt-2">Sumatoria del dinero ingresado en el rango de fechas seleccionado.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="font-extrabold text-xl">#</span>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-brand-main mb-1">{totalPrendasPeriodo}</h2>
                  <p className="text-gray-500 text-sm font-medium">Prendas/Kilos Procesados</p>
                  <p className="text-xs text-gray-400 mt-2">Cantidad de items recibidos por el negocio en este periodo.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Bottom Left: Bar Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 joyride-reportes-barras">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs flex items-center gap-2 mb-6">
                <BarChart3 size={16} /> Evolución Diaria
              </h3>
              {barData.length > 0 ? (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <RechartsTooltip cursor={{ fill: '#f9fafb' }} />
                      <Bar yAxisId="left" dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ingresos (S/)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">Sin datos</div>
              )}
            </div>

            {/* Bottom Right: Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col joyride-reportes-tabla">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-brand-main">Desglose por Categoría</h3>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-brand-primary text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold rounded-tl-xl">Categoría</th>
                      <th className="px-6 py-4 font-semibold text-center">Cantidad</th>
                      <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distribucion.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-brand-main">{row.servicio}</td>
                        <td className="px-6 py-4 text-center text-gray-500">{row.cantidadPrendas}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">S/ {parseFloat(row.ingresosGenerados).toFixed(2)}</td>
                      </tr>
                    ))}
                    {distribucion.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">Sin datos registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
