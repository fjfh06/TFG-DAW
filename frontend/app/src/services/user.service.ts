import type { User } from "../types";
import { API_URL } from "../config";
import { getHeaders } from "./apiUtils";

export const userAPI = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users/`, { headers: getHeaders(), credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener usuarios");
    return response.json();
  },
  async createUser(data: Partial<User> & { password?: string }): Promise<{id: number}> {
    const response = await fetch(`${API_URL}/users/`, {
      method: "POST", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear usuario");
    }
    return response.json();
  },
  async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify(data), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al actualizar usuario");
  },
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE", headers: getHeaders(), credentials: "include"
    });
    if (!response.ok) throw new Error("Error al eliminar usuario");
  }
};
