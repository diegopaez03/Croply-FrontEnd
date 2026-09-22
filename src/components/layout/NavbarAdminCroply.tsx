import { Link, useLocation } from 'react-router-dom';
import LogoCroply from '../../assets/images/LogoCroplyHoriz.svg';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  DashboardSquare01Icon, 
  UserGroupIcon, 
  TractorIcon, 
  Book02Icon, 
  CustomerService01Icon 
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { PERMISO_SISTEMA } from '../../constants/permisos';
import { ROUTES } from '../../constants/routes';
interface NavbarAdminCroplyProps {
  mobile?: boolean;
}

export function NavbarAdminCroply({ mobile }: NavbarAdminCroplyProps) {
  const location = useLocation();
  const { tienePermiso } = useAuth();
  const baseClasses = "flex flex-col w-64 bg-sidebar border-r border-border h-full shrink-0";
  const layoutClasses = mobile ? baseClasses : `hidden md:flex ${baseClasses}`;

  const isActive = (path: string) => {
    if (path === ROUTES.CROPLY.CATALOGOS_BASE) {
      return (
        location.pathname === path ||
        location.pathname === ROUTES.CROPLY.CULTIVOS ||
        location.pathname.startsWith(ROUTES.CROPLY.PLANTILLAS)
      );
    }
    return location.pathname === path;
  };

  return (
    <nav className={layoutClasses}>
      <div className="flex items-center justify-center py-7 px-4 border-border">
        <img src={LogoCroply} alt="Croply Logo" className="h-16 object-contain" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-1">
        {/* Nav Items */}
        <Link to={ROUTES.CROPLY.DASHBOARD} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.CROPLY.DASHBOARD) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={DashboardSquare01Icon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Dashboard</span>
        </Link>
        
        {tienePermiso(PERMISO_SISTEMA.GESTION_USUARIOS, PERMISO_SISTEMA.SOLICITUDES_DIGITALIZACION) && (
          <Link to={ROUTES.CROPLY.GESTION_USUARIOS} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.CROPLY.GESTION_USUARIOS) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={UserGroupIcon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Gestión de usuarios</span>
          </Link>
        )}
        
        {tienePermiso(PERMISO_SISTEMA.FINCAS_INFRAESTRUCTURA) && (
          <Link to={ROUTES.CROPLY.FINCAS} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${location.pathname.startsWith(ROUTES.CROPLY.FINCAS) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={TractorIcon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Fincas e Infraestructura</span>
          </Link>
        )}
        
        {tienePermiso(PERMISO_SISTEMA.CATALOGOS_BASE) && (
          <Link to={ROUTES.CROPLY.CATALOGOS_BASE} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.CROPLY.CATALOGOS_BASE) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={Book02Icon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Catálogos Base</span>
          </Link>
        )}
        
         <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted opacity-50 cursor-not-allowed">
          <HugeiconsIcon icon={CustomerService01Icon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Soporte</span>
        </div>
      </div>
    </nav>
  );
}
