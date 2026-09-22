import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  obtenerFincasCache, 
  obtenerParcelasCache, 
  guardarNotaPendiente 
} from '@/utils/offlineCache';
import { useCrearNotaCampo } from '@/hooks/useNotasCampo';
import { FincaListado } from '@/types/fincas.types';
import { ParcelaListado } from '@/types/parcelas.types';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';

interface CapturarNotaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idFincaInicial?: number | null;
  idParcelaInicial?: number | null;
}

export function CapturarNotaModal({
  open,
  onOpenChange,
  idFincaInicial,
  idParcelaInicial,
}: CapturarNotaModalProps) {
  const [fincas, setFincas] = useState<FincaListado[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaListado[]>([]);
  
  const [idFinca, setIdFinca] = useState<number | null>(idFincaInicial ?? null);
  const [idParcela, setIdParcela] = useState<number | null>(idParcelaInicial ?? null);
  const [contenido, setContenido] = useState('');

  const crearNotaMutation = useCrearNotaCampo();

  // Cargar fincas del caché local
  useEffect(() => {
    if (open) {
      const cached = obtenerFincasCache();
      setFincas(cached);
      
      const fincaToSet = idFincaInicial || (cached.length > 0 ? cached[0].id_finca : null);
      if (fincaToSet) {
        setIdFinca(fincaToSet);
      }
      if (idParcelaInicial) {
        setIdParcela(idParcelaInicial);
      }
    }
  }, [open, idFincaInicial, idParcelaInicial]);

  // Cargar parcelas cuando cambia la finca
  useEffect(() => {
    if (idFinca) {
      const cachedParcelas = obtenerParcelasCache(idFinca);
      setParcelas(cachedParcelas);
    } else {
      setParcelas([]);
    }
  }, [idFinca]);

  const handleSubmit = async () => {
    if (!idFinca || !contenido.trim()) return;

    if (!navigator.onLine) {
      guardarEnColaLocal();
      return;
    }

    try {
      const res = await crearNotaMutation.mutateAsync({
        id_finca: idFinca,
        id_parcela: idParcela,
        contenido_nota_campo: contenido,
      });
      showSuccessToast(res);
      handleClose();
    } catch (error: any) {
      if (error.response) {
        // Error real de API (403, 404, etc)
        handleFormError(error);
      } else {
        // Falla de red sin respuesta
        guardarEnColaLocal();
      }
    }
  };

  const guardarEnColaLocal = () => {
    guardarNotaPendiente({
      idLocal: crypto.randomUUID(),
      id_finca: idFinca as number,
      id_parcela: idParcela,
      contenido_nota_campo: contenido,
      fecha_captura_nc: new Date().toISOString(),
    });
    showSuccessToast(undefined, 'Nota guardada sin conexión. Se sincronizará automáticamente cuando se restablezca la conexión.');
    handleClose();
  };

  const handleClose = () => {
    setContenido('');
    onOpenChange(false);
  };

  const hasFincas = fincas.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capturar nota de campo</DialogTitle>
          <DialogDescription>
            Registrá una observación. Podés hacerlo sin conexión y se sincronizará luego.
          </DialogDescription>
        </DialogHeader>

        {!hasFincas ? (
          <div className="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
            No hay fincas disponibles en el dispositivo. Conectate a internet para sincronizar.
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Finca *</label>
              <Select
                value={idFinca ? String(idFinca) : ''}
                onValueChange={(val) => {
                  setIdFinca(Number(val));
                  setIdParcela(null); // Reiniciar parcela al cambiar finca
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent>
                  {fincas.map((f) => (
                    <SelectItem key={f.id_finca} value={String(f.id_finca)}>
                      {f.nombre_finca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Parcela (Opcional)</label>
              <Select
                value={idParcela ? String(idParcela) : 'ninguna'}
                onValueChange={(val) => setIdParcela(val === 'ninguna' ? null : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="General (toda la finca)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">General (toda la finca)</SelectItem>
                  {parcelas.map((p) => (
                    <SelectItem key={p.id_parcela} value={String(p.id_parcela)}>
                      {p.nombre_parcela}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Nota *</label>
              <Textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribí acá tu observación..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasFincas || !contenido.trim() || crearNotaMutation.isPending}
          >
            {crearNotaMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
