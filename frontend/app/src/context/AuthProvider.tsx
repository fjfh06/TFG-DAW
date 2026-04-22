import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authAPI } from "../services/api";
import { toast } from "sonner";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (data: { username: string; password: string }) => {
    try {
      const response = await authAPI.login(data);
      setUser(response.user);
      toast.success(`Bienvenido ${response.user.nombre}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al iniciar sesión");
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error(error);
    }
    setUser(null);
    toast.info("Sesión cerrada");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
