import type { Temporada } from "../types";

import { API_URL } from "../config";

import { getHeaders } from "./apiUtils";

export const seasonAPI = {
  async getTemporadas(): Promise<Temporada[]> {
    const response = await fetch(`${API_URL}/config/temporadas/`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      const error = new Error("Error al obtener temporadas");
      (error as any).status = response.status;
      throw error;
    }
    return response.json();
  },

  async createTemporada(data: Partial<Temporada>): Promise<void> {
    const response = await fetch(`${API_URL}/config/temporadas/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error al crear temporada");
  },

  async updateTemporada(id: number, data: Partial<Temporada>): Promise<void> {
    const response = await fetch(`${API_URL}/config/temporadas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error al actualizar temporada");
  },

  async deleteTemporada(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/config/temporadas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar temporada");
  },

  async getTemporadaActiva(): Promise<Temporada> {
    const temporadas = await this.getTemporadas();
    const activa = temporadas.find(t => t.activa);
    if (!activa) {
      throw new Error("No hay temporada activa configurada");
    }
    return activa;
  }
};
