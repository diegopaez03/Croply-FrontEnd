import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { NoteAddIcon } from '@hugeicons/core-free-icons';
import { CapturarNotaModal } from './CapturarNotaModal';
import { VerNotasModal } from './VerNotasModal';

interface CuadernoNotasCardProps {
  idFinca?: number | null;
  className?: string;
}

export function CuadernoNotasCard({ idFinca, className }: CuadernoNotasCardProps) {
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [isVerNotasModalOpen, setIsVerNotasModalOpen] = useState(false);

  return (
    <>
      <Card className={`bg-card border-border shadow-sm p-6 ${className || ''}`}>
        <div className="flex items-start sm:items-center gap-4 mb-5">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={NoteAddIcon} className="size-6 text-primary"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary">¿Alguna observación hoy?</h3>
            <p className="text-sm text-muted-foreground mt-1">Ingresa una nota con tu observación o mira las notas que has ingresado</p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3">
          <Button onClick={() => setIsNotaModalOpen(true)}>Capturar Nota</Button>
          <Button variant="outline" className="text-primary hover:text-primary hover:bg-primary/5" onClick={() => setIsVerNotasModalOpen(true)}>Ver notas</Button>
        </div>
      </Card>

      <CapturarNotaModal 
        open={isNotaModalOpen} 
        onOpenChange={setIsNotaModalOpen} 
        idFincaInicial={idFinca} 
      />
      <VerNotasModal 
        open={isVerNotasModalOpen}
        onOpenChange={setIsVerNotasModalOpen}
        idFinca={idFinca}
      />
    </>
  );
}
