import { api } from "@/core/api/axiosInstance";

export type MetodoPago = "Efectivo" | "Tarjeta" | "Yape/Plin";

export interface PagoHistorial {
  idPedido: number;
  total: number;
  total_pagado: number;
  saldo_pendiente: number;
  estado: string;
  pagos: { idPago: number; monto: string; metodo: string; fechaPago: string }[];
}

export interface RegistrarPagoPayload {
  idPedido: number;
  monto: number;
  metodo: MetodoPago;
}

export const pagosService = {
  obtenerHistorial: async (idPedido: number): Promise<PagoHistorial> => {
    const response = await api.get(`/pagos/pedido/${idPedido}`);
    return response.data.data;
  },

  registrarPago: async (payload: RegistrarPagoPayload) => {
    const response = await api.post("/pagos", payload);
    return response.data;
  },

  obtenerRecibo: async (idPago: number) => {
    const response = await api.get(`/pagos/${idPago}/recibo`);
    return response.data.data;
  }
};