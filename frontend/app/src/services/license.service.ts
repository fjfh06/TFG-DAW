import type { TipoLicencia, LicenciaAlumno } from "../types";

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export const licenseTypeAPI = {
  async getTipos(temporadaId?: number): Promise<TipoLicencia[]> {
    const url = temporadaId ? `${API_URL}/config/tipos-licencia/?temporada_id=${temporadaId}` : `${API_URL}/config/tipos-licencia/`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener tipos de licencia");
    return response.json();
  },
  async createTipo(data: Omit<TipoLicencia, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/config/tipos-licencia/`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error creando tipo de licencia");
    return response.json();
  },
  async updateTipo(id: number, data: Partial<TipoLicencia>): Promise<void> {
    const response = await fetch(`${API_URL}/config/tipos-licencia/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error actualizando tipo");
  },
  async deleteTipo(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/config/tipos-licencia/${id}`, {
      method: 'DELETE', headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error eliminando tipo");
  }
};

export const licenciaAPI = {
  async getLicencias(alumnoId?: number, temporadaId?: number): Promise<LicenciaAlumno[]> {
    const params = new URLSearchParams();
    if (alumnoId) params.append("alumno_id", alumnoId.toString());
    if (temporadaId) params.append("temporada_id", temporadaId.toString());
    
    const url = `${API_URL}/licencias/?${params.toString()}`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener licencias asignadas");
    return response.json();
  },
  async createLicencia(data: Omit<LicenciaAlumno, 'id'>): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/licencias/`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error asignando licencia");
    return response.json();
  },
  async updateLicencia(id: number, data: Partial<LicenciaAlumno>): Promise<void> {
    const response = await fetch(`${API_URL}/licencias/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error actualizando licencia");
  },
  async deleteLicencia(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/licencias/${id}`, {
      method: 'DELETE', headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error eliminando licencia");
  }
};
