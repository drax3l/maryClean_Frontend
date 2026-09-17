import React, { useEffect, useState } from 'react';
import { reportesService, DashboardData } from './dashboardService';
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
  RefreshCw
} from 'lucide-react';

// ─── Componente: Tarjeta de Estadística ─────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className={`${bgColor} rounded-2xl p-4 flex-shrink-0`}>
      <div className={`${color} w-7 h-7`}>{icon}</div>
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-extrabold text-brand-main">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// ─── Componente: Skeleton Loader ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 animate-pulse">
    <div className="bg-gray-200 rounded-2xl w-16 h-16 flex-shrink-0" />
    <div className="flex-1">
      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  </div>
);

// ─── Página Principal: Dashboard ─────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const result = await reportesService.getDashboard();
      setData(result);
      setLastUpdated(new Date());
    } catch {
      toast.error('No se pudo cargar el resumen. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Refresco silencioso cada 5 minutos
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: t('dashboard.pedidosDelDia'),
      value: data?.pedidos_hoy ?? 0,
      icon: <ShoppingBag />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `Fecha: ${data?.fecha ?? '—'}`,
    },
    {
      title: t('dashboard.pedidosPendientes'),
      value: data?.pedidos_activos ?? 0,
      icon: <Clock />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      subtitle: 'En proceso o recibidos',
    },
    {
      title: t('dashboard.pedidosListos'),
      value: data?.pendientes_cobro ?? 0,
      icon: <CheckCircle />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtitle: 'Esperan ser entregados',
    },
    {
      title: t('dashboard.ingresosDelDia'),
      value: `S/ ${parseFloat(data?.ingresos_hoy ?? '0').toFixed(2)}`,
      icon: <DollarSign />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: 'Pagos registrados hoy',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-main">
            ¡Bienvenido, {user?.nombres?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-400 mt-1 capitalize">
            Rol: <span className="font-semibold text-brand-primary">{user?.rol}</span>
            {' · '}{user?.sucursal}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">
            {loading ? 'Cargando...' : `Actualizado: ${lastUpdated.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`}
          </span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 joyride-dashboard-stats">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat) => <StatCard key={stat.title} {...stat} />)
        }
      </div>

      {/* Banner informativo */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-purple rounded-2xl p-6 text-white flex items-center gap-5 shadow-lg">
        <div className="bg-white bg-opacity-20 rounded-2xl p-3 flex-shrink-0">
          <TrendingUp size={28} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Sistema de Gestión MaryClean</h3>
          <p className="text-sm text-blue-100 mt-1">
            Todos los totales son calculados en tiempo real por la base de datos.
            Los datos se refrescan automáticamente cada 5 minutos.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 joyride-dashboard-widgets">
        <ClientesFrecuentesWidget />
        <ServiciosSolicitadosWidget />
        <EntregasUrgentesWidget />
      </div>
    </div>
  );
};
