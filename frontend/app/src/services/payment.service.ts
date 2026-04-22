import type { TarifaMensual, InscripcionMensual, PagoMensualidad } from "../types";

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export const tarifaAPI = {
  async getTarifas(temporadaId?: number): Promise<TarifaMensual[]> {
    const url = temporadaId ? `${API_URL}/config/tarifas/?temporada_id=${temporadaId}` : `${API_URL}/config/tarifas/`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener tarifas");
    return response.json();
  },
  async createTarifa(data: Omit<TarifaMensual, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/config/tarifas/`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al crear tarifa");
    return response.json();
  },
  async updateTarifa(id: number, data: Partial<TarifaMensual>): Promise<void> {
    const response = await fetch(`${API_URL}/config/tarifas/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al actualizar tarifa");
  },
  async deleteTarifa(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/config/tarifas/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar tarifa");
  }
};

export const inscripcionAPI = {
  async getInscripciones(alumnoId?: number, temporadaId?: number): Promise<InscripcionMensual[]> {
    const params = new URLSearchParams();
    if (alumnoId) params.append("alumno_id", alumnoId.toString());
    if (temporadaId) params.append("temporada_id", temporadaId.toString());
    
    const url = `${API_URL}/pagos/inscripciones/?${params.toString()}`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener inscripciones");
    return response.json();
  },
  async createInscripcion(data: Omit<InscripcionMensual, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/pagos/inscripciones/`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al crear inscripción");
    return response.json();
  },
  async updateInscripcion(id: number, data: Partial<InscripcionMensual>): Promise<void> {
    const response = await fetch(`${API_URL}/pagos/inscripciones/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al actualizar inscripción");
  },
  async deleteInscripcion(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/pagos/inscripciones/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar inscripción");
  }
};

export const pagoAPI = {
  async getPagos(alumnoId?: number, mes?: number, anio?: number): Promise<PagoMensualidad[]> {
    const query = new URLSearchParams();
    if(alumnoId) query.append("alumno_id", alumnoId.toString());
    if(mes) query.append("mes", mes.toString());
    if(anio) query.append("anio", anio.toString());

    const queryString = query.toString();
    const url = queryString ? `${API_URL}/pagos/mensualidades/?${queryString}` : `${API_URL}/pagos/mensualidades/`;
    
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener pagos");
    return response.json();
  },
  async createPago(data: Omit<PagoMensualidad, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/pagos/mensualidades/`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear pago");
    }
    return response.json();
  },
  async updatePago(id: number, data: Partial<PagoMensualidad>): Promise<void> {
    const response = await fetch(`${API_URL}/pagos/mensualidades/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al actualizar pago");
  },
  async deletePago(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/pagos/mensualidades/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar pago");
  }
};
