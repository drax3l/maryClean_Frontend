import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  Outlet,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom';

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
  X,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { useTourStore } from '@/core/store/tourStore';


// ─────────────────────────────────────────────────────────────
// Lazy loading
// TourGuide solo se descarga cuando realmente se necesita.
// ─────────────────────────────────────────────────────────────

const TourGuide = lazy(() =>
  import('@/shared/components/TourGuide').then((module) => ({
    default: module.TourGuide,
  }))
);


// ─── Tipos ──────────────────────────────────────────────────

type Rol = 'admin' | 'cajero' | 'recepcionista';

interface NavItem {
  key: string;
  to: string;
  icon: React.ReactNode;
  roles: Rol[];
}


// ─── Navegación ─────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    to: '/',
    icon: <LayoutDashboard size={20} />,
    roles: ['admin', 'cajero', 'recepcionista'],
  },
  {
    key: 'registrarPedido',
    to: '/registrar-pedido',
    icon: <PlusCircle size={20} />,
    roles: ['admin', 'recepcionista'],
  },
  {
    key: 'pedidos',
    to: '/pedidos',
    icon: <ClipboardList size={20} />,
    roles: ['admin', 'cajero', 'recepcionista'],
  },
  {
    key: 'clientes',
    to: '/clientes',
    icon: <Users size={20} />,
    roles: ['admin', 'cajero', 'recepcionista'],
  },
  {
    key: 'cierreCaja',
    to: '/cierre-caja',
    icon: <Landmark size={20} />,
    roles: ['admin', 'cajero'],
  },
  {
    key: 'reportes',
    to: '/reportes',
    icon: <BarChart2 size={20} />,
    roles: ['admin'],
  },
  {
    key: 'usuarios',
    to: '/usuarios',
    icon: <Shield size={20} />,
    roles: ['admin'],
  },
  {
    key: 'configuracion',
    to: '/configuracion',
    icon: <Settings size={20} />,
    roles: ['admin'],
  },
];


// ─── Sidebar Item ────────────────────────────────────────────

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  label: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  collapsed,
  label,
  onClick,
}) => (
  <NavLink
    to={item.to}
    end={item.to === '/'}
    onClick={onClick}
    aria-label={label}
    className={({ isActive }) =>
      `
        flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group
        ${
          isActive
            ? 'bg-blue-700 text-white font-semibold shadow-sm'
            : 'text-gray-600 hover:bg-brand-bg hover:text-brand-main'
        }
        ${collapsed ? 'justify-center' : ''}
      `
    }
    title={collapsed ? label : undefined}
  >
    <span
      className="flex-shrink-0"
      aria-hidden="true"
    >
      {item.icon}
    </span>

    {!collapsed && (
      <span className="text-sm truncate">
        {label}
      </span>
    )}
  </NavLink>
);


// ─── Dashboard Layout ────────────────────────────────────────

export const DashboardLayout: React.FC = () => {
  const {
    isAuthenticated,
    user,
    logout,
  } = useAuthStore();

  const {
    startTour,
    run,
  } = useTourStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { t, i18n } = useTranslation();


  // Cierra automáticamente el menú móvil
  // cuando el usuario cambia de página.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);


  // Protección del layout.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  // Menús visibles según rol.
  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      user?.rol &&
      item.roles.includes(user.rol as Rol)
  );


  // Cerrar sesión.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Iniciales del usuario.
  const initials =
    user?.nombres
      ?.split(' ')
      .slice(0, 2)
      .map((nombre) => nombre[0])
      .join('') ?? 'MC';


  return (
    <div className="h-screen w-full bg-brand-bg flex overflow-hidden">

      {/* ─────────────────────────────────────────────
          Overlay móvil
      ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}


      {/* ─────────────────────────────────────────────
          Sidebar
      ───────────────────────────────────────────── */}
      <aside
        aria-label="Menú principal"
        className={`
          fixed md:relative z-50 h-full bg-white
          border-r border-gray-100 flex flex-col
          transition-all duration-300 ease-in-out
          flex-shrink-0

          ${
            mobileOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full md:translate-x-0'
          }

          ${
            collapsed
              ? 'md:w-20'
              : 'md:w-64'
          }
        `}
      >

        {/* Logo */}
        <div
          className={`
            flex items-center h-16 px-4
            border-b border-gray-100
            ${collapsed ? 'md:justify-center' : 'gap-3'}
          `}
        >
          <div
            className="
              w-9 h-9 rounded-xl
              bg-gradient-to-br
              from-brand-primary
              to-brand-purple
              flex items-center justify-center
              flex-shrink-0
            "
            aria-hidden="true"
          >
            <span className="text-white font-extrabold text-sm">
              MC
            </span>
          </div>

          <div className={collapsed ? 'md:hidden' : 'block'}>
            <p className="font-extrabold text-brand-main text-sm leading-tight">
              MaryClean
            </p>

            <p className="text-xs text-gray-600">
              Sistema de Gestión
            </p>
          </div>


          {/* Cerrar menú móvil */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú de navegación"
            title="Cerrar menú"
            className="
              ml-auto p-2
              text-gray-500
              hover:text-gray-700
              hover:bg-gray-100
              rounded-lg
              md:hidden
              transition-colors
            "
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>


        {/* Navegación */}
        <nav
          aria-label="Navegación principal"
          className="
            flex-1 p-3 space-y-1
            overflow-y-auto joyride-sidebar
          "
        >
          {visibleItems.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              label={t(`sidebar.${item.key}`)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>


        {/* Manual + idiomas */}
        <div
          className="
            px-3 pb-2 space-y-2
            border-t border-gray-100 pt-3
          "
        >

          {/* Manual de uso */}
          <button
            type="button"
            onClick={() => {
              startTour();
              setMobileOpen(false);
            }}
            aria-label={t('sidebar.manualUso')}
            className={`
              w-full flex items-center gap-3
              px-3 py-2.5 rounded-xl
              bg-blue-50 text-blue-700
              hover:bg-blue-100
              transition-all
              text-sm font-semibold

              ${collapsed ? 'md:justify-center' : ''}
            `}
            title={
              collapsed
                ? t('sidebar.manualUso')
                : undefined
            }
          >
            <HelpCircle
              size={18}
              aria-hidden="true"
            />

            <span
              className={
                collapsed
                  ? 'md:hidden'
                  : 'block'
              }
            >
              {t('sidebar.manualUso')}
            </span>
          </button>


          {/* Idiomas */}
          <div
            className={`
              flex items-center
              bg-gray-50 rounded-xl
              p-1 border border-gray-100

              ${
                collapsed
                  ? 'md:flex-col'
                  : 'justify-between'
              }
            `}
            aria-label="Selector de idioma"
          >

            <button
              type="button"
              onClick={() => {
                i18n.changeLanguage('es');

                localStorage.setItem(
                  'i18nextLng',
                  'es'
                );
              }}
              aria-label="ES - Cambiar idioma a español"
              className={`
                flex-1 py-1.5
                text-xs font-bold
                rounded-lg
                transition-colors

                ${
                  i18n.language.startsWith('es')
                    ? 'bg-white shadow-sm text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              ES
            </button>


            <button
              type="button"
              onClick={() => {
                i18n.changeLanguage('en');

                localStorage.setItem(
                  'i18nextLng',
                  'en'
                );
              }}
              aria-label="EN - Cambiar idioma a inglés"
              className={`
                flex-1 py-1.5
                text-xs font-bold
                rounded-lg
                transition-colors

                ${
                  i18n.language.startsWith('en')
                    ? 'bg-white shadow-sm text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              EN
            </button>

          </div>
        </div>


        {/* Usuario */}
        <div
          className="
            p-3 border-t border-gray-100
            space-y-2
          "
        >

          <div
            className={`
              flex items-center gap-3
              px-2 py-2

              ${
                collapsed
                  ? 'md:justify-center'
                  : ''
              }
            `}
          >
            <div
              className="
                w-9 h-9 rounded-full
                bg-gradient-to-br
                from-brand-cyan
                to-brand-primary
                flex items-center
                justify-center
                flex-shrink-0
              "
              aria-hidden="true"
            >
              <span className="text-white font-bold text-xs">
                {initials}
              </span>
            </div>


            <div
              className={`
                overflow-hidden

                ${
                  collapsed
                    ? 'md:hidden'
                    : 'block'
                }
              `}
            >
              <p
                className="
                  text-sm font-semibold
                  text-brand-main truncate
                "
              >
                {user?.nombres}
              </p>

              <p
                className="
                  text-xs text-gray-600
                  capitalize
                "
              >
                {user?.rol} · {user?.sucursal}
              </p>
            </div>
          </div>


          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t('sidebar.cerrarSesion')}
            className={`
              w-full flex items-center gap-3
              px-3 py-2.5 rounded-xl
              text-red-600 hover:bg-red-50
              transition-all
              text-sm font-medium

              ${
                collapsed
                  ? 'md:justify-center'
                  : ''
              }
            `}
            title={
              collapsed
                ? t('sidebar.cerrarSesion')
                : undefined
            }
          >
            <LogOut
              size={18}
              aria-hidden="true"
            />

            <span
              className={
                collapsed
                  ? 'md:hidden'
                  : 'block'
              }
            >
              {t('sidebar.cerrarSesion')}
            </span>
          </button>
        </div>


        {/* Colapsar sidebar */}
        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (estadoActual) => !estadoActual
            )
          }
          className="
            hidden md:block
            absolute bottom-28 -right-3
            bg-white border border-gray-200
            rounded-full p-1 shadow-sm
            hover:shadow-md
            transition-shadow
          "
          aria-label={
            collapsed
              ? 'Expandir menú'
              : 'Colapsar menú'
          }
          title={
            collapsed
              ? 'Expandir menú'
              : 'Colapsar menú'
          }
        >
          {collapsed ? (
            <ChevronRight
              size={14}
              aria-hidden="true"
            />
          ) : (
            <ChevronLeft
              size={14}
              aria-hidden="true"
            />
          )}
        </button>

      </aside>


      {/* ─────────────────────────────────────────────
          Contenido principal
      ───────────────────────────────────────────── */}
      <div
        className="
          flex-1 flex flex-col
          min-w-0 relative
        "
      >

        {/* Header */}
        <header
          className="
            bg-white border-b border-gray-100
            h-16 flex items-center
            px-4 md:px-6 gap-3
            flex-shrink-0
          "
        >

          {/* Menú móvil */}
          <button
            type="button"
            className="
              p-2 -ml-2
              text-gray-600
              hover:text-gray-800
              hover:bg-gray-50
              rounded-lg md:hidden
              transition-colors
            "
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú de navegación"
            title="Abrir menú"
          >
            <Menu
              size={24}
              aria-hidden="true"
            />
          </button>


          <h2
            className="
              font-bold text-brand-main
              flex-1 text-base truncate
            "
          >
            {t('sidebar.sistemaGestion')}
          </h2>


          <div className="flex items-center gap-3">
            <span
              className="
                hidden sm:inline-block
                text-xs bg-brand-bg
                text-gray-700
                px-3 py-1.5
                rounded-full
                font-medium capitalize
              "
            >
              {user?.rol}
            </span>
          </div>

        </header>


        {/* Contenido de las páginas */}
        <main
          className="
            flex-1 p-4 md:p-6
            overflow-y-auto relative
          "
        >

          {/*
            El TourGuide solo existe cuando run=true.

            Esto evita cargar react-joyride y toda la lógica
            del manual durante el inicio normal de MaryClean.
          */}
          {run && (
            <Suspense fallback={null}>
              <TourGuide />
            </Suspense>
          )}

          <Outlet />

        </main>

      </div>

    </div>
  );
};