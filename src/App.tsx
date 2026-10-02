import { ROUTES } from './constants/routes'
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
import PerfilPage from './pages/Perfil/PerfilPage'
import PrimerAccesoPage from './pages/Auth/PrimerAccesoPage'
import LandingPage from './pages/Landing/LandingPage'
import DigitalizarFincaPage from './pages/Landing/DigitalizarFincaPage'
import DashboardAdminFincaPage from './pages/AdminFinca/DashboardAdminFincaPage'
import DashboardAdminCroplyPage from './pages/AdminCroply/DashboardAdminCroplyPage'
import CatalogosBasePage from './pages/AdminCroply/CatalogosBasePage'
import CultivosListadoPage from './pages/AdminCroply/CultivosListadoPage'
import PlantillasListadoPage from './pages/AdminCroply/PlantillasListadoPage'
import PlantillaNuevaPage from './pages/AdminCroply/PlantillaNuevaPage'
import PlantillaDetallePage from './pages/AdminCroply/PlantillaDetallePage'
import GestionUsuariosPage from './pages/AdminFinca/GestionUsuariosPage'
import BibliotecaCultivosPage from './pages/AdminFinca/BibliotecaCultivosPage'
import CultivoBibliotecaDetallePage from './pages/AdminFinca/CultivoBibliotecaDetallePage'
import GenerarPlanAccionPage from './pages/AdminFinca/GenerarPlanAccionPage'
import FincasListadoPage from './pages/AdminCroply/FincasListadoPage'
import FincaCrearPage from './pages/AdminCroply/FincaCrearPage'
import FincaDetallePage from './pages/AdminCroply/FincaDetallePage'
import { AgroquimicosPage } from './pages/AdminFinca/AgroquimicosPage'
import ParcelaDetallePage from './pages/AdminFinca/ParcelaDetallePage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PerfilRoute } from './components/layout/PerfilRoute'
import { RequirePermiso } from './components/layout/RequirePermiso'
import { PERMISO_FINCA, PERMISO_SISTEMA } from './constants/permisos'

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
              <Route path={ROUTES.FINCA.MI_FINCA} element={<DashboardAdminFincaPage />} />
              <Route path={ROUTES.FINCA.PARCELA_DETALLE_ROUTE} element={<ParcelaDetallePage />} />
              <Route path={ROUTES.FINCA.BIBLIOTECA} element={<RequirePermiso permisos={[PERMISO_FINCA.TAREAS_CAMPO]} redirectTo={ROUTES.FINCA.MI_FINCA}><BibliotecaCultivosPage /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.GENERAR_PLAN_ACCION_ROUTE} element={<RequirePermiso permisos={[PERMISO_FINCA.TAREAS_CAMPO]} redirectTo={ROUTES.FINCA.MI_FINCA}><GenerarPlanAccionPage /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.CULTIVO_BIBLIOTECA_DETALLE_ROUTE} element={<RequirePermiso permisos={[PERMISO_FINCA.TAREAS_CAMPO]} redirectTo={ROUTES.FINCA.MI_FINCA}><CultivoBibliotecaDetallePage /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.AGROQUIMICOS} element={<RequirePermiso permisos={[PERMISO_FINCA.REGISTRO_AGROQUIMICOS]} redirectTo={ROUTES.FINCA.MI_FINCA}><AgroquimicosPage /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.COSTOS} element={<RequirePermiso permisos={[PERMISO_FINCA.REPORTES]} redirectTo={ROUTES.FINCA.MI_FINCA}><PlaceholderAdminFinca title="Costos" /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.GESTION_USUARIOS} element={<RequirePermiso permisos={[PERMISO_FINCA.GESTION_TRABAJADORES]} redirectTo={ROUTES.FINCA.MI_FINCA}><GestionUsuariosPage /></RequirePermiso>} />
              <Route path={ROUTES.FINCA.SOPORTE} element={<PlaceholderAdminFinca title="Ayuda y soporte" />} />
            </Route>

            <Route element={<AdminCroplyLayout />}>
              <Route path={ROUTES.CROPLY.DASHBOARD} element={<DashboardAdminCroplyPage />} />
              <Route path={ROUTES.CROPLY.GESTION_USUARIOS} element={<RequirePermiso permisos={[PERMISO_SISTEMA.GESTION_USUARIOS, PERMISO_SISTEMA.SOLICITUDES_DIGITALIZACION]} redirectTo={ROUTES.CROPLY.DASHBOARD}><GestionClientesPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.CATALOGOS_BASE} element={<RequirePermiso permisos={[PERMISO_SISTEMA.CATALOGOS_BASE]} redirectTo={ROUTES.CROPLY.DASHBOARD}><CatalogosBasePage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.CULTIVOS} element={<RequirePermiso permisos={[PERMISO_SISTEMA.CATALOGOS_BASE]} redirectTo={ROUTES.CROPLY.DASHBOARD}><CultivosListadoPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.FINCAS} element={<RequirePermiso permisos={[PERMISO_SISTEMA.FINCAS_INFRAESTRUCTURA]} redirectTo={ROUTES.CROPLY.DASHBOARD}><FincasListadoPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.FINCA_NUEVA} element={<RequirePermiso permisos={[PERMISO_SISTEMA.FINCAS_INFRAESTRUCTURA]} redirectTo={ROUTES.CROPLY.DASHBOARD}><FincaCrearPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.FINCA_DETALLE_ROUTE} element={<RequirePermiso permisos={[PERMISO_SISTEMA.FINCAS_INFRAESTRUCTURA]} redirectTo={ROUTES.CROPLY.DASHBOARD}><FincaDetallePage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.PLANTILLAS} element={<RequirePermiso permisos={[PERMISO_SISTEMA.CATALOGOS_BASE]} redirectTo={ROUTES.CROPLY.DASHBOARD}><PlantillasListadoPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.PLANTILLA_NUEVA} element={<RequirePermiso permisos={[PERMISO_SISTEMA.CATALOGOS_BASE]} redirectTo={ROUTES.CROPLY.DASHBOARD}><PlantillaNuevaPage /></RequirePermiso>} />
              <Route path={ROUTES.CROPLY.PLANTILLA_DETALLE_ROUTE} element={<RequirePermiso permisos={[PERMISO_SISTEMA.CATALOGOS_BASE]} redirectTo={ROUTES.CROPLY.DASHBOARD}><PlantillaDetallePage /></RequirePermiso>} />
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
