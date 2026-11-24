import { Link, useLocation } from 'react-router-dom';
import LogoCroply from '../../assets/images/LogoCroplyHoriz.svg';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  TractorIcon, 
  Book02Icon, 
  Plant01Icon,
  MoneyBag02Icon,
  UserGroupIcon,
  CustomerService01Icon 
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { PERMISO_FINCA } from '../../constants/permisos';
import { ROUTES } from '../../constants/routes';

interface NavbarAdminFincaProps {
  mobile?: boolean;
}

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
  disabled: boolean;
}

function NavItem({ to, icon, label, active, disabled }: NavItemProps) {
  if (disabled) {
    return (
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-muted-foreground opacity-50 cursor-not-allowed select-none"
        title="Requiere conexión"
        aria-disabled="true"
      >
        <HugeiconsIcon icon={icon} className="shrink-0 size-5" />
        <span className="font-sans font-semibold text-sm">{label}</span>
      </div>
    );
  }

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}
    >
      <HugeiconsIcon icon={icon} className="shrink-0 size-5" />
      <span className="font-sans font-semibold text-sm">{label}</span>
    </Link>
  );
}

export function NavbarAdminFinca({ mobile }: NavbarAdminFincaProps) {
  const location = useLocation();
  const { tienePermiso } = useAuth();
  const isOnline = useOnlineStatus();
  const baseClasses = "flex flex-col w-64 bg-sidebar border-r border-border h-full shrink-0";
  const layoutClasses = mobile ? baseClasses : `hidden md:flex ${baseClasses}`;

  const isActive = (path: string) => {
    if (path === ROUTES.FINCA.BIBLIOTECA) {
      return location.pathname === path || location.pathname.startsWith(ROUTES.FINCA.BIBLIOTECA + '/');
    }
    return location.pathname === path;
  };

  const navDisabled = !isOnline;

  return (
    <nav className={layoutClasses}>
      <div className="flex items-center justify-center py-7 px-4 border-border">
        <img src={LogoCroply} alt="Croply Logo" className="h-16 object-contain" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NavItem 
          to={ROUTES.FINCA.MI_FINCA}
          icon={TractorIcon}
          label="Mi finca"
          active={isActive(ROUTES.FINCA.MI_FINCA)}
          disabled={navDisabled}
        />
        
        {tienePermiso(PERMISO_FINCA.TAREAS_CAMPO) && (
          <NavItem 
            to={ROUTES.FINCA.BIBLIOTECA}
            icon={Book02Icon}
            label="Biblioteca de cultivos"
            active={isActive(ROUTES.FINCA.BIBLIOTECA)}
            disabled={navDisabled}
          />
        )}
        
        {tienePermiso(PERMISO_FINCA.REGISTRO_AGROQUIMICOS) && (
          <NavItem 
            to={ROUTES.FINCA.AGROQUIMICOS}
            icon={Plant01Icon}
            label="Agroquímicos"
            active={isActive(ROUTES.FINCA.AGROQUIMICOS)}
            disabled={navDisabled}
          />
        )}
        
        {tienePermiso(PERMISO_FINCA.COSTOS) && (
          <NavItem 
            to={ROUTES.FINCA.COSTOS}
            icon={MoneyBag02Icon}
            label="Costos"
            active={isActive(ROUTES.FINCA.COSTOS)}
            disabled={navDisabled}
          />
        )}
        
        {tienePermiso(PERMISO_FINCA.GESTION_TRABAJADORES) && (
          <NavItem 
            to={ROUTES.FINCA.GESTION_USUARIOS}
            icon={UserGroupIcon}
            label="Gestión de usuarios"
            active={isActive(ROUTES.FINCA.GESTION_USUARIOS)}
            disabled={navDisabled}
          />
        )}
      </div>
      
      {/* Footer support item */}
      <div className="p-4 border-t border-border">
        <NavItem 
          to={ROUTES.FINCA.SOPORTE}
          icon={CustomerService01Icon}
          label="Ayuda y soporte"
          active={isActive(ROUTES.FINCA.SOPORTE)}
          disabled={navDisabled}
        />
      </div>
    </nav>
  );
}
