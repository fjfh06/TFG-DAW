import type { Alumno, Cinturon } from "../types";
import { API_URL } from "../config";
import { getHeaders, reqOpts } from "./apiUtils";

export const cinturonAPI = {
  async getCinturones(): Promise<Cinturon[]> {
    const response = await fetch(`${API_URL}/cinturones/`, {
      headers: getHeaders(),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al obtener cinturones");
    return response.json();
  },

  async createCinturon(data: Partial<Cinturon>): Promise<void> {
    const response = await fetch(`${API_URL}/cinturones/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al crear cinturón");
  },

  async updateCinturon(id: number, data: Partial<Cinturon>): Promise<void> {
    const response = await fetch(`${API_URL}/cinturones/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al actualizar cinturón");
  },

  async deleteCinturon(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/cinturones/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al eliminar cinturón");
  }
};

export const studentAPI = {
  async getStudents(): Promise<Alumno[]> {
    const response = await fetch(`${API_URL}/alumnos/`, {
      headers: getHeaders(),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al obtener alumnos");
    return response.json();
  },

  async getStudent(id: number): Promise<Alumno> {
    const response = await fetch(`${API_URL}/alumnos/${id}`, {
      headers: getHeaders(),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al obtener detalle del alumno");
    return response.json();
  },

  async createStudent(formData: FormData): Promise<{ id: number }> {
    const response = await fetch(`${API_URL}/alumnos/`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
      ...reqOpts
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Error de servidor" }));
        throw new Error(error.error || "Error al crear alumno");
    }
    return response.json();
  },

  async updateStudent(id: number, formData: FormData): Promise<void> {
    const response = await fetch(`${API_URL}/alumnos/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: formData,
      ...reqOpts
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Error de servidor" }));
        throw new Error(error.error || "Error al actualizar alumno");
    }
  },

  async deleteStudent(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/alumnos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      ...reqOpts
    });
    if (!response.ok) throw new Error("Error al eliminar alumno");
  },

  async convertHeicPreview(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('foto', file);
    
    const response = await fetch(`${API_URL}/utils/convert-preview`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
      ...reqOpts
    });
    
    if (!response.ok) throw new Error("Error en conversión");
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
};
