import type { AuthResponse, User } from "../types";
import { API_URL } from "../config";
import { getHeaders } from "./apiUtils";

export const authAPI = {
  async login(data: {username: string; password: string}): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error desconocido" }));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json();
  },
  
  async getMe(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
      credentials: "include",
    });
    
    if (response.status === 401 || response.status === 204) {
      return null as any; // Retornamos null si no hay sesión
    }
    
    if (!response.ok) {
      const error = new Error("Error al obtener información del usuario");
      (error as any).status = response.status;
      throw error;
    }
    return response.json();
  },
  
  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
  }
};
