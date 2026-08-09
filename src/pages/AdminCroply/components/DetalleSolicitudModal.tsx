import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { solicitudesService } from "@/services/solicitudes.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleFormError } from "@/utils/errorHandler";

interface DetalleSolicitudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idSolicitud: number | null;
}

export function DetalleSolicitudModal({ open, onOpenChange, idSolicitud }: DetalleSolicitudModalProps) {
  const queryClient = useQueryClient();

  const { data: solicitud, isLoading, isError } = useQuery({
    queryKey: ['solicitud', idSolicitud],
    queryFn: () => solicitudesService.getSolicitud(idSolicitud!),
    enabled: !!idSolicitud && open,
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number, estado: string }) => solicitudesService.updateEstado(id, estado),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      // Invalidate specific query to update modal too
      queryClient.invalidateQueries({ queryKey: ['solicitud', idSolicitud] });
    },
    onError: (err) => handleFormError(err)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud</DialogTitle>
          <DialogDescription>
            Información completa de la solicitud de digitalización de finca.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="text-center text-destructive py-8">
              Ha ocurrido un error al cargar los detalles de la solicitud.
            </div>
          ) : solicitud ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de solicitud</Label>
                  <Input value={format(new Date(solicitud.fecha_solicitud), "dd/MM/yyyy HH:mm")} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <select
                    value={solicitud.estado}
                    onChange={(e) => updateEstadoMutation.mutate({ id: solicitud.id_solicitud_df, estado: e.target.value })}
                    disabled={updateEstadoMutation.isPending}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={solicitud.nombre_completo} disabled className="bg-muted" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Correo electrónico</Label>
                  <Input value={solicitud.correo_electronico} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de Contacto</Label>
                  <Input value={solicitud.telefono_contacto || 'No especificado'} disabled className="bg-muted" />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-3">Datos de la Finca</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input value={solicitud.provincia} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input value={solicitud.departamento} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Localidad</Label>
                  <Input value={solicitud.localidad} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Parcelas</Label>
                  <Input value={solicitud.numero_parcelas} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Superficie Total (ha)</Label>
                  <Input value={solicitud.superficie_total_hectareas} disabled className="bg-muted" />
                </div>
              </div>

              {solicitud.comentario_adicional && (
                <div className="space-y-2 mt-2">
                  <Label>Comentarios Adicionales</Label>
                  <textarea 
                    value={solicitud.comentario_adicional} 
                    disabled 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
