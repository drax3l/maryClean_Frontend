import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  configuracionService,
  DatosLavanderia,
  PrendaCatalogo,
} from './configuracionService';

import { ModalNuevaPrenda } from './ModalNuevaPrenda';
import { ModalEditarPrecio } from './ModalEditarPrecio';

import toast from 'react-hot-toast';

import {
  Settings,
  Store,
  Tag,
  Plus,
  Edit3,
  Power,
  PowerOff,
} from 'lucide-react';


export const ConfiguracionPage: React.FC = () => {
  const [datos, setDatos] =
    useState<DatosLavanderia>({
      nombre: '',
      direccion: '',
      telefono: '',
    });

  const [catalogo, setCatalogo] =
    useState<PrendaCatalogo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingDatos, setSavingDatos] =
    useState(false);


  // ───────────────────────────────────────────────────────────
  // Modales
  // ───────────────────────────────────────────────────────────

  const [
    showNuevaPrenda,
    setShowNuevaPrenda,
  ] = useState(false);

  const [
    prendaAEditar,
    setPrendaAEditar,
  ] = useState<PrendaCatalogo | null>(
    null
  );

  const [
    tabActivo,
    setTabActivo,
  ] = useState<
    'activos' | 'inactivos'
  >('activos');


  // ───────────────────────────────────────────────────────────
  // Obtener configuración
  // ───────────────────────────────────────────────────────────

  const fetchData =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
          datosLavanderia,
          catalogoPrendas,
        ] = await Promise.all([
          configuracionService.getDatosLavanderia(),
          configuracionService.getCatalogo(),
        ]);

        setDatos(
          datosLavanderia
        );

        setCatalogo(
          catalogoPrendas ?? []
        );
      } catch {
        toast.error(
          'Error al cargar configuración.'
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // ───────────────────────────────────────────────────────────
  // Guardar datos empresa
  // ───────────────────────────────────────────────────────────

  const handleSaveDatos = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSavingDatos(true);

    try {
      await configuracionService
        .guardarDatosLavanderia(
          datos
        );

      toast.success(
        'Datos de la lavandería actualizados.'
      );
    } catch {
      toast.error(
        'Error al guardar datos.'
      );
    } finally {
      setSavingDatos(false);
    }
  };


  // ───────────────────────────────────────────────────────────
  // Activar / desactivar prenda
  // ───────────────────────────────────────────────────────────

  const handleToggleEstado = async (
    id: number,
    estadoActual: 1 | 0
  ) => {
    const nuevoEstado =
      estadoActual === 1
        ? 0
        : 1;

    try {
      await configuracionService
        .cambiarEstadoPrenda(
          id,
          nuevoEstado
        );

      await fetchData();

      toast.success(
        `Prenda marcada como ${
          nuevoEstado === 1
            ? 'Activa'
            : 'Inactiva'
        }`
      );
    } catch {
      toast.error(
        'Error al cambiar estado.'
      );
    }
  };


  // ───────────────────────────────────────────────────────────
  // Datos calculados
  // ───────────────────────────────────────────────────────────

  const totalActivos =
    useMemo(
      () =>
        catalogo.filter(
          (prenda) =>
            prenda.estado === 1
        ).length,
      [catalogo]
    );


  const totalInactivos =
    useMemo(
      () =>
        catalogo.filter(
          (prenda) =>
            prenda.estado === 0
        ).length,
      [catalogo]
    );


  const prendasFiltradas =
    useMemo(
      () =>
        catalogo.filter(
          (prenda) =>
            prenda.estado ===
            (
              tabActivo === 'activos'
                ? 1
                : 0
            )
        ),
      [
        catalogo,
        tabActivo,
      ]
    );


  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">

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
          <Settings
            size={24}
            className="text-blue-700"
            aria-hidden="true"
          />

          Configuración del Sistema
        </h1>
      </div>


      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
        "
      >

        {/* ───────────────────────────────────────────
            Datos de la lavandería
        ─────────────────────────────────────────── */}

        <section
          className="
            lg:col-span-1
            space-y-6
            joyride-config-datos
            min-h-[420px]
          "
          aria-labelledby="datos-lavanderia-title"
        >

          <div
            className="
              bg-white
              rounded-3xl
              p-6
              shadow-sm
              border
              border-gray-100
              min-h-[420px]
            "
          >

            <h2
              id="datos-lavanderia-title"
              className="
                font-bold
                text-brand-main
                flex
                items-center
                gap-2
                mb-6
              "
            >
              <Store
                size={18}
                aria-hidden="true"
              />

              Datos de la Lavandería
            </h2>


            {loading ? (
              <div
                className="space-y-4 animate-pulse"
                aria-hidden="true"
              >
            
                <div>
                  <div className="h-4 w-32 bg-gray-100 rounded mb-1" />
                  <div className="h-[42px] bg-gray-100 rounded-lg" />
                </div>
            
                <div>
                  <div className="h-4 w-28 bg-gray-100 rounded mb-1" />
                  <div className="h-[42px] bg-gray-100 rounded-lg" />
                </div>
            
                <div>
                  <div className="h-4 w-36 bg-gray-100 rounded mb-1" />
                  <div className="h-[42px] bg-gray-100 rounded-lg" />
                </div>
            
                <div className="h-[42px] bg-gray-100 rounded-xl mt-2" />
            
              </div>
            ) : (

              <form
                onSubmit={
                  handleSaveDatos
                }
                className="space-y-4"
              >

                {/* Nombre */}
                <div>

                  <label
                    htmlFor="nombre-comercial"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-700
                      uppercase
                      mb-1
                    "
                  >
                    Nombre Comercial
                  </label>

                  <input
                    id="nombre-comercial"
                    type="text"
                    value={
                      datos.nombre
                    }
                    onChange={(e) =>
                      setDatos({
                        ...datos,
                        nombre:
                          e.target.value,
                      })
                    }
                    className="input-field"
                    autoComplete="organization"
                  />

                </div>


                {/* Dirección */}
                <div>

                  <label
                    htmlFor="direccion-fisica"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-700
                      uppercase
                      mb-1
                    "
                  >
                    Dirección Física
                  </label>

                  <input
                    id="direccion-fisica"
                    type="text"
                    value={
                      datos.direccion
                    }
                    onChange={(e) =>
                      setDatos({
                        ...datos,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="input-field"
                    autoComplete="street-address"
                  />

                </div>


                {/* Teléfono */}
                <div>

                  <label
                    htmlFor="telefono-contacto"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-700
                      uppercase
                      mb-1
                    "
                  >
                    Teléfono de Contacto
                  </label>

                  <input
                    id="telefono-contacto"
                    type="tel"
                    value={
                      datos.telefono
                    }
                    onChange={(e) =>
                      setDatos({
                        ...datos,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="input-field"
                    autoComplete="tel"
                  />

                </div>


                {/* Guardar */}
                <button
                  type="submit"
                  disabled={
                    savingDatos
                  }
                  className="
                    w-full
                    btn-primary
                    mt-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {savingDatos
                    ? 'Actualizando...'
                    : 'Actualizar Información'
                  }
                </button>

              </form>
            )}

          </div>
        </section>


        {/* ───────────────────────────────────────────
            Tarifario
        ─────────────────────────────────────────── */}

        <section
          className="
            lg:col-span-2
            joyride-config-tarifario
          "
          aria-labelledby="tarifario-title"
        >

          <div
            className="
              bg-white
              rounded-3xl
              p-6
              shadow-sm
              border
              border-gray-100
              flex
              flex-col
              h-full
              min-h-[520px]
            "
          >

            {/* Header tarifario */}
            <div
              className="
                flex
                justify-between
                items-center
                gap-4
                mb-6
              "
            >

              <h2
                id="tarifario-title"
                className="
                  font-bold
                  text-brand-main
                  flex
                  items-center
                  gap-2
                "
              >
                <Tag
                  size={18}
                  aria-hidden="true"
                />

                Tarifario de Servicios
              </h2>


              <button
                type="button"
                onClick={() =>
                  setShowNuevaPrenda(
                    true
                  )
                }
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-emerald-800
                  bg-emerald-100
                  hover:bg-emerald-200
                  rounded-lg
                  transition-colors
                  joyride-config-nuevo
                "
              >
                <Plus
                  size={16}
                  aria-hidden="true"
                />

                Nueva Prenda
              </button>

            </div>


            {/* ───────────────────────────────────────
                Tabs
            ─────────────────────────────────────── */}

            <div
              className="
                flex
                items-center
                gap-2
                mb-4
                bg-gray-50
                p-1
                rounded-xl
                w-fit
                joyride-config-tabs
              "
              role="group"
              aria-label="Filtrar prendas por estado"
            >

              <button
                type="button"
                onClick={() =>
                  setTabActivo(
                    'activos'
                  )
                }
                aria-pressed={
                  tabActivo ===
                  'activos'
                }
                className={`
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  rounded-lg
                  transition-all

                  ${
                    tabActivo ===
                    'activos'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                Activos ({totalActivos})
              </button>


              <button
                type="button"
                onClick={() =>
                  setTabActivo(
                    'inactivos'
                  )
                }
                aria-pressed={
                  tabActivo ===
                  'inactivos'
                }
                className={`
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  rounded-lg
                  transition-all

                  ${
                    tabActivo ===
                    'inactivos'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                Inactivos ({totalInactivos})
              </button>

            </div>


            {/* ───────────────────────────────────────
                Tabla
            ─────────────────────────────────────── */}

            <div
              className="
                flex-1
                overflow-auto
                border
                border-gray-100
                rounded-2xl
                min-h-[350px]
              "
            >

              <table className="w-full text-sm">

                <thead>
                  <tr
                    className="
                      bg-brand-bg
                      text-gray-700
                      text-left
                      uppercase
                      text-[10px]
                      tracking-wider
                    "
                  >

                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold"
                    >
                      Tipo de Prenda
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        font-semibold
                        text-right
                      "
                    >
                      Precio Unitario
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        font-semibold
                        text-center
                      "
                    >
                      Estado
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        font-semibold
                        text-right
                        joyride-config-acciones
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

                        <tr
                          key={index}
                          className="animate-pulse"
                          aria-hidden="true"
                        >

                          <td className="px-4 py-3">
                            <div className="h-8 bg-gray-100 rounded" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-6 bg-gray-100 rounded-full w-12 mx-auto" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-8 bg-gray-100 rounded w-20 ml-auto" />
                          </td>

                        </tr>
                      )
                    )

                  ) : prendasFiltradas.length === 0 ? (

                    <tr>
                      <td
                        colSpan={4}
                        className="
                          px-4
                          py-8
                          text-center
                          text-gray-600
                          text-sm
                        "
                      >
                        No hay servicios {tabActivo} registrados.
                      </td>
                    </tr>

                  ) : (

                    prendasFiltradas.map(
                      (prenda) => (

                        <tr
                          key={
                            prenda.idPrenda
                          }
                          className="
                            hover:bg-gray-50
                            transition-colors
                          "
                        >

                          {/* Nombre */}
                          <td className="px-4 py-3">

                            <div
                              className="
                                font-bold
                                text-brand-main
                              "
                            >
                              {prenda.nombrePrenda}
                            </div>

                            <div
                              className="
                                text-xs
                                text-gray-600
                              "
                            >
                              {prenda.servicio}
                            </div>

                          </td>


                          {/* Precio */}
                          <td
                            className="
                              px-4
                              py-3
                              text-right
                              font-bold
                              text-blue-700
                            "
                          >
                            S/{' '}
                            {prenda.precio.toFixed(2)}
                          </td>


                          {/* Estado */}
                          <td
                            className="
                              px-4
                              py-3
                              text-center
                            "
                          >

                            <span
                              className={`
                                px-2
                                py-1
                                rounded-full
                                text-[10px]
                                font-bold

                                ${
                                  prenda.estado === 1
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-gray-100 text-gray-700'
                                }
                              `}
                            >
                              {prenda.estado === 1
                                ? 'Activo'
                                : 'Inactivo'
                              }
                            </span>

                          </td>


                          {/* Acciones */}
                          <td
                            className="
                              px-4
                              py-3
                              text-right
                            "
                          >

                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >

                              {/* Editar precio */}
                              <button
                                type="button"
                                title={`Editar precio de ${prenda.nombrePrenda}`}
                                aria-label={`Editar precio de ${prenda.nombrePrenda}`}
                                onClick={() =>
                                  setPrendaAEditar(
                                    prenda
                                  )
                                }
                                className="
                                  p-1.5
                                  text-blue-700
                                  hover:bg-blue-50
                                  rounded-lg
                                  transition-colors
                                "
                              >
                                <Edit3
                                  size={16}
                                  aria-hidden="true"
                                />
                              </button>


                              {/* Activar / desactivar */}
                              <button
                                type="button"
                                title={
                                  prenda.estado === 1
                                    ? `Desactivar ${prenda.nombrePrenda}`
                                    : `Activar ${prenda.nombrePrenda}`
                                }
                                aria-label={
                                  prenda.estado === 1
                                    ? `Desactivar ${prenda.nombrePrenda}`
                                    : `Activar ${prenda.nombrePrenda}`
                                }
                                onClick={() =>
                                  handleToggleEstado(
                                    prenda.idPrenda,
                                    prenda.estado
                                  )
                                }
                                className={`
                                  p-1.5
                                  rounded-lg
                                  transition-colors

                                  ${
                                    prenda.estado === 1
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-emerald-700 hover:bg-emerald-50'
                                  }
                                `}
                              >
                                {prenda.estado === 1 ? (
                                  <PowerOff
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Power
                                    size={16}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>

                            </div>
                          </td>

                        </tr>

                      )
                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* Nota */}
            <p
              className="
                text-xs
                text-gray-600
                mt-3
                text-center
              "
            >
              * Los cambios en los precios afectarán solo
              a los nuevos pedidos registrados a partir de
              ahora.
            </p>

          </div>
        </section>

      </div>


      {/* ─────────────────────────────────────────────
          Modal Nueva Prenda
      ───────────────────────────────────────────── */}

      {showNuevaPrenda && (
        <ModalNuevaPrenda
          onClose={() =>
            setShowNuevaPrenda(
              false
            )
          }
          onUpdate={
            fetchData
          }
        />
      )}


      {/* ─────────────────────────────────────────────
          Modal Editar Precio
      ───────────────────────────────────────────── */}

      {prendaAEditar && (
        <ModalEditarPrecio
          prenda={
            prendaAEditar
          }
          onClose={() =>
            setPrendaAEditar(
              null
            )
          }
          onUpdate={
            fetchData
          }
        />
      )}

    </div>
  );
};