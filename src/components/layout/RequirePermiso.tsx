import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RequirePermisoProps {
  permisos: string[];
  redirectTo: string;
  children: React.ReactNode;
}

export function RequirePermiso({ permisos, redirectTo, children }: RequirePermisoProps) {
  const { tienePermiso } = useAuth();

  if (!tienePermiso(...permisos)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
