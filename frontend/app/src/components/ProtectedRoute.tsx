import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";
import { Loader } from "./common/Loader/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader text="Cargando sesión..." fullPage />;
  }

  if (!user) {
    // Redirigir al login guardando la URL a la que intentaba acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir a NotFound (404) si no tiene permisos
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
