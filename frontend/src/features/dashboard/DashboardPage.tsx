import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  reportesService,
  DashboardData,
} from './dashboardService';

import { ClientesFrecuentesWidget } from './ClientesFrecuentesWidget';
import { ServiciosSolicitadosWidget } from './ServiciosSolicitadosWidget';
import { EntregasUrgentesWidget } from './EntregasUrgentesWidget';

import { useAuthStore } from '@/core/store/authStore';
import { useTranslation } from 'react-i18next';

import toast from 'react-hot-toast';

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';


// ─────────────────────────────────────────────────────────────
// Tarjeta de estadística
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
  subtitle,
}) => {
  return (
    <article
      className="
        bg-white
        rounded-2xl
        p-6
        shadow-sm
        border border-gray-100
        flex items-center
        gap-5
        hover:shadow-md
        transition-shadow
      "
    >
      <div
        className={`
          ${bgColor}
          rounded-2xl
          p-4
          flex-shrink-0
        `}
        aria-hidden="true"
      >
        <div
          className={`
            ${color}
            w-7 h-7
          `}
        >
          {icon}
        </div>
      </div>

      <div>
        <p
          className="
            text-xs
            font-semibold
            text-gray-600
            uppercase
            tracking-widest
            mb-1
          "
        >
          {title}
        </p>

        <p
          className="
            text-3xl
            font-extrabold
            text-brand-main
          "
        >
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
};


// ─────────────────────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div
    className="
      bg-white
      rounded-2xl
      p-6
      shadow-sm
      border border-gray-100
      flex items-center
      gap-5
      animate-pulse
    "
    aria-hidden="true"
  >
    <div
      className="
        bg-gray-200
        rounded-2xl
        w-16 h-16
        flex-shrink-0
      "
    />

    <div className="flex-1">
      <div
        className="
          h-3
          bg-gray-200
          rounded
          w-24
          mb-3
        "
      />

      <div
        className="
          h-8
          bg-gray-200
          rounded
          w-16
        "
      />
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState<Date>(new Date());


  // ───────────────────────────────────────────────────────────
  // Carga del dashboard
  // ───────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const result =
        await reportesService.getDashboard();

      setData(result);
      setLastUpdated(new Date());
    } catch {
      toast.error(
        'No se pudo cargar el resumen. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);


  // Carga inicial y actualización automática cada 5 minutos.
  useEffect(() => {
    fetchDashboard();

    const interval = window.setInterval(
      fetchDashboard,
      5 * 60 * 1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchDashboard]);


  // ───────────────────────────────────────────────────────────
  // Estadísticas
  // ───────────────────────────────────────────────────────────

  const stats: StatCardProps[] = [
    {
      title: t('dashboard.pedidosDelDia'),

      value:
        data?.pedidos_hoy ?? 0,

      icon: (
        <ShoppingBag
          size={28}
          aria-hidden="true"
        />
      ),

      color:
        'text-blue-700',

      bgColor:
        'bg-blue-50',

      subtitle:
        `Fecha: ${data?.fecha ?? '—'}`,
    },

    {
      title:
        t('dashboard.pedidosPendientes'),

      value:
        data?.pedidos_activos ?? 0,

      icon: (
        <Clock
          size={28}
          aria-hidden="true"
        />
      ),

      color:
        'text-amber-700',

      bgColor:
        'bg-amber-50',

      subtitle:
        'En proceso o recibidos',
    },

    {
      title:
        t('dashboard.pedidosListos'),

      value:
        data?.pendientes_cobro ?? 0,

      icon: (
        <CheckCircle
          size={28}
          aria-hidden="true"
        />
      ),

      color:
        'text-emerald-700',

      bgColor:
        'bg-emerald-50',

      subtitle:
        'Esperan ser entregados',
    },

    {
      title:
        t('dashboard.ingresosDelDia'),

      value:
        `S/ ${Number(
          data?.ingresos_hoy ?? 0
        ).toFixed(2)}`,

      icon: (
        <DollarSign
          size={28}
          aria-hidden="true"
        />
      ),

      color:
        'text-purple-700',

      bgColor:
        'bg-purple-50',

      subtitle:
        'Pagos registrados hoy',
    },
  ];


  // ───────────────────────────────────────────────────────────
  // Hora de última actualización
  // ───────────────────────────────────────────────────────────

  const horaActualizacion =
    lastUpdated.toLocaleTimeString(
      'es-PE',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );


  // ───────────────────────────────────────────────────────────
  // Renderizado
  // ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ─────────────────────────────────────────────
          Encabezado
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-extrabold
              text-brand-main
            "
          >
            ¡Bienvenido,{' '}
            {user?.nombres?.split(' ')[0] ?? 'Usuario'}!
          </h1>

          <p
            className="
              text-sm
              text-gray-600
              mt-1
              capitalize
            "
          >
            Rol:{' '}

            <span className="font-semibold text-blue-700">
              {user?.rol}
            </span>

            {' · '}

            {user?.sucursal}
          </p>
        </div>


        {/* Botón actualizar */}
        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          aria-label={
            loading
              ? 'Cargando...'
              : `Actualizar datos del dashboard. Actualizado: ${horaActualizacion}`
          }
          title="Actualizar datos"
          className="
            flex
            items-center
            gap-2
            text-sm
            text-gray-700
            hover:text-blue-700
            transition-colors
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />

          <span
            className="hidden sm:inline"
            aria-live="polite"
          >
            {loading
              ? 'Cargando...'
              : `Actualizado: ${horaActualizacion}`
            }
          </span>
        </button>
      </div>


      {/* ─────────────────────────────────────────────
          Tarjetas estadísticas
      ───────────────────────────────────────────── */}

      <section
        aria-label="Resumen de estadísticas"
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
          joyride-dashboard-stats
        "
      >
        {loading
          ? Array.from(
              { length: 4 },
              (_, index) => (
                <SkeletonCard
                  key={index}
                />
              )
            )
          : stats.map((stat) => (
              <StatCard
                key={stat.title}
                {...stat}
              />
            ))
        }
      </section>


      {/* ─────────────────────────────────────────────
          Banner informativo
      ───────────────────────────────────────────── */}

      <section
        aria-labelledby="maryclean-system-title"
        className="
          bg-gradient-to-r
          from-brand-primary
          to-brand-purple
          rounded-2xl
          p-6
          text-white
          flex
          items-center
          gap-5
          shadow-lg
        "
      >
        <div
          className="
            bg-white/20
            rounded-2xl
            p-3
            flex-shrink-0
          "
          aria-hidden="true"
        >
          <TrendingUp size={28} />
        </div>


        <div>
          <h2
            id="maryclean-system-title"
            className="
              font-bold
              text-lg
            "
          >
            Sistema de Gestión MaryClean
          </h2>

          <p
            className="
              text-sm
              text-white/90
              mt-1
            "
          >
            Todos los totales son calculados en tiempo
            real por la base de datos. Los datos se
            refrescan automáticamente cada 5 minutos.
          </p>
        </div>
      </section>


      {/* ─────────────────────────────────────────────
          Widgets
      ───────────────────────────────────────────── */}

      <section
        aria-label="Información complementaria del dashboard"
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-5
          joyride-dashboard-widgets
        "
      >
        <ClientesFrecuentesWidget />

        <ServiciosSolicitadosWidget />

        <EntregasUrgentesWidget />
      </section>

    </div>
  );
};