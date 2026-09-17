import React, { useState, useEffect } from "react";
import { reportesApiService, CierreCajaRes } from "@/features/reportes/reportesApiService";
import { useAuthStore } from "@/core/store/authStore";
import { printCierreCaja } from "@/core/utils/printUtils";
import toast from "react-hot-toast";
import { Landmark, Search, Printer, DollarSign, AlertCircle, Calendar } from "lucide-react";

export const CierreCajaPage: React.FC = () => {
  // Inicializamos la fecha en la fecha actual (formato YYYY-MM-DD)
  const hoy = new Date().toISOString().split("T")[0];
  const [fechaBusqueda, setFechaBusqueda] = useState<string>(hoy);
  
  const [cierre, setCierre] = useState<CierreCajaRes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuthStore();

  const fetchCierre = async (fecha: string) => {
    setLoading(true);
    try {
      const data = await reportesApiService.getCierreCaja(fecha);
      setCierre(data);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Error al obtener el cierre de caja.";
      toast.error(msg);
      setCierre(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCierre(fechaBusqueda);
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaBusqueda) return;
    fetchCierre(fechaBusqueda);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-main flex items-center gap-2">
            <Landmark size={24} className="text-brand-primary" /> Cierre de Caja
          </h1>
          <p className="text-sm text-gray-400 mt-1">Consolida los ingresos del día por método de pago.</p>
        </div>
      </div>

      {/* Filtro de Fecha Responsivo */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end gap-4 joyride-caja-filtro">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-brand-primary" /> Seleccionar Fecha de Cierre
          </label>
          <input
            type="date"
            className="w-full bg-gray-50 border border-gray-200 text-brand-main text-lg md:text-base font-semibold rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary block p-4 md:p-3 outline-none cursor-pointer transition-all"
            value={fechaBusqueda}
            max={hoy}
            onChange={(e) => setFechaBusqueda(e.target.value)}
          />
        </div>
        <button 
          onClick={handleBuscar} 
          disabled={loading} 
          className="btn-primary w-full md:w-auto p-4 md:px-8 md:py-3 text-lg md:text-base flex justify-center items-center gap-2"
        >
          <Search size={20} /> {loading ? "Consultando..." : "Consultar Caja"}
        </button>
      </div>

      {/* Contenido del Cierre */}
      {loading ? (
        <div className="card p-8 flex items-center justify-center animate-pulse">
          <div className="h-24 bg-gray-200 rounded w-full max-w-sm"></div>
        </div>
      ) : cierre ? (
        <div className="card space-y-6">
          <div className="flex justify-between items-center border-b pb-4 joyride-caja-resumen">
            <div>
              <h2 className="text-lg font-bold text-brand-main">Resumen del {cierre.fecha}</h2>
              <p className="text-sm text-gray-400">Total de operaciones: {cierre.total_operaciones}</p>
            </div>
            {Number(cierre.total_general) > 0 ? (
              <button 
                onClick={() => printCierreCaja(cierre, { nombre: user?.sucursal }, user)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold shadow-sm"
              >
                <Printer size={18} /> <span className="hidden sm:inline">Imprimir Cierre</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1">
                <AlertCircle size={14} /> Sin movimientos (Impresión deshabilitada)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tabla de Desglose */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden joyride-caja-desglose">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-bg text-brand-muted">
                    <th className="px-4 py-2 text-left font-semibold">Método</th>
                    <th className="px-4 py-2 text-center font-semibold">Operaciones</th>
                    <th className="px-4 py-2 text-right font-semibold">Monto (S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cierre.desglose
                    .filter((d) => d.metodo !== null) // Excluir fila del ROLLUP total
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-brand-main flex items-center gap-2">
                          <DollarSign size={14} className="text-gray-400" /> {item.metodo}
                        </td>
                        <td className="px-4 py-3 text-center">{item.cantidadTransacciones}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          {parseFloat(item.total_ingresos).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  {cierre.desglose.filter((d) => d.metodo !== null).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        No hay ingresos registrados para esta fecha.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total General */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-purple p-6 rounded-xl text-white flex flex-col justify-center items-center shadow-md joyride-caja-total">
              <p className="text-sm text-blue-100 uppercase tracking-widest font-semibold mb-2">Total Recaudado</p>
              <h3 className="text-4xl font-extrabold flex items-center gap-1">
                <span className="text-2xl">S/</span> {parseFloat(cierre.total_general ?? "0").toFixed(2)}
              </h3>
              <p className="text-xs text-blue-100 mt-4 text-center">
                Este monto es el total de todas las transacciones realizadas en la fecha consultada.
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              El cierre de caja incluye todos los pagos recibidos el <strong>{cierre.fecha}</strong>. 
              Recuerda comparar el desglose de "Efectivo" con el dinero físico en tu caja antes de finalizar el turno.
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-400">
          No hay datos para mostrar.
        </div>
      )}
    </div>
  );
};
