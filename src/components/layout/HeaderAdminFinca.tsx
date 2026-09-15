import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, UserCircle02Icon, Menu01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { NavbarAdminFinca } from './NavbarAdminFinca';
import { UserMenuDropdown } from '../shared/UserMenuDropdown';

export function HeaderAdminFinca() {
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
            <NavbarAdminFinca mobile />
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
          <button className="flex items-center gap-1 size-12 rounded-lg text-foreground hover:bg-muted justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <HugeiconsIcon icon={UserCircle02Icon} className="size-8" />
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 text-muted-foreground" />
          </button>
        </UserMenuDropdown>
      </div>
    </header>
  );
}
