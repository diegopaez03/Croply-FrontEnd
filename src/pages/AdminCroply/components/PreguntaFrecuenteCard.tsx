import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { PreguntaFrecuente } from '@/types/soporte.types';

interface PreguntaFrecuenteCardProps {
  faq: PreguntaFrecuente;
  onEditar: (faq: PreguntaFrecuente) => void;
  onEliminar: (faq: PreguntaFrecuente) => void;
}

export function PreguntaFrecuenteCard({ faq, onEditar, onEliminar }: PreguntaFrecuenteCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md">
      <div>
        <h3 className="text-base font-semibold text-foreground break-words">{faq.pregunta}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words mt-1.5">
          {faq.respuesta}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => onEditar(faq)}
          aria-label="Editar pregunta frecuente"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <HugeiconsIcon icon={Edit01Icon} className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onEliminar(faq)}
          aria-label="Eliminar pregunta frecuente"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-destructive/30 bg-white text-destructive hover:bg-destructive/10 transition-colors"
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-4" />
        </button>
      </div>
    </div>
  );
}
