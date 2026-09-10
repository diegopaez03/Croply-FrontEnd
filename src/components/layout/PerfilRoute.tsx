import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminCroplyLayout from './AdminCroplyLayout';
import AdminFincaLayout from './AdminFincaLayout';
import { PendienteFincaPage } from '../../pages/Auth/PendienteFincaPage';

export function PerfilRoute() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si usuario.rol_sistema tiene cualquier valor no nulo -> AdminCroplyLayout
  if (usuario.rol_sistema) {
    return <AdminCroplyLayout />;
  }

  // Si rol_sistema es null pero usuario.fincas?.length > 0 -> AdminFincaLayout
  if (usuario.fincas && usuario.fincas.length > 0) {
    return <AdminFincaLayout />;
  }

  // Si no se cumple ninguna de las dos (usuario sin rol de sistema y sin finca)
  return <PendienteFincaPage />;
}
