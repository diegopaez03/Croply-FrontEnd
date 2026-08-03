import { Outlet } from 'react-router-dom';
import { NavbarAdminFinca } from './NavbarAdminFinca';
import { HeaderAdminFinca } from './HeaderAdminFinca';

export default function AdminFincaLayout() {
  return (
    <div className="flex h-screen w-full bg-[var(--background,#fcf9f3)] overflow-hidden">
      <NavbarAdminFinca />
      <div className="flex flex-col flex-1 min-w-0">
        <HeaderAdminFinca />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
