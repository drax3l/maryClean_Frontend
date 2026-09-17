import { api } from "@/core/api/axiosInstance";

export interface ReporteFilaDiaria {
  fechaPago: string;
  metodo: string;
  totalIngresos: string;
  cantidadTransacciones: string;
}

export interface ReporteDiarioRes {
  fecha: string;
  filas: ReporteFilaDiaria[];
  total_dia: number;
}

export interface CierreCajaRes {
  fecha: string;
  desglose: {
    metodo: string | null;
    cantidadTransacciones: string;
    total_ingresos: string;
  }[];
  total_general: string;
  total_operaciones: number;
}

export interface ServicioRanking {
  nombreServicio: string;
  nombrePrenda: string;
  cantidadTotal: string;
  ingresosGenerados: string;
}

export interface ServiciosRankingRes {
  desde: string;
  hasta: string;
  ranking: ServicioRanking[];
}

export interface EvolucionDiaria {
  fecha: string;
  cantidadPedidos: number;
  totalIngresos: string;
}

export interface DistribucionServicio {
  servicio: string;
  cantidadPrendas: number;
  ingresosGenerados: string;
}

export const reportesApiService = {
  getDiario: async (fecha: string): Promise<ReporteDiarioRes> => {
    const response = await api.get(`/reportes/diario`, { params: { fecha } });
    return response.data.data;
  },

  getCierreCaja: async (fecha: string): Promise<CierreCajaRes> => {
    const response = await api.get(`/reportes/cierre-caja`, { params: { fecha } });
    return response.data.data;
  },

  getIngresosPorRango: async (fechaInicio: string, fechaFin: string) => {
    // Si necesitas fechas, adaptarlo al endpoint
    const response = await api.get(`/reportes/diario?fecha=${fechaFin}`);
    return response.data.data;
  },

  getRankingServicios: async (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    
    const response = await api.get(`/reportes/servicios?${params.toString()}`);
    return response.data.data;
  },

  getClientesFrecuentes: async (desde?: string, hasta?: string, limite: number = 10) => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    params.append("limite", limite.toString());
    
    const response = await api.get(`/reportes/clientes-frecuentes?${params.toString()}`);
    return response.data.data;
  },

  getEvolucionDiaria: async (desde?: string, hasta?: string): Promise<EvolucionDiaria[]> => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    const response = await api.get(`/reportes/evolucion?${params.toString()}`);
    return response.data.data;
  },

  getDistribucionServicios: async (desde?: string, hasta?: string): Promise<DistribucionServicio[]> => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    const response = await api.get(`/reportes/distribucion?${params.toString()}`);
    return response.data.data;
  },
};
