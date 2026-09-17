import { api } from '@/core/api/axiosInstance';

export interface DashboardData {
  pedidos_hoy: number;
  ingresos_hoy: string;
  pedidos_activos: number;
  pendientes_cobro: number;
  fecha: string;
}

export interface EntregaUrgente {
  idPedido: number;
  codigoTicket: string;
  fechaRecepcion: string;
  estado: string;
  cliente: string;
  telefonoCliente: string | null;
}

export const reportesService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<{ success: boolean; data: DashboardData }>('/reportes/dashboard');
    return response.data.data;
  },
  getEntregasUrgentes: async (limite: number = 5): Promise<EntregaUrgente[]> => {
    const response = await api.get<{ success: boolean; data: EntregaUrgente[] }>(`/reportes/entregas-urgentes?limite=${limite}`);
    return response.data.data;
  }
};
