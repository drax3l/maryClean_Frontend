import { api } from "@/core/api/axiosInstance";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PrendaCatalogo {
  idPrenda: number;
  nombrePrenda: string;
  precio: number;
  servicio: string;    // nombre de la categoría, viene del backend
  idServicio?: number; // puede venir opcionalmente del backend
  estado: 1 | 0;       // 1 activo, 0 inactivo
}

export interface ServicioCategoria {
  idServicio: number;
  nombre: string;
  tiempoEstimado: number;
  prendas?: PrendaCatalogo[];
}

export interface DatosLavanderia {
  nombre: string;
  direccion: string;
  telefono: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const configuracionService = {

  // --- Catálogo de Prendas (API REAL) ---

  getCatalogo: async (): Promise<PrendaCatalogo[]> => {
    const response = await api.get("/servicios/prendas");
    // Convertir precios y estado de string → number desde la BD
    return response.data.data.map((p: any) => ({
      ...p,
      precio: parseFloat(p.precio),
      estado: Number(p.estado) as 1 | 0,
    }));
  },

  // --- Categorías de Servicios (para dropdown "Nueva Prenda") ---

  getServicios: async (): Promise<ServicioCategoria[]> => {
    const response = await api.get("/servicios");
    return response.data.data;
  },

  // --- Agregar nueva prenda enviando idServicio (number) ---

  agregarPrenda: async (payload: {
    nombrePrenda: string;
    precio: number;
    idServicio: number;
  }): Promise<void> => {
    await api.post("/servicios/prendas", payload);
  },

  // --- Editar precio de una prenda ---

  actualizarPrecio: async (idPrenda: number, nuevoPrecio: number): Promise<void> => {
    await api.put(`/servicios/prendas/${idPrenda}`, { precio: nuevoPrecio });
  },

  // --- Activar / Desactivar prenda ---

  cambiarEstadoPrenda: async (idPrenda: number, estado: 1 | 0): Promise<void> => {
    await api.put(`/servicios/prendas/${idPrenda}`, { estado });
  },

  // --- Datos de Lavandería ---

  getDatosLavanderia: async (): Promise<DatosLavanderia> => {
    const response = await api.get("/sucursales/1");
    return response.data.data;
  },

  guardarDatosLavanderia: async (datos: Partial<DatosLavanderia>): Promise<void> => {
    await api.put("/sucursales/1", datos);
  },
};
