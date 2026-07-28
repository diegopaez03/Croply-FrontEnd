import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, UserCircle02Icon, Menu01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { NavbarAdminCroply } from './NavbarAdminCroply';
import { UserMenuDropdown } from '../shared/UserMenuDropdown';
import { useAuth } from '../../context/AuthContext';

export function HeaderAdminCroply() {
  const { usuario } = useAuth();

  return (
    <header className="bg-card border-b border-border flex items-center justify-between md:justify-end h-20 px-6 shrink-0 w-full">
      {/* Mobile Menu Trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center size-8 rounded-lg hover:bg-muted text-foreground">
              <HugeiconsIcon icon={Menu01Icon} className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {/* Pass a prop or handle classes to make the inner nav visible on mobile */}
            <NavbarAdminCroply mobile />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications Icon */}
        <button className="flex items-center justify-center size-6 rounded-lg hover:bg-muted text-foreground">
          <HugeiconsIcon icon={Notification01Icon} className="size-5" />
        </button>
        
        <div className="px-2 mx-1">
          <div className="h-8 w-px bg-border" />
        </div>
        
        {/* Profile Info */}
        <UserMenuDropdown>
          <button className="flex items-center gap-3 pl-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
            <div className="flex flex-col items-end text-right max-w-[200px]">
              <p className="text-sm font-semibold text-foreground leading-4 font-sans truncate w-full">
                {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Admin Usuario'}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5 leading-4 font-sans">
                {usuario?.fincas?.[0]?.rol_finca?.replace('_', ' ') || 'SUPER ADMIN'}
              </p>
            </div>
            <div className="flex items-center gap-1 size-12 rounded-lg text-foreground hover:bg-muted justify-center">
               <HugeiconsIcon icon={UserCircle02Icon} className="size-8" />
               <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 text-muted-foreground" />
            </div>
          </button>
        </UserMenuDropdown>
      </div>
    </header>
  );
}
