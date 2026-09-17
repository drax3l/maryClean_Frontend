import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Users,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Shield,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTourStore } from '@/core/store/tourStore';
import { TourGuide } from '@/shared/components/TourGuide';

// ─── Tipos ─────────────────────────────────────────────────────────────────
type Rol = 'admin' | 'cajero' | 'recepcionista';

interface NavItem {
  key: string;
  to: string;
  icon: React.ReactNode;
  roles: Rol[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',        to: '/',                   icon: <LayoutDashboard size={20} />, roles: ['admin', 'cajero', 'recepcionista'] },
  { key: 'registrarPedido',  to: '/registrar-pedido',   icon: <PlusCircle size={20} />,      roles: ['admin', 'recepcionista'] },
  { key: 'pedidos',          to: '/pedidos',             icon: <ClipboardList size={20} />,   roles: ['admin', 'cajero', 'recepcionista'] },
  { key: 'clientes',         to: '/clientes',            icon: <Users size={20} />,           roles: ['admin', 'cajero', 'recepcionista'] },
  { key: 'cierreCaja',       to: '/cierre-caja',        icon: <Landmark size={20} />,        roles: ['admin', 'cajero'] },
  { key: 'reportes',         to: '/reportes',            icon: <BarChart2 size={20} />,       roles: ['admin'] },
  { key: 'usuarios',         to: '/usuarios',            icon: <Shield size={20} />,          roles: ['admin'] },
  { key: 'configuracion',    to: '/configuracion',       icon: <Settings size={20} />,        roles: ['admin'] },
];

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  label: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, collapsed, label, onClick }) => (
  <NavLink
    to={item.to}
    end={item.to === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
       ${isActive
         ? 'bg-brand-primary text-white font-semibold shadow-sm'
         : 'text-gray-500 hover:bg-brand-bg hover:text-brand-main'
       }
       ${collapsed ? 'justify-center' : ''}`
    }
    title={collapsed ? label : undefined}
  >
    <span className="flex-shrink-0">{item.icon}</span>
    {!collapsed && <span className="text-sm truncate">{label}</span>}
  </NavLink>
);

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { startTour } = useTourStore();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const visibleItems = NAV_ITEMS.filter(item =>
    user?.rol && item.roles.includes(user.rol as Rol)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.nombres
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('') ?? 'MC';

  return (
    <div className="h-screen w-full bg-brand-bg flex overflow-hidden">

      {/* Overlay para móvil */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:relative z-50 h-full bg-white border-r border-gray-100 flex flex-col
          transition-all duration-300 ease-in-out flex-shrink-0
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${collapsed ? 'md:justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-purple flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-sm">MC</span>
          </div>
          <div className={`${collapsed ? 'md:hidden' : 'block'}`}>
            <p className="font-extrabold text-brand-main text-sm leading-tight">MaryClean</p>
            <p className="text-xs text-gray-400">Sistema de Gestión</p>
          </div>
          
          <button 
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 text-gray-400 hover:text-gray-600 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto joyride-sidebar">
          {visibleItems.map(item => (
            <SidebarItem 
              key={item.to} 
              item={item} 
              collapsed={collapsed} 
              label={t(`sidebar.${item.key}`)} 
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="px-3 pb-2 space-y-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => { startTour(); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-sm font-semibold ${collapsed ? 'md:justify-center' : ''}`}
            title={collapsed ? t('sidebar.manualUso') : undefined}
          >
            <HelpCircle size={18} />
            <span className={`${collapsed ? 'md:hidden' : 'block'}`}>{t('sidebar.manualUso')}</span>
          </button>
          
          <div className={`flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 ${collapsed ? 'md:flex-col' : 'justify-between'}`}>
            <button 
              onClick={() => { i18n.changeLanguage('es'); localStorage.setItem('i18nextLng', 'es'); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${i18n.language.startsWith('es') ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ES
            </button>
            <button 
              onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('i18nextLng', 'en'); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${i18n.language.startsWith('en') ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'md:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className={`overflow-hidden ${collapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-sm font-semibold text-brand-main truncate">{user?.nombres}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.rol} · {user?.sucursal}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium ${collapsed ? 'md:justify-center' : ''}`}
            title={collapsed ? t('sidebar.cerrarSesion') : undefined}
          >
            <LogOut size={18} />
            <span className={`${collapsed ? 'md:hidden' : 'block'}`}>{t('sidebar.cerrarSesion')}</span>
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block absolute bottom-28 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ── Contenido Principal ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
          <button 
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="font-bold text-brand-main flex-1 text-base truncate">
            {t('sidebar.sistemaGestion')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-brand-bg text-brand-muted px-3 py-1.5 rounded-full font-medium capitalize">
              {user?.rol}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto relative">
          <TourGuide />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
