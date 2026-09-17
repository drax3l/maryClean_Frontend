export interface PrendaCatalogo {
  idPrenda: number;
  nombrePrenda: string;
  precio: number;
  servicio: string;
  estado: 1 | 0; // 1 activo, 0 inactivo
}

export interface DatosLavanderia {
  nombre: string;
  direccion: string;
  telefono: string;
}

const DEFAULT_CATALOGO: PrendaCatalogo[] = [
  { idPrenda: 1,  nombrePrenda: "Camisa",                   precio: 5.00,  servicio: "Lavado Simple", estado: "Activo" },
  { idPrenda: 2,  nombrePrenda: "Pantalon",                 precio: 6.00,  servicio: "Lavado Simple", estado: "Activo" },
  { idPrenda: 3,  nombrePrenda: "Polo",                     precio: 3.50,  servicio: "Lavado Simple", estado: "Activo" },
  { idPrenda: 4,  nombrePrenda: "Ropa Interior",            precio: 2.00,  servicio: "Lavado Simple", estado: "Activo" },
  { idPrenda: 5,  nombrePrenda: "Calcetines (par)",         precio: 1.50,  servicio: "Lavado Simple", estado: "Activo" },
  { idPrenda: 6,  nombrePrenda: "Camisa formal",            precio: 9.00,  servicio: "Lavado y Planchado", estado: "Activo" },
  { idPrenda: 7,  nombrePrenda: "Pantalon formal",          precio: 10.00, servicio: "Lavado y Planchado", estado: "Activo" },
  { idPrenda: 8,  nombrePrenda: "Terno (completo)",         precio: 35.00, servicio: "Lavado y Planchado", estado: "Activo" },
  { idPrenda: 9,  nombrePrenda: "Vestido",                  precio: 18.00, servicio: "Lavado y Planchado", estado: "Activo" },
  { idPrenda: 10, nombrePrenda: "Abrigo",                   precio: 25.00, servicio: "Lavado en Seco", estado: "Activo" },
  { idPrenda: 11, nombrePrenda: "Casaca cuero",             precio: 30.00, servicio: "Lavado en Seco", estado: "Activo" },
  { idPrenda: 12, nombrePrenda: "Corbata",                  precio: 8.00,  servicio: "Lavado en Seco", estado: "Activo" },
  { idPrenda: 13, nombrePrenda: "Saco",                     precio: 20.00, servicio: "Lavado en Seco", estado: "Activo" },
  { idPrenda: 14, nombrePrenda: "Camisa (solo plancha)",    precio: 4.00,  servicio: "Planchado Especial", estado: "Activo" },
  { idPrenda: 15, nombrePrenda: "Pantalon (solo plancha)",  precio: 5.00,  servicio: "Planchado Especial", estado: "Activo" },
  { idPrenda: 16, nombrePrenda: "Vestido formal (plancha)", precio: 12.00, servicio: "Planchado Especial", estado: "Activo" },
];

const DEFAULT_DATOS: DatosLavanderia = {
  nombre: "MaryClean Lavandería",
  direccion: "Av. Principal 123",
  telefono: "984 555 101"
};

import { api } from "@/core/api/axiosInstance";

// El tarifario y sucursales usan la API real.
export const configuracionService = {
  
  // --- Tarifario (API REAL) ---
  getCatalogo: async (): Promise<PrendaCatalogo[]> => {
    const response = await api.get("/servicios/prendas");
    // Convertir precios y estado (string→number) desde la BD
    return response.data.data.map((p: any) => ({
      ...p,
      precio: parseFloat(p.precio),
      estado: Number(p.estado),
    }));
  },

  guardarCatalogo: async (catalogo: PrendaCatalogo[]): Promise<void> => {
    // Ya no se usa para guardar todo el array, se maneja por prenda en API (si es que existe el endpoint)
  },

  agregarPrenda: async (prenda: Omit<PrendaCatalogo, "idPrenda">): Promise<void> => {
    await api.post("/servicios/prendas", prenda);
  },

  actualizarPrecio: async (idPrenda: number, nuevoPrecio: number): Promise<void> => {
    await api.put(`/servicios/prendas/${idPrenda}`, { precio: nuevoPrecio });
  },

  cambiarEstadoPrenda: async (idPrenda: number, estado: 1 | 0): Promise<void> => {
    await api.put(`/servicios/prendas/${idPrenda}`, { estado });
  },

  // --- Datos de Lavandería ---
  getDatosLavanderia: async (): Promise<DatosLavanderia> => {
    const response = await api.get("/sucursales/1");
    // La API de CI4 devuelve response.data.data
    return response.data.data;
  },

  guardarDatosLavanderia: async (datos: Partial<DatosLavanderia>): Promise<void> => {
    // Usamos PUT parcial en el endpoint
    await api.put("/sucursales/1", datos);
  }
};
