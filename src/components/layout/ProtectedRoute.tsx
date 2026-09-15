import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, debeCambiarContrasena } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si debe cambiar la contraseña, solo se le permite acceder a /primer-acceso
  if (debeCambiarContrasena && location.pathname !== '/primer-acceso') {
    return <Navigate to="/primer-acceso" replace />;
  }

  return <Outlet />;
}
