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
            
            <Route path="/admin-finca/dashboard" element={<DashboardAdminFincaPage />} />

            <Route element={<AdminCroplyLayout />}>
              <Route path="/admin-croply/dashboard" element={<DashboardAdminCroplyPage />} />
              <Route path="/admin-croply/gestion-usuarios" element={<GestionClientesPage />} />
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
