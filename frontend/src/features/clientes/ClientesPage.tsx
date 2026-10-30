import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  clientesService,
  Cliente,
} from '@/features/pedidos/clientesService';

import { ModalHistorialCliente } from './ModalHistorialCliente';
import { ModalEditarCliente } from './ModalEditarCliente';

import toast from 'react-hot-toast';

import {
  Search,
  UserPlus,
  History,
  Edit3,
  Users,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';


export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [q, setQ] =
    useState('');


  // ───────────────────────────────────────────────────────────
  // Modales
  // ───────────────────────────────────────────────────────────

  const [
    clienteHistorial,
    setClienteHistorial,
  ] = useState<Cliente | null>(null);

  const [
    clienteEditar,
    setClienteEditar,
  ] = useState<Cliente | null>(null);


  // ───────────────────────────────────────────────────────────
  // Debounce
  // ───────────────────────────────────────────────────────────

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);


  // ───────────────────────────────────────────────────────────
  // Obtener clientes
  // ───────────────────────────────────────────────────────────

  const fetchClientes = useCallback(
    async (busqueda: string) => {
      setLoading(true);

      try {
        const data =
          await clientesService.getAll({
            q: busqueda,
          });

        setClientes(
          data.clientes ?? []
        );

        setTotal(
          data.paginacion?.total ?? 0
        );
      } catch {
        toast.error(
          'Error al cargar la lista de clientes.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );


  // ───────────────────────────────────────────────────────────
  // Carga inicial
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetchClientes('');
  }, [fetchClientes]);


  // Limpiar timeout al desmontar.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        );
      }
    };
  }, []);


  // ───────────────────────────────────────────────────────────
  // Búsqueda
  // ───────────────────────────────────────────────────────────

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value;

    setQ(value);


    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }


    debounceRef.current =
      setTimeout(() => {
        fetchClientes(value);
      }, 400);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ─────────────────────────────────────────────
          Header
      ───────────────────────────────────────────── */}

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
          <Users
            size={24}
            className="text-blue-700"
            aria-hidden="true"
          />

          Gestión de Clientes
        </h1>


        <p className="text-sm text-gray-600 mt-1">
          Busca clientes, actualiza su información y
          revisa su historial de pedidos.
        </p>
      </div>


      {/* ─────────────────────────────────────────────
          Toolbar
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          gap-4
          justify-between
          items-center
          bg-white
          p-4
          rounded-2xl
          shadow-sm
          border
          border-gray-100
        "
      >

        {/* Buscador */}
        <div
          className="
            relative
            w-full
            sm:w-96
            joyride-clientes-busqueda
          "
        >
          <Search
            size={18}
            className="
              absolute
              left-3
              top-3
              text-gray-600
            "
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={q}
            onChange={handleSearchChange}
            aria-label="Buscar cliente por nombre, DNI o teléfono"
            className="
              w-full
              bg-gray-50
              border
              border-gray-200
              text-brand-main
              text-sm
              rounded-xl
              focus:ring-brand-primary
              focus:border-brand-primary
              block
              pl-10
              p-2.5
              outline-none
              transition-all
            "
          />
        </div>


        {/* Registrar */}
        <button
          type="button"
          onClick={() =>
            navigate('/registrar-pedido')
          }
          className="
            btn-primary
            flex
            items-center
            gap-2
            whitespace-nowrap
            w-full
            sm:w-auto
            joyride-clientes-agregar
          "
        >
          <UserPlus
            size={18}
            aria-hidden="true"
          />

          Registrar Nuevo Cliente
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
          joyride-clientes-tabla
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
                  Cliente
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  DNI / Documento
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  Teléfono
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  Dirección
                </th>

                <th
                  scope="col"
                  className="
                    px-5
                    py-4
                    font-semibold
                    text-right
                    joyride-clientes-acciones
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
                  { length: 5 },
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
                        <div className="h-4 bg-gray-200 rounded w-40" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 bg-gray-200 rounded w-24 ml-auto" />
                      </td>
                    </tr>
                  )
                )

              ) : clientes.length === 0 ? (

                /* Sin resultados */
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
                      No se encontraron clientes que
                      coincidan con la búsqueda.
                    </p>
                  </td>
                </tr>

              ) : (

                /* Clientes */
                clientes.map((cliente) => (

                  <tr
                    key={cliente.idCliente}
                    className="
                      hover:bg-gray-50
                      transition-colors
                    "
                  >

                    {/* Cliente */}
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
                          {cliente.nombres
                            ?.charAt(0)
                            .toUpperCase() || '?'}
                        </div>


                        <span
                          className="
                            font-bold
                            text-brand-main
                          "
                        >
                          {cliente.nombres}
                        </span>

                      </div>
                    </td>


                    {/* Documento */}
                    <td
                      className="
                        px-5
                        py-4
                        text-gray-600
                        font-mono
                      "
                    >
                      {cliente.documento}
                    </td>


                    {/* Teléfono */}
                    <td className="px-5 py-4 font-medium">

                      {cliente.telefono ? (
                        <span className="text-brand-main">
                          {cliente.telefono}
                        </span>
                      ) : (
                        <span className="text-gray-600 italic">
                          Sin teléfono
                        </span>
                      )}

                    </td>


                    {/* Dirección */}
                    <td
                      className="
                        px-5
                        py-4
                        text-gray-600
                        truncate
                        max-w-[200px]
                      "
                    >
                      {cliente.direccion ? (
                        cliente.direccion
                      ) : (
                        <span className="text-gray-600 italic">
                          No especificada
                        </span>
                      )}
                    </td>


                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">

                      <div
                        className="
                          flex
                          justify-end
                          items-center
                          gap-2
                        "
                      >

                        {/* Historial */}
                        <button
                          type="button"
                          onClick={() =>
                            setClienteHistorial(
                              cliente
                            )
                          }
                          aria-label={`Ver historial de ${cliente.nombres}`}
                          title={`Ver historial de ${cliente.nombres}`}
                          className="
                            flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-purple-700
                            bg-purple-50
                            hover:bg-purple-100
                            rounded-lg
                            transition-colors
                          "
                        >
                          <History
                            size={14}
                            aria-hidden="true"
                          />

                          Historial
                        </button>


                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() =>
                            setClienteEditar(
                              cliente
                            )
                          }
                          aria-label={`Editar cliente ${cliente.nombres}`}
                          title={`Editar ${cliente.nombres}`}
                          className="
                            flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-blue-700
                            bg-blue-50
                            hover:bg-blue-100
                            rounded-lg
                            transition-colors
                          "
                        >
                          <Edit3
                            size={14}
                            aria-hidden="true"
                          />

                          Editar
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>


        {/* Footer */}
        {!loading && (
          <div
            className="
              px-5
              py-3
              border-t
              border-gray-100
              bg-gray-50
              flex
              items-center
              justify-between
              text-xs
              text-gray-600
            "
          >
            Mostrando {clientes.length} de {total}{' '}
            clientes encontrados.
          </div>
        )}

      </div>


      {/* ─────────────────────────────────────────────
          Modales
      ───────────────────────────────────────────── */}

      {clienteHistorial && (
        <ModalHistorialCliente
          idCliente={
            clienteHistorial.idCliente
          }
          nombreCliente={
            clienteHistorial.nombres
          }
          onClose={() =>
            setClienteHistorial(null)
          }
        />
      )}


      {clienteEditar && (
        <ModalEditarCliente
          cliente={clienteEditar}
          onClose={() =>
            setClienteEditar(null)
          }
          onUpdate={() =>
            fetchClientes(q)
          }
        />
      )}

    </div>
  );
};