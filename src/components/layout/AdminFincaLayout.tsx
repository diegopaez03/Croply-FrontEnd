import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { NavbarAdminFinca } from './NavbarAdminFinca';
import { HeaderAdminFinca } from './HeaderAdminFinca';
import { useSincronizacionNotas } from '@/hooks/useSincronizacionNotas';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { FincaActivaProvider } from '@/context/FincaActivaContext';
import { VistaModoOffline } from '@/pages/AdminFinca/components/VistaModoOffline';

export default function AdminFincaLayout() {
  useSincronizacionNotas();
  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline === true) {
      toast.success('Conexión restablecida', { duration: 3000 });
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  return (
    <FincaActivaProvider>
      <div className="flex h-screen w-full bg-[var(--background,#fcf9f3)] overflow-hidden">
        <NavbarAdminFinca />
        <div className="flex flex-col flex-1 min-w-0">
          <HeaderAdminFinca />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
            {!isOnline && <VistaModoOffline />}
            <div className={!isOnline ? "hidden" : "contents"} aria-hidden={!isOnline}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </FincaActivaProvider>
  );
}
