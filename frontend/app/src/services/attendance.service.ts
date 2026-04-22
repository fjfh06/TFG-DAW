import type { Asistencia } from "../types";

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export const attendanceAPI = {
  async getAsistencias(fechaInicio: string, fechaFin: string): Promise<Asistencia[]> {
    const url = `${API_URL}/asistencia/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener asistencias");
    return response.json();
  },

  async getAsistenciasByAlumno(alumnoId: number): Promise<Asistencia[]> {
    const url = `${API_URL}/asistencia/?alumno_id=${alumnoId}`;
    const response = await fetch(url, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener asistencias del alumno");
    return response.json();
  },

  async recordAsistencia(alumno_id: number, fecha: string): Promise<{id: number, message: string}> {
    const response = await fetch(`${API_URL}/asistencia/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ alumno_id, fecha }),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error al registrar asistencia");
    return response.json();
  },

  async deleteAsistencia(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/asistencia/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar asistencia");
  }
};
