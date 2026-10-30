import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  reportesApiService,
  EvolucionDiaria,
  DistribucionServicio,
} from './reportesApiService';

import { useAuthStore } from '@/core/store/authStore';
import toast from 'react-hot-toast';

import {
  BarChart3,
  Calendar,
  AlertCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Gráficos cargados de forma diferida
// Recharts no se incorpora directamente a ReportesPage.
// ─────────────────────────────────────────────────────────────

const DistribucionPieChart = lazy(() =>
  import('./components/DistribucionPieChart').then((module) => ({
    default: module.DistribucionPieChart,
  }))
);

const EvolucionBarChart = lazy(() =>
  import('./components/EvolucionBarChart').then((module) => ({
    default: module.EvolucionBarChart,
  }))
);

// Loader usado mientras se descarga Recharts
const ChartLoader: React.FC = () => (
  <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-2xl" />
);

export const ReportesPage: React.FC = () => {
  const { user } = useAuthStore();

  // ───────────────────────────────────────────────────────────
  // Fechas
  // ───────────────────────────────────────────────────────────

  const hoy = new Date().toISOString().split('T')[0];

  const primerDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split('T')[0];

  // ───────────────────────────────────────────────────────────
  // Estados
  // ───────────────────────────────────────────────────────────

  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoy);

  const [evolucion, setEvolucion] = useState<EvolucionDiaria[]>([]);
  const [distribucion, setDistribucion] =
    useState<DistribucionServicio[]>([]);

  const [loading, setLoading] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Obtención de reportes
  // ───────────────────────────────────────────────────────────

  const fetchReportes = async () => {
    setLoading(true);

    try {
      const [evoData, distData] = await Promise.all([
        reportesApiService.getEvolucionDiaria(desde, hasta),
        reportesApiService.getDistribucionServicios(desde, hasta),
      ]);

      setEvolucion(evoData);
      setDistribucion(distData);
    } catch {
      toast.error('Error al cargar los reportes gerenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar automáticamente cuando ingresa un administrador
  useEffect(() => {
    if (user?.rol === 'admin') {
      fetchReportes();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ───────────────────────────────────────────────────────────
  // Cálculos optimizados
  // ───────────────────────────────────────────────────────────

  const totalIngresosPeriodo = useMemo(
    () =>
      distribucion.reduce(
        (acumulado, item) =>
          acumulado + Number(item.ingresosGenerados || 0),
        0
      ),
    [distribucion]
  );

  const totalPrendasPeriodo = useMemo(
    () =>
      distribucion.reduce(
        (acumulado, item) =>
          acumulado + Number(item.cantidadPrendas || 0),
        0
      ),
    [distribucion]
  );

  // Datos para gráfico circular
  const pieData = useMemo(
    () =>
      distribucion.map((item) => ({
        name: item.servicio,
        value: Number(item.ingresosGenerados || 0),
      })),
    [distribucion]
  );

  // Datos para gráfico de barras
  const barData = useMemo(
    () =>
      evolucion.map((item) => ({
        name: item.fecha,
        ingresos: Number(item.totalIngresos || 0),
      })),
    [evolucion]
  );

  // ───────────────────────────────────────────────────────────
  // Seguridad por rol
  // ───────────────────────────────────────────────────────────

  if (user?.rol !== 'admin') {
    return (
      <div className="card p-10 text-center space-y-4 max-w-lg mx-auto mt-10">
        <AlertCircle
          size={48}
          className="text-red-400 mx-auto"
        />

        <h2 className="text-xl font-bold text-brand-main">
          Acceso Denegado
        </h2>

        <p className="text-gray-500">
          Solo los administradores pueden ver los reportes
          gerenciales.
        </p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Renderizado
  // ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">

      {/* ─────────────────────────────────────────────
          Header y filtros
      ───────────────────────────────────────────── */}

      <div className="
        flex flex-col md:flex-row
        justify-between
        items-start md:items-center
        gap-4
      ">
        <div>
          <h1 className="
            text-3xl
            font-extrabold
            text-brand-main
            tracking-tight
          ">
            Modern Report
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Análisis integral de rendimiento e ingresos
          </p>
        </div>

        <div className="
          flex flex-col sm:flex-row
          items-center
          gap-3
          bg-white
          p-2
          rounded-2xl
          border border-gray-100
          shadow-sm
          joyride-reportes-filtros
        ">
          <div className="flex items-center gap-2 px-3">
            <Calendar
              size={18}
              className="text-brand-primary"
            />

            <input
              type="date"
              value={desde}
              max={hoy}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Fecha inicial del reporte"
              className="
                bg-transparent
                text-sm
                text-brand-main
                outline-none
                cursor-pointer
              "
            />

            <span className="text-gray-500">
              -
            </span>

            <input
              type="date"
              value={hasta}
              max={hoy}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Fecha final del reporte"
              className="
                bg-transparent
                text-sm
                text-brand-main
                outline-none
                cursor-pointer
              "
            />
          </div>

          <button
            onClick={fetchReportes}
            disabled={loading}
            className="
              btn-primary
              py-2
              px-6
              shadow-md
              whitespace-nowrap
            "
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Estado de carga
      ───────────────────────────────────────────── */}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="
            h-[400px]
            bg-gray-100
            animate-pulse
            rounded-3xl
          " />

          <div className="
            h-[400px]
            bg-gray-100
            animate-pulse
            rounded-3xl
          " />
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────
              Primera fila
          ───────────────────────────────────────── */}

          <div className="
            border-t-2
            border-brand-primary/20
            pt-8
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
          ">

            {/* Gráfico circular */}
            <div className="
              bg-white
              rounded-3xl
              p-8
              shadow-sm
              border border-gray-100
              flex flex-col
              items-center
              justify-center
              relative
              joyride-reportes-pie
            ">
              <h2 className="
                absolute
                top-8
                left-8
                font-bold
                text-gray-700
                uppercase
                tracking-widest
                text-xs
                flex
                items-center
                gap-2
              ">
                <PieChartIcon size={16} aria-hidden="true" />

                Distribución por Servicio
              </h2>

              {pieData.length > 0 ? (
                <div className="w-full h-[300px] mt-6">
                  <Suspense fallback={<ChartLoader />}>
                    <DistribucionPieChart
                      data={pieData}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="
                  h-[300px]
                  flex
                  items-center
                  justify-center
                  text-gray-400
                ">
                  Sin datos
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="
              flex
              flex-col
              justify-center
              gap-8
              p-8
              joyride-reportes-resumen
            ">

              {/* Ingresos */}
              <div className="flex gap-4">
                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-blue-100
                  text-blue-500
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                ">
                  <span className="font-extrabold text-xl">
                    $
                  </span>
                </div>

                <div>
                  <h2 className="
                    text-4xl
                    font-black
                    text-brand-main
                    mb-1
                  ">
                    S/ {totalIngresosPeriodo.toFixed(2)}
                  </h2>

                  <p className="
                    text-gray-500
                    text-sm
                    font-medium
                  ">
                    Ingresos Totales
                  </p>

                  <p className="
                    text-xs
                    text-gray-600
                    mt-2
                  ">
                    Sumatoria del dinero ingresado en el rango
                    de fechas seleccionado.
                  </p>
                </div>
              </div>

              {/* Prendas */}
              <div className="flex gap-4">
                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-emerald-100
                  text-emerald-500
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                ">
                  <span className="font-extrabold text-xl">
                    #
                  </span>
                </div>

                <div>
                  <h2 className="
                    text-4xl
                    font-black
                    text-brand-main
                    mb-1
                  ">
                    {totalPrendasPeriodo}
                  </h2>

                  <p className="
                    text-gray-500
                    text-sm
                    font-medium
                  ">
                    Prendas/Kilos Procesados
                  </p>

                  <p className="
                    text-xs
                    text-gray-600
                    mt-2
                  ">
                    Cantidad de items recibidos por el negocio
                    en este periodo.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ─────────────────────────────────────────
              Segunda fila
          ───────────────────────────────────────── */}

          <div className="
            border-t
            border-gray-100
            pt-8
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
          ">

            {/* Gráfico de barras */}
            <div className="
              bg-white
              rounded-3xl
              p-8
              shadow-sm
              border border-gray-100
              joyride-reportes-barras
            ">
              <h2 className="
                font-bold
                text-gray-400
                uppercase
                tracking-widest
                text-xs
                flex
                items-center
                gap-2
                mb-6
              ">
                <BarChart3 size={16} />

                Evolución Diaria
              </h2>

              {barData.length > 0 ? (
                <div className="w-full h-[300px]">
                  <Suspense fallback={<ChartLoader />}>
                    <EvolucionBarChart
                      data={barData}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="
                  h-[300px]
                  flex
                  items-center
                  justify-center
                  text-gray-400
                ">
                  Sin datos
                </div>
              )}
            </div>

            {/* Tabla */}
            <div className="
              bg-white
              rounded-3xl
              shadow-sm
              border border-gray-100
              overflow-hidden
              flex
              flex-col
              joyride-reportes-tabla
            ">
              <div className="
                p-6
                border-b
                border-gray-50
              ">
                <h2 className="
                  font-bold
                  text-brand-main
                ">
                  Desglose por Categoría
                </h2>
              </div>

              <div className="
                flex-1
                overflow-auto
                custom-scrollbar
                p-0
              ">
                <table className="w-full text-sm text-left">

                  <thead className="
                    bg-brand-primary
                    text-white
                  ">
                    <tr>
                      <th className="
                        px-6
                        py-4
                        font-semibold
                        rounded-tl-xl
                      ">
                        Categoría
                      </th>

                      <th className="
                        px-6
                        py-4
                        font-semibold
                        text-center
                      ">
                        Cantidad
                      </th>

                      <th className="
                        px-6
                        py-4
                        font-semibold
                        text-right
                        rounded-tr-xl
                      ">
                        Ingresos
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {distribucion.map((row, idx) => (
                      <tr
                        key={`${row.servicio}-${idx}`}
                        className="
                          hover:bg-blue-50/50
                          transition-colors
                        "
                      >
                        <td className="
                          px-6
                          py-4
                          font-medium
                          text-brand-main
                        ">
                          {row.servicio}
                        </td>

                        <td className="
                          px-6
                          py-4
                          text-center
                          text-gray-500
                        ">
                          {row.cantidadPrendas}
                        </td>

                        <td className="
                          px-6
                          py-4
                          text-right
                          font-bold
                          text-emerald-600
                        ">
                          S/{' '}
                          {Number(
                            row.ingresosGenerados || 0
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {distribucion.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="
                            px-6
                            py-10
                            text-center
                            text-gray-400
                          "
                        >
                          Sin datos registrados
                        </td>
                      </tr>
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