import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import ReactDOM from 'react-dom';

import {
  pagosService,
  PagoHistorial,
  MetodoPago,
} from './pagosService';

import toast from 'react-hot-toast';

import {
  X,
  DollarSign,
  CreditCard,
  Smartphone,
  Printer,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { printRecibo } from '@/core/utils/printUtils';

import { ModalHelp } from '@/shared/components/ModalHelp';


interface ModalCobroProps {
  idPedido: number;
  ticketCodigo: string;
  onClose: () => void;
  onPagoExitoso: () => void;
}


export const ModalCobro: React.FC<ModalCobroProps> = ({
  idPedido,
  ticketCodigo,
  onClose,
  onPagoExitoso,
}) => {

  const [historial, setHistorial] =
    useState<PagoHistorial | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [monto, setMonto] =
    useState('');

  const [metodo, setMetodo] =
    useState<MetodoPago>('Efectivo');

  const [submitting, setSubmitting] =
    useState(false);

  const [recibo, setRecibo] =
    useState<any>(null);


  // ─────────────────────────────────────────────────────────────
  // Valores financieros
  // ─────────────────────────────────────────────────────────────

  const totalPedido =
    Number(historial?.total ?? 0);

  const totalPagado =
    Number(historial?.total_pagado ?? 0);

  const saldoPendiente =
    Number(historial?.saldo_pendiente ?? 0);


  const estadoPago = useMemo(() => {
    if (saldoPendiente <= 0) {
      return 'Pagado';
    }

    if (totalPagado > 0) {
      return 'Parcial';
    }

    return 'Pendiente';
  }, [
    saldoPendiente,
    totalPagado,
  ]);


  // ─────────────────────────────────────────────────────────────
  // Cargar historial
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    pagosService
      .obtenerHistorial(idPedido)

      .then((res) => {
        if (!mounted) {
          return;
        }

        setHistorial(res);

        const saldo =
          Number(
            res.saldo_pendiente ?? 0
          );

        if (saldo > 0) {
          setMonto(
            saldo.toFixed(2)
          );
        } else {
          setMonto('');
        }
      })

      .catch(() => {
        if (mounted) {
          toast.error(
            'Error al cargar el historial de pagos.'
          );
        }
      })

      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });


    return () => {
      mounted = false;
    };
  }, [idPedido]);


  // ─────────────────────────────────────────────────────────────
  // Registrar pago
  // ─────────────────────────────────────────────────────────────

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();


    if (!historial) {
      toast.error(
        'No se pudo obtener la información del pedido.'
      );

      return;
    }


    const montoFloat =
      Number(monto);


    if (
      !Number.isFinite(montoFloat)
      || montoFloat <= 0
    ) {
      toast.error(
        'El monto del pago debe ser mayor a S/ 0.00.'
      );

      return;
    }


    /*
     * Comparar en céntimos para evitar errores
     * de precisión de números decimales.
     */
    const montoCentimos =
      Math.round(
        montoFloat * 100
      );

    const saldoCentimos =
      Math.round(
        saldoPendiente * 100
      );


    if (
      montoCentimos >
      saldoCentimos
    ) {
      toast.error(
        `El pago no puede superar el saldo pendiente de S/ ${saldoPendiente.toFixed(2)}.`
      );

      return;
    }


    if (
      saldoCentimos <= 0
    ) {
      toast.error(
        'Este pedido ya no tiene saldo pendiente.'
      );

      return;
    }


    setSubmitting(true);


    try {

      const res =
        await pagosService.registrarPago({
          idPedido,

          monto:
            Number(
              montoFloat.toFixed(2)
            ),

          metodo,
        });


      setRecibo(
        res.data.recibo
      );


      toast.success(
        res.message
        || 'Pago registrado correctamente.'
      );


      // Actualizar resumen financiero.
      const nuevoHistorial =
        await pagosService
          .obtenerHistorial(
            idPedido
          );


      setHistorial(
        nuevoHistorial
      );


      const nuevoSaldo =
        Number(
          nuevoHistorial
            .saldo_pendiente
          ?? 0
        );


      if (nuevoSaldo > 0) {
        setMonto(
          nuevoSaldo.toFixed(2)
        );
      } else {
        setMonto('');
      }


      onPagoExitoso();


    } catch (error: any) {

      const data =
        error?.response?.data;

      const codigoError =
        data?.errors?.codigo_error;


      const esSobrepago =
        codigoError === 'SOBREPAGO'
        || codigoError ===
          'SOBREPAGO_TRIGGER_45000';


      const sinSaldo =
        codigoError ===
        'SIN_SALDO_PENDIENTE';


      let mensaje =
        data?.errors?.monto
        ?? data?.message
        ?? 'Error al registrar el pago.';


      if (esSobrepago) {
        mensaje =
          `El pago no puede superar el saldo pendiente de S/ ${saldoPendiente.toFixed(2)}.`;
      }


      if (sinSaldo) {
        mensaje =
          'Este pedido ya se encuentra completamente pagado.';
      }


      toast.error(
        mensaje
      );

    } finally {
      setSubmitting(false);
    }
  };


  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return ReactDOM.createPortal(
      <div
        className="
          fixed inset-0
          bg-black/50
          flex
          items-center
          justify-center
          z-[100]
          p-4
        "
        role="status"
        aria-live="polite"
        aria-label="Cargando información de pagos"
      >
        <div
          className="
            bg-white
            rounded-2xl
            p-6
            shadow-2xl
            w-full
            max-w-md
            animate-pulse
          "
        >
          <div
            className="
              h-6
              bg-gray-200
              rounded
              w-1/2
              mb-4
            "
          />

          <div
            className="
              h-32
              bg-gray-100
              rounded
              mb-4
            "
          />

          <span className="sr-only">
            Cargando historial de pagos...
          </span>
        </div>
      </div>,

      document.body
    );
  }


  // ─────────────────────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────────────────────

  return ReactDOM.createPortal(

    <div
      className="
        fixed inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-[100]
        p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cobro-title"
      aria-describedby="modal-cobro-description"
    >

      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-md
          overflow-hidden
          flex
          flex-col
          max-h-[90vh]
        "
      >

        {/* ─────────────────────────────────────────────
            Header
        ───────────────────────────────────────────── */}

        <div
          className="
            bg-brand-bg
            px-5 py-4
            border-b
            flex
            justify-between
            items-center
            gap-3
          "
        >

          <div>

            <h2
              id="modal-cobro-title"
              className="
                font-extrabold
                text-brand-main
                text-lg
              "
            >
              Cobrar Pedido
            </h2>


            <p
              id="modal-cobro-description"
              className="
                text-xs
                font-mono
                text-blue-700
              "
            >
              {ticketCodigo}
            </p>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <ModalHelp
              label="¿Cómo usar?"
              items={[
                {
                  icon:
                    <DollarSign
                      size={20}
                      aria-hidden="true"
                    />,

                  title:
                    'Resumen de Pagos',

                  description:
                    'Muestra el total del pedido, cuánto se ha pagado y el saldo pendiente.',
                },

                {
                  icon:
                    <CreditCard
                      size={20}
                      aria-hidden="true"
                    />,

                  title:
                    'Monto a Cobrar',

                  description:
                    'El campo se completa con el saldo pendiente. Puedes ingresar un importe menor para registrar un abono parcial.',
                },

                {
                  icon:
                    <Smartphone
                      size={20}
                      aria-hidden="true"
                    />,

                  title:
                    'Método de Pago',

                  description:
                    'Selecciona Efectivo, Tarjeta o Yape/Plin.',
                },

                {
                  icon:
                    <CheckCircle
                      size={20}
                      aria-hidden="true"
                    />,

                  title:
                    'Pagos Anteriores',

                  description:
                    'Muestra cada abono registrado anteriormente con fecha, monto y método.',
                },

                {
                  icon:
                    <Printer
                      size={20}
                      aria-hidden="true"
                    />,

                  title:
                    'Imprimir Recibo',

                  description:
                    'Después de registrar el pago puedes imprimir el recibo correspondiente.',
                },
              ]}
            />


            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana de cobro"
              title="Cerrar"
              className="
                p-2
                text-gray-600
                hover:text-red-700
                hover:bg-red-50
                rounded-lg
                transition-colors
              "
            >
              <X
                size={20}
                aria-hidden="true"
              />
            </button>

          </div>

        </div>


        {/* ─────────────────────────────────────────────
            Contenido
        ───────────────────────────────────────────── */}

        <div
          className="
            p-5
            overflow-y-auto
            space-y-5
          "
        >

          {/* ─────────────────────────────────────────
              Resumen financiero
          ───────────────────────────────────────── */}

          <section
            className="
              bg-gray-50
              rounded-xl
              p-4
              border
              border-gray-200
              space-y-3
            "
            aria-labelledby="resumen-pago-title"
          >

            <div
              className="
                flex
                justify-between
                items-center
              "
            >
              <h3
                id="resumen-pago-title"
                className="
                  text-sm
                  font-bold
                  text-brand-main
                "
              >
                Resumen de pago
              </h3>


              <span
                className={`
                  px-2.5
                  py-1
                  rounded-full
                  text-xs
                  font-bold

                  ${
                    estadoPago === 'Pagado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : estadoPago === 'Parcial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200 text-gray-800'
                  }
                `}
              >
                {estadoPago}
              </span>
            </div>


            <div
              className="
                flex
                justify-between
                gap-4
              "
            >
              <span className="text-sm text-gray-600">
                Total del pedido
              </span>

              <span className="font-semibold text-brand-main">
                S/ {totalPedido.toFixed(2)}
              </span>
            </div>


            <div
              className="
                flex
                justify-between
                gap-4
                border-b
                pb-3
                border-gray-200
              "
            >
              <span className="text-sm text-gray-600">
                Total pagado
              </span>

              <span className="font-semibold text-emerald-700">
                S/ {totalPagado.toFixed(2)}
              </span>
            </div>


            <div
              className="
                flex
                justify-between
                items-center
                gap-4
              "
            >
              <span className="font-bold text-brand-main">
                Saldo pendiente
              </span>

              <span
                className={`
                  text-2xl
                  font-extrabold

                  ${
                    saldoPendiente > 0
                      ? 'text-red-700'
                      : 'text-emerald-700'
                  }
                `}
              >
                S/ {Math.max(
                  0,
                  saldoPendiente
                ).toFixed(2)}
              </span>
            </div>

          </section>


          {/* ─────────────────────────────────────────
              Formulario
          ───────────────────────────────────────── */}

          {historial
            && saldoPendiente > 0
            && !recibo && (

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Monto */}

              <div>

                <label
                  htmlFor="monto-cobro"
                  className="
                    block
                    text-xs
                    font-semibold
                    text-gray-700
                    mb-1
                    uppercase
                    tracking-wider
                  "
                >
                  Monto a cobrar (S/)
                </label>


                <input
                  id="monto-cobro"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={saldoPendiente}
                  value={monto}
                  onChange={(event) =>
                    setMonto(
                      event.target.value
                    )
                  }
                  aria-describedby="monto-cobro-ayuda"
                  className="
                    input-field
                    text-lg
                    font-bold
                  "
                  autoFocus
                  required
                />


                <p
                  id="monto-cobro-ayuda"
                  className="
                    mt-1
                    text-xs
                    text-gray-600
                  "
                >
                  Máximo disponible: S/{' '}
                  {saldoPendiente.toFixed(2)}.
                  Puedes ingresar un monto menor
                  para registrar un abono parcial.
                </p>

              </div>


              {/* Método */}

              <fieldset>

                <legend
                  className="
                    block
                    text-xs
                    font-semibold
                    text-gray-700
                    mb-2
                    uppercase
                    tracking-wider
                  "
                >
                  Método de pago
                </legend>


                <div
                  className="
                    grid
                    grid-cols-3
                    gap-2
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setMetodo(
                        'Efectivo'
                      )
                    }
                    aria-pressed={
                      metodo === 'Efectivo'
                    }
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      p-3
                      rounded-xl
                      border
                      transition-colors

                      ${
                        metodo === 'Efectivo'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <DollarSign
                      size={20}
                      className="mb-1"
                      aria-hidden="true"
                    />

                    <span className="text-xs font-medium">
                      Efectivo
                    </span>
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setMetodo(
                        'Tarjeta'
                      )
                    }
                    aria-pressed={
                      metodo === 'Tarjeta'
                    }
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      p-3
                      rounded-xl
                      border
                      transition-colors

                      ${
                        metodo === 'Tarjeta'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <CreditCard
                      size={20}
                      className="mb-1"
                      aria-hidden="true"
                    />

                    <span className="text-xs font-medium">
                      Tarjeta
                    </span>
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setMetodo(
                        'Yape/Plin'
                      )
                    }
                    aria-pressed={
                      metodo === 'Yape/Plin'
                    }
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      p-3
                      rounded-xl
                      border
                      transition-colors

                      ${
                        metodo === 'Yape/Plin'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Smartphone
                      size={20}
                      className="mb-1"
                      aria-hidden="true"
                    />

                    <span className="text-xs font-medium">
                      Yape/Plin
                    </span>
                  </button>

                </div>

              </fieldset>


              <button
                type="submit"
                disabled={
                  submitting
                  || saldoPendiente <= 0
                  || monto.trim() === ''
                }
                className="
                  btn-primary
                  w-full
                  mt-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <DollarSign
                  size={18}
                  aria-hidden="true"
                />

                {submitting
                  ? 'Procesando...'
                  : 'Registrar Pago'}
              </button>

            </form>
          )}


          {/* ─────────────────────────────────────────
              Historial
          ───────────────────────────────────────── */}

          {historial
            && historial.pagos.length > 0
            && !recibo && (

            <section
              aria-labelledby="pagos-anteriores-title"
            >

              <h3
                id="pagos-anteriores-title"
                className="
                  text-xs
                  font-bold
                  text-gray-700
                  uppercase
                  mb-2
                "
              >
                Pagos anteriores
              </h3>


              <div className="space-y-2">

                {historial.pagos.map(
                  (pago) => (

                  <div
                    key={pago.idPago}
                    className="
                      flex
                      justify-between
                      items-center
                      gap-4
                      text-sm
                      border
                      border-gray-200
                      rounded-lg
                      p-3
                      bg-white
                    "
                  >

                    <div className="flex flex-col">

                      <span className="font-semibold text-brand-main">
                        {pago.metodo}
                      </span>


                      <span className="text-xs text-gray-600">
                        {new Date(
                          pago.fechaPago
                        ).toLocaleString(
                          'es-PE'
                        )}
                      </span>

                    </div>


                    <span className="font-bold text-emerald-700">
                      S/{' '}
                      {Number(
                        pago.monto
                      ).toFixed(2)}
                    </span>

                  </div>

                ))}

              </div>

            </section>

          )}


          {/* ─────────────────────────────────────────
              Pedido pagado
          ───────────────────────────────────────── */}

          {historial
            && saldoPendiente <= 0
            && !recibo && (

            <div
              className="
                bg-emerald-50
                text-emerald-800
                p-4
                rounded-xl
                flex
                items-start
                gap-3
                border
                border-emerald-200
              "
              role="status"
            >

              <CheckCircle
                className="
                  flex-shrink-0
                  mt-0.5
                "
                size={20}
                aria-hidden="true"
              />


              <div>

                <p className="font-bold">
                  Pedido pagado en su totalidad.
                </p>

                <p className="text-sm">
                  No es posible registrar más pagos
                  para este ticket.
                </p>

              </div>

            </div>

          )}


          {/* ─────────────────────────────────────────
              Recibo generado
          ───────────────────────────────────────── */}

          {recibo && (

            <section
              className="
                bg-blue-50
                border
                border-blue-200
                p-5
                rounded-xl
                text-center
                space-y-3
              "
              aria-labelledby="pago-exitoso-title"
            >

              <div
                className="
                  mx-auto
                  w-12 h-12
                  bg-blue-100
                  rounded-full
                  flex
                  items-center
                  justify-center
                  mb-2
                  text-blue-700
                "
              >
                <CheckCircle
                  size={28}
                  aria-hidden="true"
                />
              </div>


              <h3
                id="pago-exitoso-title"
                className="
                  font-bold
                  text-blue-800
                  text-lg
                "
              >
                Pago exitoso
              </h3>


              <p className="text-sm text-blue-800">
                Se abonaron{' '}

                <strong>
                  S/{' '}
                  {Number(
                    recibo.monto_abonado
                    ?? 0
                  ).toFixed(2)}
                </strong>

                {' '}vía{' '}

                {recibo.metodo}.
              </p>


              <div
                className="
                  bg-white/70
                  rounded-lg
                  p-3
                  space-y-2
                  text-sm
                  text-left
                "
              >

                <div className="flex justify-between gap-4">
                  <span className="text-gray-700">
                    Total pedido
                  </span>

                  <strong>
                    S/{' '}
                    {Number(
                      recibo.total_pedido
                      ?? totalPedido
                    ).toFixed(2)}
                  </strong>
                </div>


                <div className="flex justify-between gap-4">
                  <span className="text-gray-700">
                    Total pagado
                  </span>

                  <strong className="text-emerald-700">
                    S/{' '}
                    {Number(
                      recibo.total_pagado
                      ?? totalPagado
                    ).toFixed(2)}
                  </strong>
                </div>


                <div
                  className="
                    flex
                    justify-between
                    gap-4
                    border-t
                    pt-2
                  "
                >
                  <span className="font-bold text-brand-main">
                    Saldo pendiente
                  </span>

                  <strong className="text-blue-700">
                    S/{' '}
                    {Math.max(
                      0,

                      Number(
                        recibo.saldo_pendiente
                        ?? saldoPendiente
                      )
                    ).toFixed(2)}
                  </strong>
                </div>

              </div>


              {Number(
                recibo.saldo_pendiente
                ?? saldoPendiente
              ) <= 0 && (

                <p
                  className="
                    text-xs
                    bg-emerald-100
                    text-emerald-800
                    py-1
                    px-3
                    rounded-full
                    inline-block
                    mt-2
                    font-semibold
                  "
                >
                  Pago completado
                </p>

              )}


              {Number(
                recibo.saldo_pendiente
                ?? saldoPendiente
              ) > 0 && (

                <div
                  className="
                    bg-amber-50
                    border
                    border-amber-200
                    text-amber-800
                    rounded-lg
                    p-3
                    text-xs
                    flex
                    items-start
                    gap-2
                    text-left
                  "
                >
                  <AlertTriangle
                    size={16}
                    className="
                      flex-shrink-0
                      mt-0.5
                    "
                    aria-hidden="true"
                  />

                  <span>
                    Este pago es un abono parcial.
                    El pedido aún mantiene saldo pendiente.
                  </span>
                </div>

              )}


              <div
                className="
                  mt-4
                  border-t
                  border-blue-200
                  pt-4
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    printRecibo(
                      recibo,
                      ticketCodigo
                    )
                  }
                  className="
                    px-4 py-2
                    border-2
                    border-blue-700
                    text-blue-700
                    font-bold
                    rounded-xl
                    hover:bg-blue-100
                    transition-colors
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                  "
                >
                  <Printer
                    size={16}
                    aria-hidden="true"
                  />

                  Imprimir Recibo
                </button>

              </div>

            </section>

          )}

        </div>

      </div>

    </div>,

    document.body
  );
};