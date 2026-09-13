import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Note01Icon,
  PencilEdit02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  EstadoPlanAccionManual,
  EstadoTareaPlan,
  HitoPlanAccion,
  TareaPlanAccion,
} from '@/types/planesAccion.types';
import {
  useCambiarEstadoPlanAccion,
  useCambiarEstadoTareaPlan,
  useCrearTareaPlan,
  useEditarTareaPlan,
  useEliminarTareaPlan,
  usePlanAccionQuery,
} from '@/hooks/usePlanesAccion';
import { TareaPlanModal } from './TareaPlanModal';

const ESTADOS_TAREA: EstadoTareaPlan[] = ['Planificado', 'En Progreso', 'Completado'];

interface CronogramaPlanAccionProps {
  idPlanAccion: number;
  idFinca?: number;
  idParcela?: number;
}

export function CronogramaPlanAccion({
  idPlanAccion,
  idFinca,
  idParcela,
}: CronogramaPlanAccionProps) {
  const { data: plan, isLoading } = usePlanAccionQuery(idPlanAccion);
  const [hitoDestino, setHitoDestino] = useState<HitoPlanAccion | null>(null);
  const [tareaEdicion, setTareaEdicion] = useState<TareaPlanAccion | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<TareaPlanAccion | null>(null);
  const [modalCierre, setModalCierre] = useState(false);
  const [confirmacionPlan, setConfirmacionPlan] = useState<EstadoPlanAccionManual | null>(null);

  const crearTarea = useCrearTareaPlan(idPlanAccion, idParcela, () => setHitoDestino(null));
  const editarTarea = useEditarTareaPlan(idPlanAccion, idParcela, () => setTareaEdicion(null));
  const cambiarEstadoTarea = useCambiarEstadoTareaPlan(idPlanAccion, idParcela);
  const eliminarTarea = useEliminarTareaPlan(idPlanAccion, idParcela);
  const cambiarEstadoPlan = useCambiarEstadoPlanAccion(idPlanAccion, idParcela);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground text-sm py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        Cargando cronograma...
      </div>
    );
  }

  if (!plan) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudo cargar el cronograma de este cultivo.
      </p>
    );
  }

  const planActivo = plan.estado === 'Activo';
  const hitos = [...plan.hitos].sort((a, b) => a.orden_hito - b.orden_hito);

  const handleCambioEstado = async (tarea: TareaPlanAccion, estado: EstadoTareaPlan) => {
    const result = await cambiarEstadoTarea.mutateAsync({ id_tarea: tarea.id_tarea, estado });
    if (result.todas_tareas_completadas) {
      setModalCierre(true);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-foreground">Cronograma del plan de acción</h4>
          <p className="text-[11px] text-muted-foreground">
            Los hitos quedan fijos. Podés agregar, reprogramar o completar tareas.
          </p>
        </div>
        {planActivo && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs"
              onClick={() => setConfirmacionPlan('Cancelado')}
            >
              Cancelar cultivo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs"
              onClick={() => setConfirmacionPlan('FinalizadoPorContingencia')}
            >
              Finalizar por contingencia
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {hitos.map((hito) => (
          <section
            key={hito.id_hito_real}
            className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <HugeiconsIcon icon={Note01Icon} className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Hito {hito.orden_hito}
                  </p>
                  <h5 className="font-semibold text-sm text-foreground">{hito.nombre_hito}</h5>
                </div>
              </div>
              {planActivo && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-xs"
                  onClick={() => setHitoDestino(hito)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-1" />
                  Agregar tarea
                </Button>
              )}
            </div>

            {hito.tareas.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1">Este hito todavía no tiene tareas.</p>
            ) : (
              <div className="space-y-2">
                {hito.tareas.map((tarea) => {
                  const completada = tarea.estado === 'Completado';
                  return (
                    <article
                      key={tarea.id_tarea}
                      className="rounded-xl border border-border/50 bg-card p-3 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{tarea.nombre_tarea}</p>
                          <p className="text-xs text-muted-foreground">{tarea.descripcion_tarea}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span>Tipo: {tarea.nombre_tipo_tarea}</span>
                            <span>Planificada: {tarea.fecha_planificada_tarea}</span>
                            {tarea.nombre_responsable && (
                              <span>Responsable: {tarea.nombre_responsable}</span>
                            )}
                            {tarea.nombre_producto_aa && (
                              <span>
                                {tarea.nombre_producto_aa} · {tarea.dosis_aa}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={tarea.estado}
                            disabled={!planActivo || completada || cambiarEstadoTarea.isPending}
                            onValueChange={(value) =>
                              handleCambioEstado(tarea, value as EstadoTareaPlan)
                            }
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ESTADOS_TAREA.map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {planActivo && !completada && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                onClick={() => setTareaEdicion(tarea)}
                              >
                                <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-destructive"
                                onClick={() => setTareaAEliminar(tarea)}
                              >
                                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <TareaPlanModal
        open={hitoDestino != null}
        onOpenChange={(open) => {
          if (!open) setHitoDestino(null);
        }}
        idFinca={idFinca}
        isPending={crearTarea.isPending}
        onSubmit={(data) =>
          crearTarea.mutateAsync({
            id_hito_real: hitoDestino!.id_hito_real,
            data,
          })
        }
      />

      <TareaPlanModal
        open={tareaEdicion != null}
        onOpenChange={(open) => {
          if (!open) setTareaEdicion(null);
        }}
        idFinca={idFinca}
        tarea={tareaEdicion}
        isPending={editarTarea.isPending}
        onSubmit={(data) =>
          editarTarea.mutateAsync({
            id_tarea: tareaEdicion!.id_tarea,
            data,
          })
        }
      />

      <AlertDialog
        open={tareaAEliminar != null}
        onOpenChange={(open) => {
          if (!open) setTareaAEliminar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás eliminar “{tareaAEliminar?.nombre_tarea}”? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (tareaAEliminar) {
                  eliminarTarea.mutate(tareaAEliminar.id_tarea);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={modalCierre} onOpenChange={setModalCierre}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Has finalizado correctamente este cultivo</AlertDialogTitle>
            <AlertDialogDescription>
              Todas las tareas del plan quedaron completadas. Al aceptar, el cultivo pasa al historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir revisando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cambiarEstadoPlan.mutate('Finalizado')}
            >
              Finalizar cultivo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmacionPlan != null}
        onOpenChange={(open) => {
          if (!open) setConfirmacionPlan(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmacionPlan === 'Cancelado'
                ? 'Cancelar este cultivo'
                : 'Finalizar por contingencia'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              El plan dejará de aparecer en Cultivos y pasará al historial. No hace falta completar las tareas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmacionPlan) {
                  cambiarEstadoPlan.mutate(confirmacionPlan);
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
