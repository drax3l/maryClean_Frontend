import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

// Layout principal
const DashboardLayout = lazy(() =>
  import("@/shared/layouts/DashboardLayout").then((module) => ({
    default: module.DashboardLayout,
  }))
);

// Páginas cargadas solo cuando se necesitan
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);

const PedidosPage = lazy(() =>
  import("@/features/pedidos/PedidosPage").then((module) => ({
    default: module.PedidosPage,
  }))
);

const RegistrarPedidoPage = lazy(() =>
  import("@/features/pedidos/RegistrarPedidoPage").then((module) => ({
    default: module.RegistrarPedidoPage,
  }))
);

const ClientesPage = lazy(() =>
  import("@/features/clientes/ClientesPage").then((module) => ({
    default: module.ClientesPage,
  }))
);

const CierreCajaPage = lazy(() =>
  import("@/features/cierre-caja/CierreCajaPage").then((module) => ({
    default: module.CierreCajaPage,
  }))
);

const ReportesPage = lazy(() =>
  import("@/features/reportes/ReportesPage").then((module) => ({
    default: module.ReportesPage,
  }))
);

const ConfiguracionPage = lazy(() =>
  import("@/features/configuracion/ConfiguracionPage").then((module) => ({
    default: module.ConfiguracionPage,
  }))
);

const UsuariosPage = lazy(() =>
  import("@/features/usuarios/UsuariosPage").then((module) => ({
    default: module.UsuariosPage,
  }))
);

const LoadingPage = () => (
  <div className="flex items-center justify-center h-64">
    <p className="text-sm text-gray-400">Cargando...</p>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route
            path="/registrar-pedido"
            element={<RegistrarPedidoPage />}
          />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/cierre-caja" element={<CierreCajaPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};