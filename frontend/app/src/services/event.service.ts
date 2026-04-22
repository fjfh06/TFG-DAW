import type { Evento, Participacion, ResultadoCompeticion } from "../types";

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export const eventAPI = {
  // === EVENTOS ===
  async getEventos(temporadaId?: number): Promise<Evento[]> {
    const url = temporadaId ? `${API_URL}/eventos/?temporada_id=${temporadaId}` : `${API_URL}/eventos/`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener eventos");
    return response.json();
  },
  async createEvento(data: Omit<Evento, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/eventos/`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error creando evento");
    return response.json();
  },
  async updateEvento(id: number, data: Partial<Evento>): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error actualizando evento");
  },
  async deleteEvento(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error eliminando evento");
  },

  // === PARTICIPACIONES ===
  async getParticipaciones(eventoId?: number, alumnoId?: number): Promise<Participacion[]> {
    const params = new URLSearchParams();
    if (eventoId) params.append("evento_id", eventoId.toString());
    if (alumnoId) params.append("alumno_id", alumnoId.toString());
    
    const url = `${API_URL}/eventos/participaciones/?${params.toString()}`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener participaciones");
    return response.json();
  },
  async createParticipacion(eventoId: number, data: Partial<Participacion>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/eventos/participaciones/${eventoId}/crear`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error inscribiendo alumno");
    return response.json();
  },
  async updateParticipacion(id: number, data: Partial<Participacion>): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/participaciones/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error actualizando inscripcion");
  },
  async deleteParticipacion(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/participaciones/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error eliminando inscripcion");
  },

  // === RESULTADOS ===
  async createResultado(participacionId: number, data: Partial<ResultadoCompeticion>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/eventos/participaciones/${participacionId}/resultado`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error creando resultado");
    return response.json();
  },
  async updateResultado(resultadoId: number, data: Partial<ResultadoCompeticion>): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/participaciones/resultado/${resultadoId}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error actualizando resultado");
  }
};
