import React, { useState, useEffect } from "react";
import { usuariosService, Empleado } from "./usuariosService";
import { ModalUsuario } from "./ModalUsuario";
import { ModalEditPassword } from "./ModalEditPassword";
import toast from "react-hot-toast";
import { Users, UserPlus, Shield, PowerOff, Power, Key } from "lucide-react";
import { useAuthStore } from "@/core/store/authStore";
import { Navigate } from "react-router-dom";

export const UsuariosPage: React.FC = () => {
  const { user } = useAuthStore();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [empleadoAEditarPassword, setEmpleadoAEditarPassword] = useState<Empleado | null>(null);
  const [tabActivo, setTabActivo] = useState<"activos" | "inactivos">("activos");

  // Redirigir si no es admin
  if (user?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const data = await usuariosService.getAll();
      setEmpleados(data);
    } catch {
      toast.error("Error al cargar empleados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleToggleEstado = async (id: number, estadoActual: number) => {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    try {
      await usuariosService.cambiarEstado(id, nuevoEstado);
      fetchEmpleados();
      toast.success(`Empleado ${nuevoEstado === 1 ? 'reactivado' : 'desactivado'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar estado.");
    }
  };

  const getRolStyle = (rol: string) => {
    switch(rol) {
      case 'admin': return "bg-purple-100 text-brand-purple";
      case 'cajero': return "bg-blue-100 text-blue-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-main flex items-center gap-2">
            <Shield size={24} className="text-brand-primary" /> Usuarios y Roles
          </h1>
          <p className="text-sm text-gray-400 mt-1">Administra el acceso del personal al sistema.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn-primary flex items-center gap-2 joyride-usuarios-nuevo"
        >
          <UserPlus size={18} /> Nuevo Empleado
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl w-fit joyride-usuarios-tabs">
        <button
          onClick={() => setTabActivo("activos")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            tabActivo === "activos"
              ? "bg-white text-brand-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Activos ({empleados.filter(e => e.activo === 1).length})
        </button>
        <button
          onClick={() => setTabActivo("inactivos")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            tabActivo === "inactivos"
              ? "bg-white text-gray-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Inactivos ({empleados.filter(e => e.activo === 0).length})
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden joyride-usuarios-tabla">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-bg text-brand-muted text-left uppercase text-xs tracking-wider">
                <th className="px-5 py-4 font-semibold">Empleado</th>
                <th className="px-5 py-4 font-semibold">Usuario (Login)</th>
                <th className="px-5 py-4 font-semibold">Rol</th>
                <th className="px-5 py-4 font-semibold text-center">Estado</th>
                <th className="px-5 py-4 font-semibold text-right joyride-usuarios-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : (() => {
                const filtrados = empleados.filter(e => e.activo === (tabActivo === "activos" ? 1 : 0));
                
                if (filtrados.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto text-gray-200 mb-3" />
                        <p>No hay empleados {tabActivo} registrados.</p>
                      </td>
                    </tr>
                  );
                }

                return filtrados.map((e: typeof empleados[0]) => (
                  <tr key={e.idEmpleado} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                          {e.nombres.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-brand-main">{e.nombres}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono">@{e.username}</td>
                    <td className="px-5 py-4 font-medium">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${getRolStyle(e.rol)}`}>
                        {e.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${e.activo === 1 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {e.activo === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {e.idEmpleado !== 1 && (
                          <button 
                            title="Cambiar Contraseña"
                            onClick={() => setEmpleadoAEditarPassword(e)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Key size={18} />
                          </button>
                        )}
                        {e.idEmpleado !== 1 && (
                          <button 
                            title={e.activo === 1 ? "Desactivar Acceso" : "Reactivar Acceso"}
                            onClick={() => handleToggleEstado(e.idEmpleado, e.activo)}
                            className={`p-2 rounded-lg transition-colors ${e.activo === 1 ? "text-red-400 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                          >
                            {e.activo === 1 ? <PowerOff size={18} /> : <Power size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalUsuario 
          onClose={() => setShowModal(false)} 
          onUpdate={fetchEmpleados} 
        />
      )}

      {empleadoAEditarPassword && (
        <ModalEditPassword 
          empleado={empleadoAEditarPassword}
          onClose={() => setEmpleadoAEditarPassword(null)}
        />
      )}

    </div>
  );
};
