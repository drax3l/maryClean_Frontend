import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PedidosPage } from "@/features/pedidos/PedidosPage";
import { RegistrarPedidoPage } from "@/features/pedidos/RegistrarPedidoPage";
import { ClientesPage } from "@/features/clientes/ClientesPage";
import { CierreCajaPage } from "@/features/cierre-caja/CierreCajaPage";
import { ReportesPage } from "@/features/reportes/ReportesPage";
import { ConfiguracionPage } from "@/features/configuracion/ConfiguracionPage";
import { UsuariosPage } from "@/features/usuarios/UsuariosPage";

const ComingSoon: React.FC<{ titulo: string }> = ({ titulo }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-4xl mb-3">🚧</p>
      <h3 className="text-lg font-bold text-brand-main">{titulo}</h3>
      <p className="text-sm text-gray-400 mt-1">Este modulo se implementara en la siguiente fase.</p>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/"                 element={<DashboardPage />} />
        <Route path="/pedidos"          element={<PedidosPage />} />
        <Route path="/registrar-pedido" element={<RegistrarPedidoPage />} />
        <Route path="/clientes"         element={<ClientesPage />} />
        <Route path="/cierre-caja"      element={<CierreCajaPage />} />
        <Route path="/reportes"         element={<ReportesPage />} />
        <Route path="/configuracion"    element={<ConfiguracionPage />} />
        <Route path="/usuarios"         element={<UsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};