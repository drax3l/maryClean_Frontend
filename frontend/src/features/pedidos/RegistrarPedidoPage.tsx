import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { pedidosService } from './pedidosService';
import { clientesService } from './clientesService';

import { usePedidoDraftStore } from '@/core/store/pedidoDraftStore';

import toast from 'react-hot-toast';

import {
  Search,
  Plus,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  DollarSign,
  Printer,
  Package,
} from 'lucide-react';

import {
  configuracionService,
  PrendaCatalogo,
} from '@/features/configuracion/configuracionService';

import { printTicket } from '@/core/utils/printUtils';


// ─────────────────────────────────────────────────────────────
// Modal del ticket
// ─────────────────────────────────────────────────────────────

interface ModalTicketProps {
  ticket: any;
  onClose: () => void;
}

const ModalTicket: React.FC<ModalTicketProps> = ({
  ticket,
  onClose,
}) => {
  return (
    <div
      className="
        fixed inset-0
        bg-black/50
        flex items-center justify-center
        z-50 p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-md
        "
      >

        {/* Encabezado */}
        <div
          className="
            bg-gradient-to-r
            from-brand-primary
            to-brand-purple
            p-5
            rounded-t-2xl
            text-white
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <h2
                id="ticket-modal-title"
                className="font-extrabold text-lg"
              >
                Pedido Registrado
              </h2>

              <p className="text-white/90 text-sm">
                {ticket?.encabezado?.ticket ?? ''}
              </p>
            </div>

            <CheckCircle
              size={32}
              aria-hidden="true"
            />
          </div>
        </div>


        {/* Contenido */}
        <div className="p-5 space-y-3">

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Cliente
            </span>

            <span className="font-semibold text-brand-main">
              {ticket?.cliente?.nombres ?? '-'}
            </span>
          </div>


          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Prendas
            </span>

            <span className="font-semibold text-brand-main">
              {ticket?.detalles?.length ?? 0} item(s)
            </span>
          </div>


          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-brand-main">
                Total del pedido
              </span>

              <span className="font-bold text-brand-main">
                S/ {Number(ticket?.total ?? 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Total pagado
              </span>

              <span className="font-bold text-emerald-700">
                S/ {Number(ticket?.total_pagado ?? 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold text-brand-main">
                Saldo pendiente
              </span>

              <span className="font-extrabold text-xl text-blue-700">
                S/ {Number(ticket?.saldo_pendiente ?? 0).toFixed(2)}
              </span>
            </div>
          </div>


          <p className="text-xs text-gray-600 text-center">
            Total, pagos y saldo calculados por el sistema.
          </p>

        </div>


        {/* Acciones */}
        <div className="p-4 border-t flex gap-3">

          <button
            type="button"
            onClick={() => printTicket(ticket)}
            className="
              px-4 py-2
              border-2
              border-blue-700
              text-blue-700
              font-bold
              rounded-xl
              hover:bg-blue-50
              transition-colors
              flex items-center
              justify-center
              gap-2
              w-full
            "
          >
            <Printer
              size={16}
              aria-hidden="true"
            />

            Imprimir
          </button>


          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full"
          >
            Cerrar
          </button>

        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// Página Registrar Pedido
// ─────────────────────────────────────────────────────────────

export const RegistrarPedidoPage: React.FC = () => {
  const navigate = useNavigate();

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prendaSeleccionada, setPrendaSeleccionada] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [buscandoCliente, setBuscandoCliente] =
    useState(false);

  const [ticketData, setTicketData] =
    useState<any>(null);


  // ───────────────────────────────────────────────────────────
  // Pago inicial
  // ───────────────────────────────────────────────────────────

  const [conPagoInicial, setConPagoInicial] =
    useState(false);

  const [montoPago, setMontoPago] =
    useState('');

  const [metodoPago, setMetodoPago] =
    useState('Efectivo');


  // ───────────────────────────────────────────────────────────
  // Borrador global
  // ───────────────────────────────────────────────────────────

  const {
    docBusqueda,
    setDocBusqueda,

    clienteEncontrado,
    setClienteEncontrado,

    mostrarFormCliente,
    setMostrarFormCliente,

    nuevoCliente,
    setNuevoCliente,

    detalles,
    agregarDetalle,
    cambiarCantidad,
    quitarDetalle,

    resetDraft,
  } = usePedidoDraftStore();


  // ───────────────────────────────────────────────────────────
  // Catálogo
  // ───────────────────────────────────────────────────────────

  const [catalogo, setCatalogo] =
    useState<PrendaCatalogo[]>([]);


  useEffect(() => {
    configuracionService
      .getCatalogo()
      .then((data) => {
        const activos =
          data.filter(
            (prenda) => prenda.estado === 1
          );

        setCatalogo(activos);
      })
      .catch((error) => {
        console.error(
          'Error al obtener catálogo:',
          error
        );

        toast.error(
          'Error al cargar las prendas del backend.'
        );
      });
  }, []);


  // ───────────────────────────────────────────────────────────
  // Buscar cliente
  // ───────────────────────────────────────────────────────────

  const buscarCliente = async (
    documento: string
  ) => {
    setBuscandoCliente(true);

    setClienteEncontrado(null);
    setMostrarFormCliente(false);

    try {
      const resultado =
        await clientesService.buscarPorDocumento(
          documento.trim()
        );

      if (resultado) {
        setClienteEncontrado(resultado);

        toast.success(
          `Cliente: ${resultado.nombres}`
        );
      } else {
        setMostrarFormCliente(true);

        setNuevoCliente({
          documento:
            documento.trim(),
        });

        toast(
          'Cliente no encontrado. Registra sus datos.'
        );
      }
    } catch {
      toast.error(
        'No se pudo buscar al cliente.'
      );
    } finally {
      setBuscandoCliente(false);
    }
  };


  // ───────────────────────────────────────────────────────────
  // Cambio de documento
  // ───────────────────────────────────────────────────────────

  const handleDocChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor =
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 12);

    setDocBusqueda(valor);

    setClienteEncontrado(null);
    setMostrarFormCliente(false);


    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      );
    }


    if (valor.length >= 7) {
      debounceRef.current =
        setTimeout(() => {
          buscarCliente(valor);
        }, 400);
    }
  };


  // Limpiar debounce cuando se desmonta el componente.
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
  // Agregar prenda
  // ───────────────────────────────────────────────────────────

  const handleAgregarPrenda = () => {
    if (!prendaSeleccionada) {
      toast.error(
        'Selecciona una prenda.'
      );

      return;
    }


    const prenda =
      catalogo.find(
        (item) =>
          item.idPrenda ===
          prendaSeleccionada
      );


    if (!prenda) {
      return;
    }


    agregarDetalle({
      ...prenda,

      cantidad: 1,

      descripcion:
        prenda.nombrePrenda,
    });


    setPrendaSeleccionada(0);
  };


  // ───────────────────────────────────────────────────────────
  // Subtotal visual
  // ───────────────────────────────────────────────────────────

  const subtotalVisual =
    detalles.reduce(
      (acumulado, detalle) =>
        acumulado +
        detalle.precio *
        detalle.cantidad,

      0
    );


  // ───────────────────────────────────────────────────────────
  // Registrar pedido
  // ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (
      !clienteEncontrado &&
      !mostrarFormCliente
    ) {
      toast.error(
        'Busca al cliente primero.'
      );

      return;
    }


    if (detalles.length === 0) {
      toast.error(
        'Agrega al menos una prenda.'
      );

      return;
    }


    setSubmitting(true);


    try {
      let idCliente =
        clienteEncontrado?.idCliente;


      // Registrar nuevo cliente.
      if (!idCliente) {
        if (
          !nuevoCliente.nombres ||
          !nuevoCliente.telefono
        ) {
          toast.error(
            'Completa nombre y teléfono del cliente.'
          );

          return;
        }


        const creado =
          await clientesService.crear(
            nuevoCliente
          );

        idCliente =
          creado.idCliente;

        toast.success(
          'Cliente registrado.'
        );
      }


      const payload: any = {
        idCliente,

        detalles:
          detalles.map((detalle) => ({
            idPrenda:
              detalle.idPrenda,

            cantidad:
              detalle.cantidad,

            descripcion:
              detalle.descripcion,
          })),
      };


      // Pago inicial opcional.
      if (conPagoInicial) {
        const monto = Number(montoPago);


        if (
          !Number.isFinite(monto) ||
          monto <= 0
        ) {
          toast.error(
            'El adelanto debe ser mayor a S/ 0.00.'
          );

          return;
        }


        if (monto > subtotalVisual) {
          toast.error(
            `El adelanto no puede superar el total del pedido (S/ ${subtotalVisual.toFixed(2)}).`
          );

          return;
        }


        payload.pagoInicial = {
          monto: Number(
            monto.toFixed(2)
          ),

          metodo:
            metodoPago,
        };
      }


      const resultado =
        await pedidosService.crear(
          payload
        );


      setTicketData(
        resultado.data.ticket
      );


      toast.success(
        'Pedido registrado exitosamente.'
      );


      // Limpiar borrador solamente después del registro.
      resetDraft();

      setConPagoInicial(false);
      setMontoPago('');
      setMetodoPago('Efectivo');

    } catch (error: any) {
      const data =
        error?.response?.data;


      const mensaje =
        data?.errors?.pagoInicial ??
        data?.errors?.monto ??
        data?.message ??
        'Error al registrar el pedido.';


      toast.error(
        mensaje
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ───────────────────────────────────────────────────────────
  // Renderizado
  // ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ─────────────────────────────────────────────
          Borrador guardado
      ───────────────────────────────────────────── */}

      {(detalles.length > 0 ||
        clienteEncontrado) && (
        <div
          className="
            flex
            items-center
            justify-between
            bg-amber-50
            border
            border-amber-200
            rounded-xl
            px-4 py-2
            text-sm
          "
        >
          <span className="text-amber-800">
            Tienes un pedido en borrador guardado.
          </span>

          <button
            type="button"
            onClick={resetDraft}
            className="
              text-red-700
              hover:underline
              font-medium
            "
          >
            Limpiar borrador
          </button>
        </div>
      )}


      {/* ─────────────────────────────────────────────
          Encabezado
      ───────────────────────────────────────────── */}

      <div>
        <h1
          className="
            text-2xl
            font-extrabold
            text-brand-main
          "
        >
          Registrar Pedido
        </h1>

        <p
          className="
            text-sm
            text-gray-600
            mt-1
          "
        >
          Busca al cliente por DNI y agrega las prendas
          del servicio.
        </p>
      </div>


      {/* ─────────────────────────────────────────────
          Paso 1: Cliente
      ───────────────────────────────────────────── */}

      <section
        className="
          card
          space-y-4
          joyride-registrar-cliente
        "
        aria-labelledby="registrar-cliente-title"
      >
        <h2
          id="registrar-cliente-title"
          className="
            font-bold
            text-brand-main
            flex
            items-center
            gap-2
          "
        >
          <User
            size={18}
            aria-hidden="true"
          />

          Paso 1: Identificar Cliente
        </h2>


        <div className="flex gap-3">

          <div className="relative flex-1">
            <Search
              size={16}
              className="
                absolute
                left-3
                top-3
                text-gray-600
              "
              aria-hidden="true"
            />

            <input
              type="text"
              value={docBusqueda}
              onChange={handleDocChange}
              placeholder="Ingresa DNI o documento del cliente..."
              aria-label="DNI o documento del cliente"
              className="input-field pl-9"
              maxLength={12}
              inputMode="numeric"
            />
          </div>


          {buscandoCliente && (
            <span
              className="
                flex
                items-center
                text-sm
                text-gray-600
                animate-pulse
              "
              role="status"
              aria-live="polite"
            >
              Buscando...
            </span>
          )}

        </div>


        {/* Cliente encontrado */}
        {clienteEncontrado && (
          <div
            className="
              flex
              items-center
              gap-3
              bg-emerald-50
              border
              border-emerald-200
              rounded-xl
              p-4
            "
          >
            <CheckCircle
              size={20}
              className="
                text-emerald-700
                flex-shrink-0
              "
              aria-hidden="true"
            />


            <div className="flex-1">

              <p className="font-bold text-brand-main">
                {clienteEncontrado.nombres}
              </p>

              <p className="text-sm text-gray-600">
                DNI: {clienteEncontrado.documento}
                {' · '}
                Tel: {clienteEncontrado.telefono}
              </p>

            </div>


            <button
              type="button"
              onClick={() => {
                setClienteEncontrado(null);
                setDocBusqueda('');
              }}
              aria-label="Quitar cliente seleccionado"
              title="Quitar cliente"
              className="
                text-gray-600
                hover:text-red-700
                transition-colors
              "
            >
              <XCircle
                size={18}
                aria-hidden="true"
              />
            </button>

          </div>
        )}


        {/* Nuevo cliente */}
        {mostrarFormCliente &&
          !clienteEncontrado && (
            <div
              className="
                bg-amber-50
                border
                border-amber-200
                rounded-xl
                p-4
                space-y-3
              "
            >

              <p className="text-sm font-semibold text-amber-800">
                Cliente nuevo — Completa sus datos:
              </p>


              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                "
              >

                <input
                  value={
                    nuevoCliente.documento
                  }
                  readOnly
                  aria-label="Documento del nuevo cliente"
                  className="
                    input-field
                    bg-gray-100
                  "
                  placeholder="Documento"
                />


                <input
                  value={
                    nuevoCliente.nombres
                  }
                  onChange={(e) =>
                    setNuevoCliente({
                      nombres:
                        e.target.value,
                    })
                  }
                  aria-label="Nombres completos del nuevo cliente"
                  className="input-field"
                  placeholder="Nombres completos *"
                />


                <input
                  value={
                    nuevoCliente.telefono
                  }
                  onChange={(e) =>
                    setNuevoCliente({
                      telefono:
                        e.target.value,
                    })
                  }
                  aria-label="Teléfono del nuevo cliente"
                  className="input-field"
                  placeholder="Teléfono *"
                  maxLength={15}
                />


                <input
                  value={
                    nuevoCliente.direccion
                  }
                  onChange={(e) =>
                    setNuevoCliente({
                      direccion:
                        e.target.value,
                    })
                  }
                  aria-label="Dirección del nuevo cliente"
                  className="input-field"
                  placeholder="Dirección (opcional)"
                />

              </div>
            </div>
          )}

      </section>


      {/* ─────────────────────────────────────────────
          Paso 2: Prendas
      ───────────────────────────────────────────── */}

      <section
        className="
          card
          space-y-4
          joyride-registrar-prendas
        "
        aria-labelledby="registrar-prendas-title"
      >

        <h2
          id="registrar-prendas-title"
          className="
            font-bold
            text-brand-main
            flex
            items-center
            gap-2
          "
        >
          <Plus
            size={18}
            aria-hidden="true"
          />

          Paso 2: Agregar Prendas
        </h2>


        <div className="flex gap-3">

          <select
            value={prendaSeleccionada}
            onChange={(e) =>
              setPrendaSeleccionada(
                Number(e.target.value)
              )
            }
            aria-label="Seleccionar prenda y servicio"
            className="input-field flex-1"
          >
            <option value={0}>
              -- Selecciona prenda y servicio --
            </option>


            {Array.from(
              new Set(
                catalogo.map(
                  (prenda) =>
                    prenda.servicio
                )
              )
            ).map((servicio) => (

              <optgroup
                key={servicio}
                label={servicio}
              >
                {catalogo
                  .filter(
                    (prenda) =>
                      prenda.servicio ===
                      servicio
                  )
                  .map((prenda) => (
                    <option
                      key={
                        prenda.idPrenda
                      }
                      value={
                        prenda.idPrenda
                      }
                    >
                      {prenda.nombrePrenda}
                      {' — '}
                      S/{' '}
                      {prenda.precio.toFixed(2)}
                    </option>
                  ))}
              </optgroup>

            ))}
          </select>


          <button
            type="button"
            onClick={handleAgregarPrenda}
            className="
              btn-primary
              flex
              items-center
              gap-2
              whitespace-nowrap
            "
          >
            <Plus
              size={16}
              aria-hidden="true"
            />

            Agregar
          </button>

        </div>


        {/* Tabla de prendas */}
        {detalles.length > 0 ? (

          <div
            className="
              rounded-xl
              border
              border-gray-100
              overflow-hidden
            "
          >

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr
                    className="
                      bg-brand-bg
                      text-gray-700
                    "
                  >
                    <th
                      scope="col"
                      className="
                        px-4 py-2
                        text-left
                        font-semibold
                      "
                    >
                      Prenda
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4 py-2
                        text-center
                        font-semibold
                      "
                    >
                      Cant.
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4 py-2
                        text-right
                        font-semibold
                      "
                    >
                      P. Unit.
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4 py-2
                        text-right
                        font-semibold
                      "
                    >
                      Subtotal
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2"
                    >
                      <span className="sr-only">
                        Acciones
                      </span>
                    </th>
                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-100">

                  {detalles.map(
                    (detalle, index) => (

                      <tr
                        key={`${detalle.idPrenda}-${index}`}
                        className="hover:bg-gray-50"
                      >

                        {/* Prenda */}
                        <td
                          className="
                            px-4 py-2
                            font-medium
                            text-brand-main
                          "
                        >
                          {detalle.nombrePrenda}
                        </td>


                        {/* Cantidad */}
                        <td className="px-4 py-2 text-center">

                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              gap-1
                            "
                          >

                            <button
                              type="button"
                              onClick={() =>
                                cambiarCantidad(
                                  index,
                                  Math.max(
                                    1,
                                    detalle.cantidad - 1
                                  )
                                )
                              }
                              aria-label={`Reducir cantidad de ${detalle.nombrePrenda}`}
                              title="Reducir cantidad"
                              className="
                                w-7 h-7
                                flex
                                items-center
                                justify-center
                                rounded-md
                                border
                                border-gray-300
                                text-gray-700
                                hover:bg-blue-50
                                hover:text-blue-700
                                transition-colors
                              "
                            >
                              -
                            </button>


                            <span
                              className="
                                w-8
                                text-center
                                font-bold
                                text-brand-main
                              "
                              aria-label={`Cantidad ${Math.floor(
                                detalle.cantidad
                              )}`}
                            >
                              {Math.floor(
                                detalle.cantidad
                              )}
                            </span>


                            <button
                              type="button"
                              onClick={() =>
                                cambiarCantidad(
                                  index,
                                  Math.floor(
                                    detalle.cantidad
                                  ) + 1
                                )
                              }
                              aria-label={`Aumentar cantidad de ${detalle.nombrePrenda}`}
                              title="Aumentar cantidad"
                              className="
                                w-7 h-7
                                flex
                                items-center
                                justify-center
                                rounded-md
                                border
                                border-gray-300
                                text-gray-700
                                hover:bg-blue-50
                                hover:text-blue-700
                                transition-colors
                              "
                            >
                              +
                            </button>

                          </div>
                        </td>


                        {/* Precio */}
                        <td
                          className="
                            px-4 py-2
                            text-right
                            text-gray-600
                          "
                        >
                          S/{' '}
                          {detalle.precio.toFixed(2)}
                        </td>


                        {/* Subtotal */}
                        <td
                          className="
                            px-4 py-2
                            text-right
                            font-semibold
                            text-brand-main
                          "
                        >
                          S/{' '}
                          {(
                            detalle.precio *
                            detalle.cantidad
                          ).toFixed(2)}
                        </td>


                        {/* Eliminar */}
                        <td className="px-4 py-2 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              quitarDetalle(index)
                            }
                            aria-label={`Eliminar ${detalle.nombrePrenda} del pedido`}
                            title="Eliminar prenda"
                            className="
                              text-red-600
                              hover:text-red-800
                              transition-colors
                            "
                          >
                            <Trash2
                              size={15}
                              aria-hidden="true"
                            />
                          </button>

                        </td>
                      </tr>

                    )
                  )}

                </tbody>
              </table>

            </div>


            {/* Subtotal */}
            <div
              className="
                bg-brand-bg
                px-4 py-3
                flex
                justify-between
                items-center
              "
            >
              <span className="text-sm text-gray-600">
                Subtotal estimado (referencial)
              </span>

              <span className="text-lg font-extrabold text-blue-700">
                S/ {subtotalVisual.toFixed(2)}
              </span>
            </div>


            <p className="text-xs text-gray-600 text-center pb-2">
              El total final lo calcula la base de datos.
            </p>

          </div>

        ) : (

          <div
            className="
              text-center
              py-8
              text-gray-600
            "
          >
            <div
              className="
                flex
                justify-center
                mb-2
              "
              aria-hidden="true"
            >
              <Package
                size={48}
                className="text-gray-400"
              />
            </div>

            <p className="text-sm">
              Aún no has agregado prendas al pedido.
            </p>
          </div>

        )}

      </section>


      {/* ─────────────────────────────────────────────
          Paso 3: Pago inicial
      ───────────────────────────────────────────── */}

      <section
        className="
          card
          space-y-4
          joyride-registrar-pago
        "
        aria-labelledby="registrar-pago-title"
      >

        <div className="flex items-center justify-between gap-4">

          <h2
            id="registrar-pago-title"
            className="
              font-bold
              text-brand-main
              flex
              items-center
              gap-2
            "
          >
            <DollarSign
              size={18}
              aria-hidden="true"
            />

            Paso 3: Pago Inicial / Adelanto (Opcional)
          </h2>


          <label
            className="
              flex
              items-center
              gap-2
              cursor-pointer
            "
          >
            <input
              type="checkbox"
              checked={conPagoInicial}
              onChange={(e) =>
                setConPagoInicial(
                  e.target.checked
                )
              }
              className="
                rounded
                text-brand-primary
                focus:ring-brand-primary
              "
            />

            <span className="text-sm font-medium text-gray-700">
              Registrar adelanto ahora
            </span>
          </label>

        </div>


        {conPagoInicial && (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
              bg-purple-50
              p-4
              rounded-xl
              border
              border-purple-100
            "
          >

            {/* Monto */}
            <div>
              <label
                htmlFor="monto-pago-inicial"
                className="
                  block
                  text-xs
                  font-bold
                  text-gray-700
                  uppercase
                  mb-1
                "
              >
                Monto a pagar (S/)
              </label>

              <input
                id="monto-pago-inicial"
                type="number"
                min="0.01"
                max={subtotalVisual}
                step="0.01"
                value={montoPago}
                onChange={(e) =>
                  setMontoPago(
                    e.target.value
                  )
                }
                placeholder={`Máximo S/ ${subtotalVisual.toFixed(2)}`}
                aria-describedby="monto-pago-ayuda"
                className="input-field bg-white"
              />
            </div>


            {/* Método */}
            <div>
              <label
                htmlFor="metodo-pago-inicial"
                className="
                  block
                  text-xs
                  font-bold
                  text-gray-700
                  uppercase
                  mb-1
                "
              >
                Método de Pago
              </label>

              <select
                id="metodo-pago-inicial"
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(
                    e.target.value
                  )
                }
                className="input-field bg-white"
              >
                <option value="Efectivo">
                  Efectivo
                </option>

                <option value="Tarjeta">
                  Tarjeta (POS)
                </option>

                <option value="Yape/Plin">
                  Yape / Plin
                </option>
              </select>
            </div>


            <p
              id="monto-pago-ayuda"
              className="
                sm:col-span-2
                text-xs
                text-purple-800
              "
            >
              El adelanto no puede superar el total del pedido.
              Se registrará como pago realizado y reducirá el saldo pendiente.
            </p>

          </div>

        )}

      </section>


      {/* ─────────────────────────────────────────────
          Acciones
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          justify-end
          gap-3
          joyride-registrar-acciones
        "
      >

        <button
          type="button"
          onClick={() =>
            navigate('/pedidos')
          }
          className="
            px-5
            py-2.5
            rounded-xl
            border
            border-gray-300
            text-gray-700
            hover:bg-gray-50
            text-sm
            font-medium
          "
        >
          Cancelar
        </button>


        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            submitting ||
            (
              !clienteEncontrado &&
              !mostrarFormCliente
            ) ||
            detalles.length === 0
          }
          className="
            btn-primary
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting
            ? 'Registrando...'
            : 'Registrar Pedido'
          }
        </button>

      </div>


      {/* Ticket */}
      {ticketData && (
        <ModalTicket
          ticket={ticketData}
          onClose={() => {
            setTicketData(null);

            navigate(
              '/pedidos'
            );
          }}
        />
      )}

    </div>
  );
};