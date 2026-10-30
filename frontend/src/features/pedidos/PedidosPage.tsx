import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  pedidosService,
  Pedido,
  EstadoPedido,
} from './pedidosService';

import { useAuthStore } from '@/core/store/authStore';
import { ModalCobro } from './ModalCobro';
import { ModalDetallePedido } from './ModalDetallePedido';

import toast from 'react-hot-toast';

import {
  RefreshCw,
  Filter,
  DollarSign,
  Eye,
  Search,
} from 'lucide-react';


// ─────────────────────────────────────────────────────────────
// Colores de badge por estado
// ─────────────────────────────────────────────────────────────

const ESTADO_STYLES: Record<EstadoPedido, string> = {
  Recibido:
    'bg-blue-100 text-blue-700',

  'En Proceso':
    'bg-amber-100 text-amber-700',

  Listo:
    'bg-emerald-100 text-emerald-700',

  Entregado:
    'bg-gray-100 text-gray-700',

  Cancelado:
    'bg-red-100 text-red-700',
};


const ESTADOS: EstadoPedido[] = [
  'Recibido',
  'En Proceso',
  'Listo',
  'Entregado',
  'Cancelado',
];


// ─────────────────────────────────────────────────────────────
// Skeleton de tabla
// ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr
    className="animate-pulse"
    aria-hidden="true"
  >
    {Array.from(
      { length: 6 },
      (_, index) => (
        <td
          key={index}
          className="px-4 py-3"
        >
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      )
    )}
  </tr>
);


// ─────────────────────────────────────────────────────────────
// Página de pedidos
// ─────────────────────────────────────────────────────────────

export const PedidosPage: React.FC = () => {
  const { user } = useAuthStore();

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filtroEstado, setFiltroEstado] =
    useState<string>('');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [total, setTotal] =
    useState(0);


  // ───────────────────────────────────────────────────────────
  // Debounce de búsqueda
  // ───────────────────────────────────────────────────────────

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);


  // ───────────────────────────────────────────────────────────
  // Modal de cobro
  // ───────────────────────────────────────────────────────────

  const [
    cobroPedidoSeleccionado,
    setCobroPedidoSeleccionado,
  ] = useState<{
    id: number;
    ticket: string;
  } | null>(null);


  // ───────────────────────────────────────────────────────────
  // Modal detalle
  // ───────────────────────────────────────────────────────────

  const [
    detallePedidoSeleccionado,
    setDetallePedidoSeleccionado,
  ] = useState<{
    id: number;
    ticket: string;
    estado: EstadoPedido;
  } | null>(null);


  // ───────────────────────────────────────────────────────────
  // Obtener pedidos
  // ───────────────────────────────────────────────────────────

  const fetchPedidos = useCallback(async () => {
    setLoading(true);

    try {
      const data =
        await pedidosService.getAll({
          estado:
            filtroEstado || undefined,

          search:
            searchQuery || undefined,
        });

      setPedidos(
        data.pedidos ?? []
      );

      setTotal(
        data.total ?? 0
      );
    } catch {
      toast.error(
        'Error al cargar los pedidos.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    filtroEstado,
    searchQuery,
  ]);


  // ───────────────────────────────────────────────────────────
  // Búsqueda con debounce
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }

    debounceRef.current =
      setTimeout(() => {
        fetchPedidos();
      }, 400);


    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        );
      }
    };
  }, [fetchPedidos]);


  // ───────────────────────────────────────────────────────────
  // Renderizado
  // ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ─────────────────────────────────────────────
          Header
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
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
            Pedidos Activos
          </h1>

          <p
            className="
              text-sm
              text-gray-600
              mt-1
            "
          >
            {total} pedido(s) encontrado(s)
          </p>
        </div>


        {/* ─────────────────────────────────────────
            Controles
        ───────────────────────────────────────── */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          {/* Búsqueda global */}
          <div
            className="
              flex
              items-center
              gap-2
              bg-white
              border
              border-gray-200
              rounded-xl
              px-3
              py-2
              text-sm
              max-w-xs
              w-full
              joyride-pedidos-busqueda
            "
          >
            <Search
              size={15}
              className="text-gray-600"
              aria-hidden="true"
            />

            <input
              type="search"
              placeholder="Buscar ticket, DNI o cliente..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              aria-label="Buscar pedido por ticket, DNI o cliente"
              className="
                outline-none
                text-brand-main
                bg-transparent
                w-full
              "
            />
          </div>


          {/* Filtro por estado */}
          <div
            className="
              flex
              items-center
              gap-2
              bg-white
              border
              border-gray-200
              rounded-xl
              px-3
              py-2
              text-sm
              joyride-pedidos-filtro
            "
          >
            <Filter
              size={15}
              className="text-gray-600"
              aria-hidden="true"
            />

            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
              aria-label="Filtrar pedidos por estado"
              className="
                outline-none
                text-brand-main
                bg-transparent
                cursor-pointer
              "
            >
              <option value="">
                Todos los estados
              </option>

              {ESTADOS.map((estado) => (
                <option
                  key={estado}
                  value={estado}
                >
                  {estado}
                </option>
              ))}
            </select>
          </div>


          {/* Actualizar */}
          <button
            type="button"
            onClick={fetchPedidos}
            disabled={loading}
            aria-label={
              loading
                ? 'Actualizando pedidos'
                : 'Actualizar lista de pedidos'
            }
            title="Actualizar pedidos"
            className="
              flex
              items-center
              gap-2
              bg-white
              border
              border-gray-200
              rounded-xl
              px-3
              py-2
              text-sm
              text-gray-700
              hover:text-blue-700
              hover:bg-gray-50
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
              joyride-pedidos-actualizar
            "
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            {loading
              ? 'Actualizando...'
              : 'Actualizar'
            }
          </button>

        </div>
      </div>


      {/* ─────────────────────────────────────────────
          Tabla de pedidos
      ───────────────────────────────────────────── */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-sm
          border
          border-gray-100
          overflow-hidden
          joyride-pedidos-tabla
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
                "
              >
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Ticket
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Cliente
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Estado
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Total
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  Recepción
                </th>

                <th
                  scope="col"
                  className="
                    px-4
                    py-3
                    font-semibold
                    joyride-pedidos-acciones
                  "
                >
                  Acciones
                </th>
              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                Array.from(
                  { length: 5 },
                  (_, index) => (
                    <SkeletonRow
                      key={index}
                    />
                  )
                )

              ) : pedidos.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-4
                      py-12
                      text-center
                      text-gray-600
                    "
                  >
                    No hay pedidos que mostrar con el
                    filtro seleccionado.
                  </td>
                </tr>

              ) : (

                pedidos.map((pedido) => (

                  <tr
                    key={pedido.idPedido}
                    className="
                      hover:bg-gray-50
                      transition-colors
                    "
                  >

                    {/* Ticket */}
                    <td
                      className="
                        px-4
                        py-3
                        font-mono
                        text-xs
                        text-blue-700
                        font-semibold
                      "
                    >
                      {pedido.codigoTicket}
                    </td>


                    {/* Cliente */}
                    <td
                      className="
                        px-4
                        py-3
                        font-medium
                        text-brand-main
                      "
                    >
                      {pedido.cliente}
                    </td>


                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span
                        className={`
                          px-2.5
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${ESTADO_STYLES[pedido.estado]}
                        `}
                      >
                        {pedido.estado}
                      </span>
                    </td>


                    {/* Total */}
                    <td
                      className="
                        px-4
                        py-3
                        font-semibold
                        text-brand-main
                      "
                    >
                      S/{' '}
                      {Number(
                        pedido.total
                      ).toFixed(2)}
                    </td>


                    {/* Fecha recepción */}
                    <td
                      className="
                        px-4
                        py-3
                        text-gray-600
                        text-xs
                      "
                    >
                      {new Date(
                        pedido.fechaRecepcion
                      ).toLocaleString(
                        'es-PE',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </td>


                    {/* Acciones */}
                    <td className="px-4 py-3">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        {/* Cobrar */}
                        {[
                          'cajero',
                          'admin',
                        ].includes(
                          user?.rol ?? ''
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              setCobroPedidoSeleccionado({
                                id:
                                  pedido.idPedido,

                                ticket:
                                  pedido.codigoTicket,
                              })
                            }
                            aria-label={`Cobrar pedido ${pedido.codigoTicket}`}
                            title="Registrar Pago"
                            className="
                              text-xs
                              flex
                              items-center
                              gap-1
                              bg-emerald-50
                              text-emerald-700
                              border
                              border-emerald-200
                              px-2
                              py-1
                              rounded-lg
                              hover:bg-emerald-100
                              transition-colors
                              font-medium
                            "
                          >
                            <DollarSign
                              size={14}
                              aria-hidden="true"
                            />

                            Cobrar
                          </button>
                        )}


                        {/* Ver detalle */}
                        <button
                          type="button"
                          onClick={() =>
                            setDetallePedidoSeleccionado({
                              id:
                                pedido.idPedido,

                              ticket:
                                pedido.codigoTicket,

                              estado:
                                pedido.estado,
                            })
                          }
                          aria-label={`Ver detalle del pedido ${pedido.codigoTicket}`}
                          title={`Ver detalle de ${pedido.codigoTicket}`}
                          className="
                            text-xs
                            flex
                            items-center
                            gap-1
                            bg-brand-bg
                            text-blue-700
                            border
                            border-blue-200
                            px-3
                            py-1
                            rounded-lg
                            hover:bg-blue-50
                            transition-colors
                            font-bold
                          "
                        >
                          <Eye
                            size={14}
                            aria-hidden="true"
                          />

                          Ver detalle
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>


      {/* ─────────────────────────────────────────────
          Modal de cobro
      ───────────────────────────────────────────── */}

      {cobroPedidoSeleccionado && (
        <ModalCobro
          idPedido={
            cobroPedidoSeleccionado.id
          }
          ticketCodigo={
            cobroPedidoSeleccionado.ticket
          }
          onClose={() =>
            setCobroPedidoSeleccionado(
              null
            )
          }
          onPagoExitoso={fetchPedidos}
        />
      )}


      {/* ─────────────────────────────────────────────
          Modal detalle pedido
      ───────────────────────────────────────────── */}

      {detallePedidoSeleccionado && (
        <ModalDetallePedido
          idPedido={
            detallePedidoSeleccionado.id
          }
          codigoTicket={
            detallePedidoSeleccionado.ticket
          }
          estadoActual={
            detallePedidoSeleccionado.estado
          }
          onClose={() =>
            setDetallePedidoSeleccionado(
              null
            )
          }
          onUpdate={fetchPedidos}
        />
      )}

    </div>
  );
};