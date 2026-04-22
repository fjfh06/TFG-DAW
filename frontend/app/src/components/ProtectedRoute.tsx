import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    // Redirigir al login guardando la URL a la que intentaba acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir a inicio si no tiene permisos
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
