
import { Outlet } from 'react-router-dom';
import { NavbarAdminCroply } from './NavbarAdminCroply';
import { HeaderAdminCroply } from './HeaderAdminCroply';

export default function AdminCroplyLayout() {
  return (
    <div className="flex h-screen w-full bg-[var(--background,#fcf9f3)] overflow-hidden">
      <NavbarAdminCroply />
      <div className="flex flex-col flex-1 min-w-0">
        <HeaderAdminCroply />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
