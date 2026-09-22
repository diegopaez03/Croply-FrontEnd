import { Link, useLocation } from 'react-router-dom';
import LogoCroply from '../../assets/images/LogoCroplyHoriz.svg';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  TractorIcon, 
  Book02Icon, 
  Plant01Icon,
  Coins02Icon,
  UserGroupIcon,
  CustomerService01Icon 
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { PERMISO_FINCA } from '../../constants/permisos';
import { ROUTES } from '../../constants/routes';
interface NavbarAdminFincaProps {
  mobile?: boolean;
}

export function NavbarAdminFinca({ mobile }: NavbarAdminFincaProps) {
  const location = useLocation();
  const { tienePermiso } = useAuth();
  const baseClasses = "flex flex-col w-64 bg-sidebar border-r border-border h-full shrink-0";
  const layoutClasses = mobile ? baseClasses : `hidden md:flex ${baseClasses}`;

  const isActive = (path: string) => {
    if (path === ROUTES.FINCA.BIBLIOTECA) {
      return location.pathname === path || location.pathname.startsWith(ROUTES.FINCA.BIBLIOTECA + '/');
    }
    return location.pathname === path;
  };

  return (
    <nav className={layoutClasses}>
      <div className="flex items-center justify-center py-7 px-4 border-border">
        <img src={LogoCroply} alt="Croply Logo" className="h-16 object-contain" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <Link to={ROUTES.FINCA.MI_FINCA} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.MI_FINCA) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={TractorIcon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Mi finca</span>
        </Link>
        
        {tienePermiso(PERMISO_FINCA.TAREAS_CAMPO) && (
          <Link to={ROUTES.FINCA.BIBLIOTECA} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.BIBLIOTECA) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={Book02Icon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Biblioteca de cultivos</span>
          </Link>
        )}
        
        {tienePermiso(PERMISO_FINCA.REGISTRO_AGROQUIMICOS) && (
          <Link to={ROUTES.FINCA.AGROQUIMICOS} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.AGROQUIMICOS) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={Plant01Icon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Agroquímicos</span>
          </Link>
        )}
        
        {tienePermiso(PERMISO_FINCA.REPORTES) && (
          <Link to={ROUTES.FINCA.COSTOS} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.COSTOS) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={Coins02Icon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Costos</span>
          </Link>
        )}
        
        {tienePermiso(PERMISO_FINCA.GESTION_TRABAJADORES) && (
          <Link to={ROUTES.FINCA.GESTION_USUARIOS} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.GESTION_USUARIOS) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <HugeiconsIcon icon={UserGroupIcon} className="shrink-0 size-5" />
            <span className="font-sans font-semibold text-sm">Gestión de usuarios</span>
          </Link>
        )}
      </div>
      
      {/* Footer support item */}
      <div className="p-4 border-t border-border">
        <Link to={ROUTES.FINCA.SOPORTE} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive(ROUTES.FINCA.SOPORTE) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={CustomerService01Icon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Ayuda y soporte</span>
        </Link>
      </div>
    </nav>
  );
}
