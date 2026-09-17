import { api } from "@/core/api/axiosInstance";

export interface Empleado {
  idEmpleado: number;
  nombres: string;
  username: string;
  rol: "admin" | "cajero" | "recepcionista";
  activo: number;
  idSucursal: number;
  created_at: string;
}

export interface EmpleadoCrearPayload {
  nombres: string;
  username: string;
  password?: string; // Requerido al crear
  rol: "admin" | "cajero" | "recepcionista";
  idSucursal: number;
}

export const usuariosService = {
  getAll: async (): Promise<Empleado[]> => {
    const response = await api.get("/empleados");
    // Convertir activo string→number desde la BD
    return (response.data.data || []).map((e: any) => ({
      ...e,
      activo: Number(e.activo),
    }));
  },

  crear: async (payload: EmpleadoCrearPayload): Promise<Empleado> => {
    const response = await api.post("/empleados", payload);
    return response.data.data;
  },

  cambiarEstado: async (id: number, activo: 1 | 0): Promise<void> => {
    await api.patch(`/empleados/${id}/estado`, { activo });
  },

  cambiarPassword: async (id: number, password: string): Promise<void> => {
    await api.patch(`/empleados/${id}/password`, { password });
  },
};
