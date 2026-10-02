import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMiFincaListQuery } from '@/hooks/useFincas';
import { toast } from 'sonner';

interface FincaActivaContextType {
  fincaActivaId: number | null;
  setFincaActivaId: (id: number) => void;
  fincas: any[];
  isLoading: boolean;
}

const FincaActivaContext = createContext<FincaActivaContextType | undefined>(undefined);

export function FincaActivaProvider({ children }: { children: React.ReactNode }) {
  const { data: fincasRes, isLoading } = useMiFincaListQuery();
  const fincas = fincasRes?.fincas || [];
  
  const [fincaActivaId, setFincaActivaIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('croply_finca_activa');
    return saved ? Number(saved) : null;
  });

  const setFincaActivaId = (id: number) => {
    setFincaActivaIdState(id);
    localStorage.setItem('croply_finca_activa', id.toString());
  };

  useEffect(() => {
    if (!isLoading && fincas.length > 0) {
      if (!fincaActivaId) {
        setFincaActivaId(Number(fincas[0].id_finca));
      } else {
        const isValid = fincas.some((f: any) => Number(f.id_finca) === Number(fincaActivaId));
        if (!isValid) {
          toast.warning('Tu finca guardada ya no está disponible. Se seleccionó la primera disponible automáticamente.');
          setFincaActivaId(Number(fincas[0].id_finca));
        }
      }
    }
  }, [isLoading, fincas, fincaActivaId]);

  return (
    <FincaActivaContext.Provider value={{ fincaActivaId, setFincaActivaId, fincas, isLoading }}>
      {children}
    </FincaActivaContext.Provider>
  );
}

export function useFincaActiva() {
  const context = useContext(FincaActivaContext);
  if (context === undefined) {
    throw new Error('useFincaActiva must be used within a FincaActivaProvider');
  }
  return context;
}
