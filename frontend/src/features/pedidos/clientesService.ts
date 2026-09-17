import { api } from "@/core/api/axiosInstance";

export interface Cliente {
  idCliente: number;
  documento: string;
  nombres: string;
  telefono: string;
  direccion?: string;
}

export const clientesService = {
  buscarPorDocumento: async (doc: string): Promise<Cliente | null> => {
    try {
      const response = await api.get(`/clientes/documento/${doc}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  crear: async (data: Omit<Cliente, "idCliente">) => {
    const response = await api.post("/clientes", data);
    return response.data.data;
  },

  getAll: async (params?: { q?: string; page?: number; per_page?: number }) => {
    const response = await api.get("/clientes", { params });
    return response.data.data;
  },

  update: async (id: number, data: Partial<Cliente>) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },
};