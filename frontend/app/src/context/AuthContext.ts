import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
