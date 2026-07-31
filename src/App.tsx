import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/Auth/LoginPage'
import RegistroInvitadoPage from './pages/Auth/RegistroInvitadoPage'
import RecuperarContrasenaPage from './pages/Auth/RecuperarContrasenaPage'
import ResetearContrasenaPage from './pages/Auth/ResetearContrasenaPage'
import AdminCroplyLayout from './components/layout/AdminCroplyLayout'
import GestionClientesPage from './pages/AdminCroply/GestionClientesPage'
import PerfilPage from './pages/AdminCroply/PerfilPage'
import PrimerAccesoPage from './pages/Auth/PrimerAccesoPage'
import LandingPage from './pages/Landing/LandingPage'
import DigitalizarFincaPage from './pages/Landing/DigitalizarFincaPage'
import DashboardAdminFincaPage from './pages/AdminFinca/DashboardAdminFincaPage'
import DashboardAdminCroplyPage from './pages/AdminCroply/DashboardAdminCroplyPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PerfilRoute } from './components/layout/PerfilRoute'

import AdminFincaLayout from './components/layout/AdminFincaLayout'

function PlaceholderAdminFinca({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">Sección en construcción</p>
        {/* TODO: Completar con el contenido real */}
      </div>
    </div>
  );
}

/**
 * App — Root router component.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ─────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/digitalizar-finca" element={<DigitalizarFincaPage />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro-invitado/:token" element={<RegistroInvitadoPage />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
            <Route path="/resetear-contrasena/:token" element={<ResetearContrasenaPage />} />
          </Route>

          {/* ── Protected routes ──────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/primer-acceso" element={<PrimerAccesoPage />} />
            </Route>
            
            <Route element={<AdminFincaLayout />}>
              <Route path="/admin-finca/mi-finca" element={<DashboardAdminFincaPage />} />
              <Route path="/admin-finca/biblioteca" element={<PlaceholderAdminFinca title="Biblioteca de cultivos" />} />
              <Route path="/admin-finca/agroquimicos" element={<PlaceholderAdminFinca title="Agroquímicos" />} />
              <Route path="/admin-finca/costos" element={<PlaceholderAdminFinca title="Costos" />} />
              <Route path="/admin-finca/gestion-usuarios" element={<PlaceholderAdminFinca title="Gestión de usuarios" />} />
              <Route path="/admin-finca/soporte" element={<PlaceholderAdminFinca title="Ayuda y soporte" />} />
            </Route>

            <Route element={<AdminCroplyLayout />}>
              <Route path="/admin-croply/dashboard" element={<DashboardAdminCroplyPage />} />
              <Route path="/admin-croply/gestion-usuarios" element={<GestionClientesPage />} />
            </Route>
            
            {/* Rutas compartidas que deciden su layout dinámicamente */}
            <Route element={<PerfilRoute />}>
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>
          </Route>

          {/* ── Fallback ──────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" duration={4000} richColors />
    </AuthProvider>
  )
}

export default App
