import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  reportesApiService,
  CierreCajaRes,
} from '@/features/reportes/reportesApiService';

import { useAuthStore } from '@/core/store/authStore';

import { printCierreCaja } from '@/core/utils/printUtils';

import toast from 'react-hot-toast';

import {
  Landmark,
  Search,
  Printer,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-react';


// ─────────────────────────────────────────────────────────────
// Fecha local en formato YYYY-MM-DD
// Evita posibles diferencias de fecha por UTC.
// ─────────────────────────────────────────────────────────────

const getFechaLocal = (): string => {
  const fecha = new Date();

  const year = fecha.getFullYear();

  const month = String(
    fecha.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    fecha.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


// ─────────────────────────────────────────────────────────────
// Cache de cierre de caja
// ─────────────────────────────────────────────────────────────

const getCacheKey = (
  fecha: string
): string => {
  return `maryclean-cierre-caja-${fecha}`;
};


const getCachedCierre = (
  fecha: string
): CierreCajaRes | null => {
  try {
    const cached =
      sessionStorage.getItem(
        getCacheKey(fecha)
      );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as CierreCajaRes;

  } catch {
    return null;
  }
};


const saveCachedCierre = (
  fecha: string,
  data: CierreCajaRes
) => {
  try {
    sessionStorage.setItem(
      getCacheKey(fecha),
      JSON.stringify(data)
    );
  } catch {
    // Si sessionStorage no está disponible,
    // la aplicación sigue funcionando normalmente.
  }
};


// ─────────────────────────────────────────────────────────────
// Página Cierre de Caja
// ─────────────────────────────────────────────────────────────

export const CierreCajaPage: React.FC = () => {
  const { user } = useAuthStore();


  // ───────────────────────────────────────────────────────────
  // Fecha actual
  // ───────────────────────────────────────────────────────────

  const hoy = useMemo(
    () => getFechaLocal(),
    []
  );


  const [
    fechaBusqueda,
    setFechaBusqueda,
  ] = useState<string>(hoy);


  // Si ya visitamos esta fecha durante la sesión,
  // cargamos los datos inmediatamente.
  const [
    cierre,
    setCierre,
  ] = useState<CierreCajaRes | null>(
    () =>
      getCachedCierre(
        hoy
      )
  );


  const [
    loading,
    setLoading,
  ] = useState<boolean>(
    () =>
      getCachedCierre(
        hoy
      ) === null
  );


  // ───────────────────────────────────────────────────────────
  // Obtener cierre
  // ───────────────────────────────────────────────────────────

  const fetchCierre =
    useCallback(
      async (
        fecha: string
      ) => {

        /*
         * 1. Intentamos mostrar primero
         *    los datos guardados.
         *
         * Esto evita que Lighthouse vea
         * una pantalla vacía mientras
         * responde el backend.
         */

        const cachedData =
          getCachedCierre(
            fecha
          );


        if (cachedData) {
          setCierre(
            cachedData
          );
        } else {
          /*
           * Si cambiamos a una fecha que
           * no tiene cache, limpiamos los
           * datos de la fecha anterior.
           */
          setCierre(null);
        }


        /*
         * Loading sigue siendo true para:
         *
         * - bloquear consultas repetidas;
         * - mostrar "Consultando...";
         *
         * pero NO reemplazaremos el contenido
         * existente por el skeleton.
         */
        setLoading(true);


        try {

          const data =
            await reportesApiService
              .getCierreCaja(
                fecha
              );


          // Datos actualizados.
          setCierre(
            data
          );


          // Guardamos para próximas cargas.
          saveCachedCierre(
            fecha,
            data
          );

        } catch (error: any) {

          const mensaje =
            error?.response?.data?.message ??
            'Error al obtener el cierre de caja.';


          toast.error(
            mensaje
          );


          /*
           * Si tenemos cache, mantenemos
           * la última información válida.
           *
           * Solo dejamos cierre en null
           * cuando no existe ningún dato.
           */
          if (!cachedData) {
            setCierre(null);
          }

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
    fetchCierre(
      hoy
    );
  }, [
    fetchCierre,
    hoy,
  ]);


  // ───────────────────────────────────────────────────────────
  // Buscar fecha
  // ───────────────────────────────────────────────────────────

  const handleBuscar = (
    event: React.FormEvent
  ) => {
    event.preventDefault();


    if (!fechaBusqueda) {
      return;
    }


    fetchCierre(
      fechaBusqueda
    );
  };


  // ───────────────────────────────────────────────────────────
  // Desglose válido
  // ───────────────────────────────────────────────────────────

  const desgloseFiltrado =
    useMemo(
      () =>
        cierre?.desglose.filter(
          (detalle) =>
            detalle.metodo !== null
        ) ?? [],
      [cierre]
    );


  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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
              flex
              items-center
              gap-2
            "
          >
            <Landmark
              size={24}
              className="text-blue-700"
              aria-hidden="true"
            />

            Cierre de Caja
          </h1>


          <p
            className="
              text-sm
              text-gray-600
              mt-1
            "
          >
            Consolida los ingresos del día por método de pago.
          </p>

        </div>

      </div>


      {/* ─────────────────────────────────────────────
          Filtro fecha
      ───────────────────────────────────────────── */}

      <form
        onSubmit={
          handleBuscar
        }
        className="
          bg-white
          rounded-3xl
          p-6
          shadow-sm
          border
          border-gray-100
          flex
          flex-col
          md:flex-row
          md:items-end
          gap-4
          joyride-caja-filtro
        "
      >

        <div className="flex-1">

          <label
            htmlFor="fecha-cierre-caja"
            className="
              text-sm
              font-bold
              text-gray-700
              uppercase
              tracking-wider
              mb-2
              flex
              items-center
              gap-2
            "
          >
            <Calendar
              size={16}
              className="text-blue-700"
              aria-hidden="true"
            />

            Seleccionar Fecha de Cierre
          </label>


          <input
            id="fecha-cierre-caja"
            type="date"
            value={
              fechaBusqueda
            }
            max={hoy}
            onChange={(e) =>
              setFechaBusqueda(
                e.target.value
              )
            }
            aria-label="Seleccionar fecha para el cierre de caja"
            className="
              w-full
              bg-gray-50
              border
              border-gray-200
              text-brand-main
              text-lg
              md:text-base
              font-semibold
              rounded-2xl
              focus:ring-2
              focus:ring-brand-primary
              focus:border-brand-primary
              block
              p-4
              md:p-3
              outline-none
              cursor-pointer
              transition-all
            "
          />

        </div>


        <button
          type="submit"
          disabled={loading}
          aria-label={
            loading
              ? 'Consultando cierre de caja'
              : `Consultar cierre de caja del ${fechaBusqueda}`
          }
          className="
            btn-primary
            w-full
            md:w-auto
            p-4
            md:px-8
            md:py-3
            text-lg
            md:text-base
            flex
            justify-center
            items-center
            gap-2
            disabled:opacity-70
            disabled:cursor-not-allowed
          "
        >
          <Search
            size={20}
            aria-hidden="true"
          />

          {loading
            ? 'Consultando...'
            : 'Consultar Caja'
          }
        </button>

      </form>


      {/* ─────────────────────────────────────────────
          Contenido
      ───────────────────────────────────────────── */}


      {/*
        IMPORTANTE:

        Antes:

        loading ? skeleton : cierre ? contenido...

        Eso hacía desaparecer todo el cierre cada vez
        que consultábamos la API.

        Ahora solo mostramos skeleton cuando realmente
        no tenemos ningún dato disponible.
      */}

      {loading && !cierre ? (

        <div
          className="
            card
            p-8
            min-h-[390px]
          "
          aria-hidden="true"
        >

          <div className="animate-pulse space-y-6">

            {/* Resumen */}
            <div
              className="
                flex
                justify-between
                items-center
                border-b
                pb-4
              "
            >

              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48" />

                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>

              <div className="h-10 bg-gray-200 rounded-xl w-32" />

            </div>


            {/* Tabla y total */}
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-6
              "
            >

              <div
                className="
                  h-[190px]
                  bg-gray-100
                  rounded-xl
                "
              />

              <div
                className="
                  h-[190px]
                  bg-gray-100
                  rounded-xl
                "
              />

            </div>


            <div
              className="
                h-14
                bg-gray-100
                rounded-lg
              "
            />

          </div>

        </div>

      ) : cierre ? (

        <section
          className="
            card
            space-y-6
            min-h-[390px]
          "
          aria-labelledby="resumen-cierre-title"
        >

          {/* ─────────────────────────────────────────
              Resumen
          ───────────────────────────────────────── */}

          <div
            className="
              flex
              justify-between
              items-center
              gap-4
              border-b
              pb-4
              joyride-caja-resumen
            "
          >

            <div>

              <h2
                id="resumen-cierre-title"
                className="
                  text-lg
                  font-bold
                  text-brand-main
                "
              >
                Resumen del {cierre.fecha}
              </h2>


              <p
                className="
                  text-sm
                  text-gray-600
                "
              >
                Total de operaciones:{' '}

                <strong>
                  {cierre.total_operaciones}
                </strong>
              </p>

            </div>


            {Number(
              cierre.total_general
            ) > 0 ? (

              <button
                type="button"
                onClick={() =>
                  printCierreCaja(
                    cierre,
                    {
                      nombre:
                        user?.sucursal,
                    },
                    user
                  )
                }
                aria-label={`Imprimir cierre de caja del ${cierre.fecha}`}
                title="Imprimir cierre de caja"
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  bg-blue-50
                  text-blue-700
                  border
                  border-blue-200
                  rounded-xl
                  hover:bg-blue-100
                  transition-colors
                  text-sm
                  font-bold
                  shadow-sm
                "
              >

                <Printer
                  size={18}
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Imprimir Cierre
                </span>

              </button>

            ) : (

              <div
                className="
                  px-4
                  py-2
                  bg-red-50
                  text-red-700
                  rounded-lg
                  text-xs
                  font-bold
                  border
                  border-red-100
                  flex
                  items-center
                  gap-1
                "
                role="status"
              >

                <AlertCircle
                  size={14}
                  aria-hidden="true"
                />

                Sin movimientos

                <span className="hidden sm:inline">
                  {' '}
                  (Impresión deshabilitada)
                </span>

              </div>

            )}

          </div>


          {/* ─────────────────────────────────────────
              Desglose + Total
          ───────────────────────────────────────── */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
            "
          >

            {/* Tabla */}
            <div
              className="
                bg-white
                border
                border-gray-200
                rounded-xl
                overflow-hidden
                joyride-caja-desglose
              "
            >

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
                        px-4
                        py-2
                        text-left
                        font-semibold
                      "
                    >
                      Método
                    </th>


                    <th
                      scope="col"
                      className="
                        px-4
                        py-2
                        text-center
                        font-semibold
                      "
                    >
                      Operaciones
                    </th>


                    <th
                      scope="col"
                      className="
                        px-4
                        py-2
                        text-right
                        font-semibold
                      "
                    >
                      Monto (S/)
                    </th>

                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-100">

                  {desgloseFiltrado.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={`${item.metodo}-${index}`}
                        className="
                          hover:bg-gray-50
                          transition-colors
                        "
                      >

                        {/* Método */}
                        <td
                          className="
                            px-4
                            py-3
                            font-medium
                            text-brand-main
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <DollarSign
                              size={14}
                              className="text-gray-600"
                              aria-hidden="true"
                            />

                            {item.metodo}

                          </div>

                        </td>


                        {/* Operaciones */}
                        <td
                          className="
                            px-4
                            py-3
                            text-center
                            text-gray-700
                          "
                        >
                          {item.cantidadTransacciones}
                        </td>


                        {/* Monto */}
                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-semibold
                            text-emerald-800
                          "
                        >
                          {Number(
                            item.total_ingresos
                          ).toFixed(2)}
                        </td>

                      </tr>

                    )
                  )}


                  {desgloseFiltrado.length === 0 && (

                    <tr>

                      <td
                        colSpan={3}
                        className="
                          px-4
                          py-8
                          text-center
                          text-gray-600
                        "
                      >
                        No hay ingresos registrados para esta fecha.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>


            {/* ───────────────────────────────────────
                Total general
            ─────────────────────────────────────── */}

            <section
              className="
                bg-gradient-to-br
                from-brand-primary
                to-brand-purple
                p-6
                rounded-xl
                text-white
                flex
                flex-col
                justify-center
                items-center
                shadow-md
                joyride-caja-total
                min-h-[190px]
              "
              aria-labelledby="total-recaudado-title"
            >

              <p
                id="total-recaudado-title"
                className="
                  text-sm
                  text-white/90
                  uppercase
                  tracking-widest
                  font-semibold
                  mb-2
                "
              >
                Total Recaudado
              </p>


              <p
                className="
                  text-4xl
                  font-extrabold
                  flex
                  items-center
                  gap-1
                "
              >

                <span className="text-2xl">
                  S/
                </span>

                {Number(
                  cierre.total_general ?? 0
                ).toFixed(2)}

              </p>


              <p
                className="
                  text-xs
                  text-white/90
                  mt-4
                  text-center
                "
              >
                Este monto es el total de todas las
                transacciones realizadas en la fecha
                consultada.
              </p>

            </section>

          </div>


          {/* ─────────────────────────────────────────
              Aviso
          ───────────────────────────────────────── */}

          <div
            className="
              bg-amber-50
              border
              border-amber-200
              text-amber-800
              p-3
              rounded-lg
              text-xs
              flex
              items-start
              gap-2
            "
          >

            <AlertCircle
              size={16}
              className="
                flex-shrink-0
                mt-0.5
              "
              aria-hidden="true"
            />


            <p>
              El cierre de caja incluye todos los pagos
              recibidos el{' '}

              <strong>
                {cierre.fecha}
              </strong>.

              {' '}

              Recuerda comparar el desglose de
              &quot;Efectivo&quot; con el dinero físico
              en tu caja antes de finalizar el turno.
            </p>

          </div>


          {/* Indicador discreto de actualización */}
          {loading && (
            <p
              className="
                text-xs
                text-gray-600
                text-center
              "
              role="status"
              aria-live="polite"
            >
              Actualizando información...
            </p>
          )}

        </section>

      ) : (

        <div
          className="
            card
            p-12
            text-center
            text-gray-600
            min-h-[390px]
            flex
            items-center
            justify-center
          "
          role="status"
        >
          No hay datos para mostrar.
        </div>

      )}

    </div>
  );
};