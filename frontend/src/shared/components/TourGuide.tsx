import React, { useEffect } from 'react';
import { Joyride, CallBackProps, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTourStore } from '@/core/store/tourStore';
import { useTranslation } from 'react-i18next';
import { TourTooltip } from './TourTooltip';
import { BarChart3, Trophy, Star, AlertTriangle, User, Plus, DollarSign, Search, Table2, Filter, RefreshCw, CheckCircle, XCircle, UserPlus, Users, History, Edit3, Calendar, Printer, PieChart as PieChartIcon, Power, Settings, Tag, Key, Home, ClipboardList, Landmark, Shield, Wrench, Sparkles } from 'lucide-react';

export const TourGuide: React.FC = () => {
  const { run, stopTour, tourKey } = useTourStore();
  const location = useLocation();
  const { t } = useTranslation();

  // Detener el tour si el usuario cambia de pantalla
  useEffect(() => {
    if (run) stopTour();
  }, [location.pathname]);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
    }
  };

  // ── DASHBOARD: 5 pasos, uno por sección/widget ────────────────────────────
  const dashboardSteps = [
    // Paso 1: Bienvenida (centrado, sin highlight)
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Sparkles size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">
            {t('tour.steps.welcome.title')}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('tour.steps.welcome.content')}
          </p>
        </div>
      ),
    },

    // Paso 2: Tarjetas de resumen del día
    {
      target: '.joyride-dashboard-stats',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-brand-main">
              {t('tour.steps.stats.title')}
            </h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('tour.steps.stats.content')}
          </p>
        </div>
      ),
    },

    // Paso 3: Widget Clientes Frecuentes (individual)
    {
      target: '.joyride-widget-clientes',
      placement: 'right' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
              <Trophy size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-brand-main">
              {t('tour.steps.widgetClientes.title')}
            </h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('tour.steps.widgetClientes.content')}
          </p>
        </div>
      ),
    },

    // Paso 4: Widget Servicios Más Solicitados (individual)
    {
      target: '.joyride-widget-servicios',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Star size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-brand-main">
              {t('tour.steps.widgetServicios.title')}
            </h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('tour.steps.widgetServicios.content')}
          </p>
        </div>
      ),
    },

    // Paso 5: Widget Entregas Urgentes (individual)
    {
      target: '.joyride-widget-entregas',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-xl text-red-500">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-brand-main">
              {t('tour.steps.widgetEntregas.title')}
            </h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('tour.steps.widgetEntregas.content')}
          </p>
        </div>
      ),
    },
  ];

  // Pasos para Registrar Pedido
  const registrarPedidoSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <ClipboardList size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.registrar.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.registrar.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-registrar-cliente',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><User size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.registrar.cliente.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.registrar.cliente.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-registrar-prendas',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Plus size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.registrar.prendas.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.registrar.prendas.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-registrar-pago',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><DollarSign size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.registrar.pago.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.registrar.pago.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-registrar-acciones',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><CheckCircle size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.registrar.acciones.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.registrar.acciones.content')}</p>
        </div>
      ),
    },
  ];

  // Pasos para Pedidos
  const pedidosSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <ClipboardList size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.pedidos.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.pedidos.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-pedidos-busqueda',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Search size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.pedidos.busqueda.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.pedidos.busqueda.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-pedidos-filtro',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-500"><Filter size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.pedidos.filtro.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.pedidos.filtro.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-pedidos-actualizar',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-50 rounded-xl text-teal-600"><RefreshCw size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.pedidos.actualizar.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.pedidos.actualizar.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-pedidos-tabla',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Table2 size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.pedidos.tabla.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.pedidos.tabla.content')}</p>
        </div>
      ),
    },
    // Paso final: Acciones — explica Cobrar y Ver detalle
    {
      target: '.joyride-pedidos-acciones',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <h3 className="font-extrabold text-lg text-brand-main mb-3">
            {t('tour.steps.pedidos.acciones.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <span className="text-emerald-600 mt-0.5"><DollarSign size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">$ Cobrar</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.pedidos.acciones.cobrar')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <span className="text-blue-600 mt-0.5"><Table2 size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Ver detalle</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.pedidos.acciones.verDetalle')}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Pasos para Clientes
  const clientesSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Users size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.clientes.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.clientes.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-clientes-busqueda',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Search size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.clientes.busqueda.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.clientes.busqueda.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-clientes-agregar',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><UserPlus size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.clientes.agregar.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.clientes.agregar.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-clientes-tabla',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Users size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.clientes.tabla.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.clientes.tabla.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-clientes-acciones',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <h3 className="font-extrabold text-lg text-brand-main mb-3">
            {t('tour.steps.clientes.acciones.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
              <span className="text-purple-600 mt-0.5"><History size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Historial</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.clientes.acciones.historial')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <span className="text-blue-600 mt-0.5"><Edit3 size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Editar</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.clientes.acciones.editar')}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Pasos para Cierre de Caja
  const cierreCajaSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Landmark size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.caja.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.caja.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-caja-filtro',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Calendar size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.caja.filtro.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.caja.filtro.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-caja-resumen',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Printer size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.caja.resumen.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.caja.resumen.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-caja-desglose',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Table2 size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.caja.desglose.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.caja.desglose.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-caja-total',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><DollarSign size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.caja.total.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.caja.total.content')}</p>
        </div>
      ),
    },
  ];

  // Pasos para Reportes
  const reportesSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <BarChart3 size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.reportes.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-reportes-filtros',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Calendar size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.reportes.filtros.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.filtros.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-reportes-pie',
      placement: 'right' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><PieChartIcon size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.reportes.pie.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.pie.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-reportes-resumen',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.reportes.resumen.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.resumen.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-reportes-barras',
      placement: 'right' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><BarChart3 size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.reportes.barras.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.barras.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-reportes-tabla',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><Table2 size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.reportes.tabla.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.reportes.tabla.content')}</p>
        </div>
      ),
    },
  ];

  // Pasos para Usuarios
  const usuariosSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Shield size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.usuarios.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.usuarios.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-usuarios-nuevo',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><UserPlus size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.usuarios.nuevo.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.usuarios.nuevo.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-usuarios-tabs',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><Filter size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.usuarios.tabs.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.usuarios.tabs.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-usuarios-tabla',
      placement: 'top' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Users size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.usuarios.tabla.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.usuarios.tabla.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-usuarios-acciones',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <h3 className="font-extrabold text-lg text-brand-main mb-3">
            {t('tour.steps.usuarios.acciones.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-3 border border-orange-100">
              <span className="text-orange-500 mt-0.5"><Key size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Cambiar Clave</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.usuarios.acciones.clave')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
              <span className="text-red-600 mt-0.5"><Power size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Activar/Desactivar</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.usuarios.acciones.estado')}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Pasos para Configuracion
  const configuracionSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Settings size={48} />
          </div>
          <h3 className="font-extrabold text-2xl text-brand-main mb-2">{t('tour.steps.configuracion.welcome.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.configuracion.welcome.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-config-datos',
      placement: 'right' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Settings size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.configuracion.datos.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.configuracion.datos.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-config-tarifario',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Tag size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.configuracion.tarifario.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.configuracion.tarifario.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-config-nuevo',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Plus size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.configuracion.nuevo.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.configuracion.nuevo.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-config-tabs',
      placement: 'bottom' as const,
      disableBeacon: true,
      content: (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><Filter size={20} /></div>
            <h3 className="font-extrabold text-lg text-brand-main">{t('tour.steps.configuracion.tabs.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{t('tour.steps.configuracion.tabs.content')}</p>
        </div>
      ),
    },
    {
      target: '.joyride-config-acciones',
      placement: 'left' as const,
      disableBeacon: true,
      content: (
        <div>
          <h3 className="font-extrabold text-lg text-brand-main mb-3">
            {t('tour.steps.configuracion.acciones.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <span className="text-blue-600 mt-0.5"><Edit3 size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Editar Precio</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.configuracion.acciones.editar')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
              <span className="text-red-600 mt-0.5"><Power size={18} /></span>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-0.5">Activar/Desactivar</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t('tour.steps.configuracion.acciones.estado')}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Pasos genéricos para vistas sin tour propio
  const genericSteps = [
    {
      target: 'body',
      placement: 'center' as const,
      disableBeacon: true,
      content: (
        <div className="text-center py-2">
          <div className="flex justify-center mb-4 text-brand-primary">
            <Wrench size={48} />
          </div>
          <h3 className="font-bold text-gray-700 mb-2">Manual próximamente</h3>
          <p className="text-sm text-gray-500">
            El tour para esta sección estará disponible muy pronto.
          </p>
        </div>
      ),
    },
  ];

  const getSteps = () => {
    if (location.pathname === '/') return dashboardSteps;
    if (location.pathname === '/registrar-pedido') return registrarPedidoSteps;
    if (location.pathname === '/pedidos') return pedidosSteps;
    if (location.pathname === '/clientes') return clientesSteps;
    if (location.pathname === '/cierre-caja') return cierreCajaSteps;
    if (location.pathname === '/reportes') return reportesSteps;
    if (location.pathname === '/usuarios') return usuariosSteps;
    if (location.pathname === '/configuracion') return configuracionSteps;
    return genericSteps;
  };

  return (
    <Joyride
      key={`${location.pathname}-${tourKey}`}
      steps={getSteps()}
      run={run}
      continuous
      showSkipButton
      disableBeacon
      disableOverlayClose
      tooltipComponent={TourTooltip}
      callback={handleCallback}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.12))',
          },
        },
      }}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          arrowColor: '#ffffff',
        }
      }}
    />
  );
};
