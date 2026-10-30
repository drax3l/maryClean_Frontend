import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  usuariosService,
  Empleado,
} from './usuariosService';

import { ModalUsuario } from './ModalUsuario';
import { ModalEditPassword } from './ModalEditPassword';

import toast from 'react-hot-toast';

import {
  Users,
  UserPlus,
  Shield,
  PowerOff,
  Power,
  Key,
} from 'lucide-react';

import { useAuthStore } from '@/core/store/authStore';
import { Navigate } from 'react-router-dom';


// ─────────────────────────────────────────────────────────────
// Página de Usuarios y Roles
// ─────────────────────────────────────────────────────────────

export const UsuariosPage: React.FC = () => {
  const { user } = useAuthStore();

  const [empleados, setEmpleados] =
    useState<Empleado[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [
    empleadoAEditarPassword,
    setEmpleadoAEditarPassword,
  ] = useState<Empleado | null>(null);

  const [
    tabActivo,
    setTabActivo,
  ] = useState<'activos' | 'inactivos'>(
    'activos'
  );


  // ───────────────────────────────────────────────────────────
  // Obtener empleados
  // ───────────────────────────────────────────────────────────

  const fetchEmpleados = useCallback(async () => {
    // Evita solicitudes si el usuario no es administrador.
    if (user?.rol !== 'admin') {
      return;
    }

    setLoading(true);

    try {
      const data =
        await usuariosService.getAll();

      setEmpleados(
        data ?? []
      );
    } catch {
      toast.error(
        'Error al cargar empleados.'
      );
    } finally {
      setLoading(false);
    }
  }, [user?.rol]);


  // ───────────────────────────────────────────────────────────
  // Carga inicial
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);


  // ───────────────────────────────────────────────────────────
  // Activar / desactivar usuario
  // ───────────────────────────────────────────────────────────

  const handleToggleEstado = async (
    id: number,
    estadoActual: number
  ) => {
    const nuevoEstado =
      estadoActual === 1
        ? 0
        : 1;

    try {
      await usuariosService.cambiarEstado(
        id,
        nuevoEstado
      );

      await fetchEmpleados();

      toast.success(
        `Empleado ${
          nuevoEstado === 1
            ? 'reactivado'
            : 'desactivado'
        }`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'Error al cambiar estado.'
      );
    }
  };


  // ───────────────────────────────────────────────────────────
  // Estilos según rol
  // ───────────────────────────────────────────────────────────

  const getRolStyle = (
    rol: string
  ) => {
    switch (rol) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';

      case 'cajero':
        return 'bg-blue-100 text-blue-800';

      case 'recepcionista':
        return 'bg-emerald-100 text-emerald-800';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };


  // ───────────────────────────────────────────────────────────
  // Filtrado
  // ───────────────────────────────────────────────────────────

  const empleadosFiltrados =
    empleados.filter(
      (empleado) =>
        empleado.activo ===
        (
          tabActivo === 'activos'
            ? 1
            : 0
        )
    );


  const totalActivos =
    empleados.filter(
      (empleado) =>
        empleado.activo === 1
    ).length;


  const totalInactivos =
    empleados.filter(
      (empleado) =>
        empleado.activo === 0
    ).length;


  // ───────────────────────────────────────────────────────────
  // Seguridad
  // Todos los hooks ya fueron ejecutados antes del redirect.
  // ───────────────────────────────────────────────────────────

  if (user?.rol !== 'admin') {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // ───────────────────────────────────────────────────────────
  // Renderizado
  // ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ─────────────────────────────────────────────
          Header
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          justify-between
          items-start
          sm:items-center
          gap-4
        "
      >
        <div>

          <h1
            className="
              text-2xl
              font-extrabold
              text-brand-main
              flex
              items-center
              gap-2
            "
          >
            <Shield
              size={24}
              className="text-blue-700"
              aria-hidden="true"
            />

            Usuarios y Roles
          </h1>


          <p className="text-sm text-gray-600 mt-1">
            Administra el acceso del personal al sistema.
          </p>

        </div>


        {/* Nuevo empleado */}
        <button
          type="button"
          onClick={() =>
            setShowModal(true)
          }
          className="
            btn-primary
            flex
            items-center
            gap-2
            joyride-usuarios-nuevo
          "
        >
          <UserPlus
            size={18}
            aria-hidden="true"
          />

          Nuevo Empleado
        </button>

      </div>


      {/* ─────────────────────────────────────────────
          Tabs
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          items-center
          gap-2
          bg-gray-50
          p-1
          rounded-xl
          w-fit
          joyride-usuarios-tabs
        "
        role="group"
        aria-label="Filtrar empleados por estado"
      >

        {/* Activos */}
        <button
          type="button"
          onClick={() =>
            setTabActivo('activos')
          }
          aria-pressed={
            tabActivo === 'activos'
          }
          className={`
            px-4
            py-1.5
            text-xs
            font-bold
            rounded-lg
            transition-all

            ${
              tabActivo === 'activos'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          Activos ({totalActivos})
        </button>


        {/* Inactivos */}
        <button
          type="button"
          onClick={() =>
            setTabActivo('inactivos')
          }
          aria-pressed={
            tabActivo === 'inactivos'
          }
          className={`
            px-4
            py-1.5
            text-xs
            font-bold
            rounded-lg
            transition-all

            ${
              tabActivo === 'inactivos'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          Inactivos ({totalInactivos})
        </button>

      </div>


      {/* ─────────────────────────────────────────────
          Tabla
      ───────────────────────────────────────────── */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-sm
          border
          border-gray-100
          overflow-hidden
          joyride-usuarios-tabla
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr
                className="
                  bg-brand-bg
                  text-gray-700
                  text-left
                  uppercase
                  text-xs
                  tracking-wider
                "
              >

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  Empleado
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  Usuario (Login)
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  Rol
                </th>

                <th
                  scope="col"
                  className="
                    px-5
                    py-4
                    font-semibold
                    text-center
                  "
                >
                  Estado
                </th>

                <th
                  scope="col"
                  className="
                    px-5
                    py-4
                    font-semibold
                    text-right
                    joyride-usuarios-acciones
                  "
                >
                  Acciones
                </th>

              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">

              {/* Loading */}
              {loading ? (

                Array.from(
                  { length: 3 },
                  (_, index) => (
                    <tr
                      key={index}
                      className="animate-pulse"
                      aria-hidden="true"
                    >

                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 bg-gray-200 rounded w-8 ml-auto" />
                      </td>

                    </tr>
                  )
                )

              ) : empleadosFiltrados.length === 0 ? (

                /* Sin usuarios */
                <tr>
                  <td
                    colSpan={5}
                    className="
                      px-5
                      py-12
                      text-center
                      text-gray-600
                    "
                  >
                    <Users
                      size={48}
                      className="
                        mx-auto
                        text-gray-400
                        mb-3
                      "
                      aria-hidden="true"
                    />

                    <p>
                      No hay empleados {tabActivo} registrados.
                    </p>
                  </td>
                </tr>

              ) : (

                empleadosFiltrados.map(
                  (empleado) => (

                    <tr
                      key={
                        empleado.idEmpleado
                      }
                      className="
                        hover:bg-gray-50
                        transition-colors
                      "
                    >

                      {/* Empleado */}
                      <td className="px-5 py-4">

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <div
                            className="
                              w-8
                              h-8
                              rounded-full
                              bg-blue-50
                              text-blue-700
                              flex
                              items-center
                              justify-center
                              font-bold
                              text-xs
                            "
                            aria-hidden="true"
                          >
                            {empleado.nombres
                              ?.charAt(0)
                              .toUpperCase() ||
                              '?'}
                          </div>


                          <span
                            className="
                              font-bold
                              text-brand-main
                            "
                          >
                            {empleado.nombres}
                          </span>

                        </div>
                      </td>


                      {/* Username */}
                      <td
                        className="
                          px-5
                          py-4
                          text-gray-600
                          font-mono
                        "
                      >
                        @{empleado.username}
                      </td>


                      {/* Rol */}
                      <td className="px-5 py-4">

                        <span
                          className={`
                            px-2.5
                            py-1
                            rounded-lg
                            text-xs
                            font-bold
                            capitalize
                            ${getRolStyle(
                              empleado.rol
                            )}
                          `}
                        >
                          {empleado.rol}
                        </span>

                      </td>


                      {/* Estado */}
                      <td className="px-5 py-4 text-center">

                        <span
                          className={`
                            px-2
                            py-1
                            rounded-full
                            text-[10px]
                            font-bold

                            ${
                              empleado.activo === 1
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-red-50 text-red-700'
                            }
                          `}
                        >
                          {empleado.activo === 1
                            ? 'Activo'
                            : 'Inactivo'
                          }
                        </span>

                      </td>


                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">

                        <div
                          className="
                            flex
                            justify-end
                            gap-2
                          "
                        >

                          {/* Cambiar contraseña */}
                          {empleado.idEmpleado !== 1 && (
                            <button
                              type="button"
                              title={`Cambiar contraseña de ${empleado.nombres}`}
                              aria-label={`Cambiar contraseña de ${empleado.nombres}`}
                              onClick={() =>
                                setEmpleadoAEditarPassword(
                                  empleado
                                )
                              }
                              className="
                                p-2
                                text-orange-700
                                hover:bg-orange-50
                                rounded-lg
                                transition-colors
                              "
                            >
                              <Key
                                size={18}
                                aria-hidden="true"
                              />
                            </button>
                          )}


                          {/* Activar / desactivar */}
                          {empleado.idEmpleado !== 1 && (
                            <button
                              type="button"
                              title={
                                empleado.activo === 1
                                  ? `Desactivar acceso de ${empleado.nombres}`
                                  : `Reactivar acceso de ${empleado.nombres}`
                              }
                              aria-label={
                                empleado.activo === 1
                                  ? `Desactivar acceso de ${empleado.nombres}`
                                  : `Reactivar acceso de ${empleado.nombres}`
                              }
                              onClick={() =>
                                handleToggleEstado(
                                  empleado.idEmpleado,
                                  empleado.activo
                                )
                              }
                              className={`
                                p-2
                                rounded-lg
                                transition-colors

                                ${
                                  empleado.activo === 1
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-emerald-700 hover:bg-emerald-50'
                                }
                              `}
                            >
                              {empleado.activo === 1 ? (
                                <PowerOff
                                  size={18}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Power
                                  size={18}
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>

                  )
                )
              )}

            </tbody>
          </table>

        </div>
      </div>


      {/* ─────────────────────────────────────────────
          Modal nuevo usuario
      ───────────────────────────────────────────── */}

      {showModal && (
        <ModalUsuario
          onClose={() =>
            setShowModal(false)
          }
          onUpdate={
            fetchEmpleados
          }
        />
      )}


      {/* ─────────────────────────────────────────────
          Modal contraseña
      ───────────────────────────────────────────── */}

      {empleadoAEditarPassword && (
        <ModalEditPassword
          empleado={
            empleadoAEditarPassword
          }
          onClose={() =>
            setEmpleadoAEditarPassword(
              null
            )
          }
        />
      )}

    </div>
  );
};