import type { StudentListItem } from '../components/common/StatCard/StatCard';

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export interface DashboardStats {
  sin_licencia: StudentListItem[];
  sin_mes_actual: StudentListItem[];
  meses_anteriores_deuda: StudentListItem[];
  total_activos: number;
}

export const dashboardAPI = {
  getStats: async (temporadaId: number): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/dashboard/stats?temporada_id=${temporadaId}`, {
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error obtaining dashboard stats");
    return response.json();
  }
};
