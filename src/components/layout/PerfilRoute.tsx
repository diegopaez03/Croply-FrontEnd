import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminCroplyLayout from './AdminCroplyLayout';
import AdminFincaLayout from './AdminFincaLayout';

export function PerfilRoute() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si tiene rol de sistema, siempre es Admin Croply
  if (usuario.rol_sistema === 'ADMIN_CROPLY') {
    return <AdminCroplyLayout />;
  }

  // Lógica para roles de finca usando un switch para escalabilidad futura
  const rolFinca = usuario.fincas?.[0]?.rol_finca;

  switch (rolFinca) {
    case 'ADMIN_FINCA':
      return <AdminFincaLayout />;
    default:
      // Fallback a AdminFincaLayout si el rol de finca no tiene un layout específico todavía
      return <AdminFincaLayout />;
  }
}
