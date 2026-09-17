import { api } from "@/core/api/axiosInstance";

export type EstadoPedido = "Recibido" | "En Proceso" | "Listo" | "Entregado" | "Cancelado";

export interface Pedido {
  idPedido: number;
  codigoTicket: string;
  cliente: string;
  estado: EstadoPedido;
  total: string;
  fechaRecepcion: string;
  fechaEntrega: string | null;
  empleado: string;
}

export interface DetallePedidoCrear {
  idPrenda: number;
  cantidad: number; // Ahora soporta decimales para kilos
  descripcion?: string;
}

export interface PagoInicialCrear {
  monto: number;
  metodo: string; // "Efectivo", "Tarjeta", "Yape/Plin"
}

export interface CrearPedidoPayload {
  idCliente: number;
  detalles: DetallePedidoCrear[];
  pagoInicial?: PagoInicialCrear; // Nuevo campo soportado por backend
}

export const pedidosService = {
  getAll: async (params?: { estado?: string; sucursal?: number; search?: string; page?: number }) => {
    const response = await api.get("/pedidos", { params });
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data.data;
  },

  crear: async (payload: CrearPedidoPayload) => {
    const response = await api.post("/pedidos", payload);
    return response.data;
  },

  cambiarEstado: async (id: number, estado: EstadoPedido) => {
    const response = await api.patch(`/pedidos/${id}/estado`, { estado });
    return response.data;
  },

  getTicket: async (id: number) => {
    const response = await api.get(`/pedidos/${id}/ticket`);
    return response.data.data;
  },
};