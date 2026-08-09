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

interface NavbarAdminCroplyProps {
  mobile?: boolean;
}

export function NavbarAdminCroply({ mobile }: NavbarAdminCroplyProps) {
  const location = useLocation();
  const baseClasses = "flex flex-col w-64 bg-sidebar border-r border-border h-full shrink-0";
  const layoutClasses = mobile ? baseClasses : `hidden md:flex ${baseClasses}`;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={layoutClasses}>
      <div className="flex items-center justify-center py-7 px-4 border-border">
        <img src={LogoCroply} alt="Croply Logo" className="h-16 object-contain" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-1">
        {/* Nav Items */}
        <Link to="/admin-croply/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive('/admin-croply/dashboard') ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={DashboardSquare01Icon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Dashboard</span>
        </Link>
        
        <Link to="/admin-croply/gestion-usuarios" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive('/admin-croply/gestion-usuarios') ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={UserGroupIcon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Gestión de usuarios</span>
        </Link>
        
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted opacity-50 cursor-not-allowed">
          <HugeiconsIcon icon={TractorIcon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Fincas e Infraestructura</span>
        </div>
        
        <Link to="/admin-croply/catalogos-base" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive('/admin-croply/catalogos-base') ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          <HugeiconsIcon icon={Book02Icon} className="shrink-0 size-5" />
           <span className="font-sans font-semibold text-sm">Catálogos Base</span>
        </Link>
        
         <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted opacity-50 cursor-not-allowed">
          <HugeiconsIcon icon={CustomerService01Icon} className="shrink-0 size-5" />
          <span className="font-sans font-semibold text-sm">Soporte</span>
        </div>
      </div>
    </nav>
  );
}
