import { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Note01Icon,
  PencilEdit02Icon,
  PlusSignIcon,
  Tick02Icon,
  Plant01Icon,
  Calendar02Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  useReprogramarTarea,
} from '@/hooks/usePlanesAccion';
import { useEstadosTarea } from '@/hooks/useEstadosTarea';
import { useTiposTarea } from '@/hooks/useTiposTarea';
import { TareaPlanModal } from './TareaPlanModal';


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
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');

  const { data: plan, isLoading: isLoadingPlan } = usePlanAccionQuery(idPlanAccion, {
    id_estado_tarea: filtroEstado,
    fecha: filtroFecha,
  });
  const { query: { data: estadosData, isLoading: isLoadingEstados } } = useEstadosTarea();
  const { query: { data: tiposData, isLoading: isLoadingTipos } } = useTiposTarea();

  const [hitoDestino, setHitoDestino] = useState<HitoPlanAccion | null>(null);
  const [tareaEdicion, setTareaEdicion] = useState<TareaPlanAccion | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<TareaPlanAccion | null>(null);
  
  const [tareaAConfirmar, setTareaAConfirmar] = useState<{ tarea: TareaPlanAccion, targetStateId: number } | null>(null);
  const [tareaAConfirmarFecha, setTareaAConfirmarFecha] = useState<{ tarea: TareaPlanAccion, targetStateId: number } | null>(null);
  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState<string>('');
  
  const [isCerrandoPlan, setIsCerrandoPlan] = useState(false);
  const [confirmacionPlan, setConfirmacionPlan] = useState<EstadoPlanAccionManual | null>(null);

  const crearTarea = useCrearTareaPlan(idPlanAccion, idParcela, () => setHitoDestino(null));
  const editarTarea = useEditarTareaPlan(idPlanAccion, idParcela, () => setTareaEdicion(null));
  const cambiarEstadoTarea = useCambiarEstadoTareaPlan(idPlanAccion, idParcela);
  const eliminarTarea = useEliminarTareaPlan(idPlanAccion, idParcela);
  const cambiarEstadoPlan = useCambiarEstadoPlanAccion(idPlanAccion, idParcela);
  const reprogramarTarea = useReprogramarTarea(idPlanAccion, idParcela);

  const planActivo = plan?.estado === 'Activo';
  const hitos = plan ? [...plan.hitos].sort((a, b) => a.orden_hito - b.orden_hito) : [];

  const estadosLookup = useMemo(() => {
    const map = new Map<number, any>();
    estadosData?.estados_tarea.forEach(e => map.set(e.id_estado_tarea, e));
    return map;
  }, [estadosData]);

  const tiposLookup = useMemo(() => {
    const map = new Map<number, any>();
    tiposData?.tipos_tarea.forEach(t => map.set(t.id_tipo_tarea, t));
    return map;
  }, [tiposData]);

  const defaultExpandedId = hitos.find(h => h.tareas.some(t => {
    const est = estadosLookup.get(t.id_estado_tarea);
    return !est?.es_estado_finalizador;
  }))?.id_hito_real ?? hitos[0]?.id_hito_real;

  const [expandedHitoId, setExpandedHitoId] = useState<number | null>(null);
  const currentExpandedId = expandedHitoId ?? defaultExpandedId;

  if (isLoadingPlan || isLoadingEstados || isLoadingTipos) {
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

  const simularCierrePlan = (tareaId: number, nuevoIdEstado: number) => {
    if (!plan) return false;
    
    const todasLasTareas = plan.hitos.flatMap(h => h.tareas);
    
    const todasFinalizadoras = todasLasTareas.every(t => {
       const stateIdToCheck = t.id_tarea === tareaId ? nuevoIdEstado : t.id_estado_tarea;
       const estadoObj = estadosLookup.get(stateIdToCheck);
       return estadoObj?.es_estado_finalizador ?? false;
    });

    const algunaExitosa = todasLasTareas.some(t => {
       const stateIdToCheck = t.id_tarea === tareaId ? nuevoIdEstado : t.id_estado_tarea;
       const estadoObj = estadosLookup.get(stateIdToCheck);
       return estadoObj?.cuenta_para_cierre_exitoso ?? false;
    });

    return todasFinalizadoras && algunaExitosa && todasLasTareas.length > 0;
  };

  const handleCambioEstado = async (tarea: TareaPlanAccion, targetStateIdStr: string) => {
    const targetStateId = Number(targetStateIdStr);
    const estadoNuevo = estadosLookup.get(targetStateId);
    if (!estadoNuevo) return;
    
    const tipoObj = tiposLookup.get(tarea.id_tipo_tarea);
    const fechaAplicacion = tarea.fecha_hora_aplicacion_aa?.split('T')[0];
    const hoy = new Date().toISOString().split('T')[0];

    const needsDateConfirmation = 
       tipoObj?.es_tipo_agroquimico && 
       estadoNuevo.cuenta_para_cierre_exitoso && 
       fechaAplicacion !== hoy;

    if (needsDateConfirmation) {
      setTareaAConfirmarFecha({ tarea, targetStateId });
      return;
    }

    if (simularCierrePlan(tarea.id_tarea, targetStateId)) {
      setTareaAConfirmar({ tarea, targetStateId });
    } else {
      await cambiarEstadoTarea.mutateAsync({ id_tarea: tarea.id_tarea, id_estado_tarea: targetStateId });
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

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <h4 className="font-bold text-sm text-foreground lg:hidden">Filtros</h4>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto ml-auto">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">Filtrar por:</span>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-white shadow-sm">
              <SelectValue placeholder="Estado: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Estado: Todos</SelectItem>
              {estadosData?.estados_tarea.map((estado) => (
                <SelectItem key={estado.id_estado_tarea} value={String(estado.id_estado_tarea)}>
                  {estado.nombre_estado_tarea}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="h-9 w-full sm:w-[150px] bg-white border border-border rounded-lg px-3 text-sm text-foreground outline-none shadow-sm"
          />
          {planActivo && (
            <Button
              size="sm"
              variant="default"
              className="rounded-xl h-9 px-4 text-xs ml-0 sm:ml-2 w-full sm:w-auto"
              onClick={() => {
                const currentHito = hitos.find(h => h.id_hito_real === currentExpandedId) || hitos[0];
                if (currentHito) setHitoDestino(currentHito);
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-1" />
              Agregar tarea
            </Button>
          )}
        </div>
      </div>

      {(() => {
        const hasTareas = hitos.some(h => h.tareas.length > 0);
        const hasFilterEstado = filtroEstado !== 'todos';
        const hasFilterFecha = filtroFecha !== '';

        if (!hasTareas && (hasFilterEstado || hasFilterFecha)) {
          let emptyMsg = "No hay tareas con el estado seleccionado.";
          if (hasFilterEstado && hasFilterFecha) {
            emptyMsg = "No hay tareas que coincidan con los filtros seleccionados.";
          } else if (hasFilterFecha) {
            emptyMsg = "No hay tareas planificadas para la fecha seleccionada.";
          }
          return (
            <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-muted/5">
              {emptyMsg}
            </div>
          );
        }

        return (
          <>
            <div className="flex overflow-x-auto pb-8 pt-2 gap-0 custom-scrollbar w-full mb-2 items-start">
              {hitos.map((hito, i) => {
                const isComplete = hito.tareas.length > 0 && hito.tareas.every(t => {
                  const est = estadosLookup.get(t.id_estado_tarea);
                  return est?.es_estado_finalizador;
                });
                const isActual = hito.id_hito_real === defaultExpandedId;
                const isSelected = hito.id_hito_real === currentExpandedId;

                return (
                  <div 
                    key={hito.id_hito_real} 
                    className="w-48 shrink-0 flex flex-col items-center relative cursor-pointer group"
                    onClick={() => setExpandedHitoId(hito.id_hito_real)}
                  >
                    {i !== hitos.length - 1 && (
                      <div className={`absolute top-[1.375rem] left-[50%] w-full h-[2px] -z-10 transition-colors duration-300 ${isComplete ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    
                    <div className={`flex items-center justify-center w-11 h-11 rounded-full border-[3px] border-card transition-all duration-300 mb-2 ${
                      isComplete 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : isActual 
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isComplete ? (
                        <HugeiconsIcon icon={Tick02Icon} className="size-6" strokeWidth={2.5} />
                      ) : (
                        <HugeiconsIcon icon={Plant01Icon} className="size-5" strokeWidth={1.5} />
                      )}
                    </div>
                    
                    <h5 className={`text-xs font-bold text-center line-clamp-2 px-2 transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {hito.nombre_hito}
                    </h5>
                    
                    {isSelected && (
                      <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
        {hitos.map((hito) => {
          if (hito.id_hito_real !== currentExpandedId) return null;
          
          return (
            <section
              key={hito.id_hito_real}
              className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-3 animate-in fade-in duration-300"
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
              </div>

              {hito.tareas.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">Este hito todavía no tiene tareas.</p>
              ) : (
                <div className="space-y-2">
                  {hito.tareas.map((tarea) => {
                    const est = estadosLookup.get(tarea.id_estado_tarea);
                    const completada = est?.es_estado_finalizador ?? false;
                    
                    return (
                      <article
                        key={tarea.id_tarea}
                        className="rounded-xl border border-border/50 bg-card p-3 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{tarea.nombre_tarea}</p>
                            <p className="text-xs text-muted-foreground">{tarea.descripcion_tarea}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground items-center">
                              {tarea.atrasada && (
                                <Badge variant="warning" className="uppercase text-[9px] px-1.5 py-0 h-4">Atrasada</Badge>
                              )}
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

                            {tarea.atrasada && reprogramandoId !== tarea.id_tarea && (
                              <div className="pt-1.5">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-800"
                                  onClick={() => { setReprogramandoId(tarea.id_tarea); setNuevaFecha(tarea.fecha_planificada_tarea); }}
                                >
                                  <HugeiconsIcon icon={Calendar02Icon} className="size-3.5 mr-1.5" />
                                  Reprogramar tarea
                                </Button>
                              </div>
                            )}

                            {reprogramandoId === tarea.id_tarea && (
                              <div className="pt-2 mt-2 border-t border-border flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-foreground">Nueva fecha:</span>
                                <input 
                                  type="date" 
                                  value={nuevaFecha} 
                                  onChange={e => setNuevaFecha(e.target.value)} 
                                  className="h-8 px-2 border border-border rounded-md text-sm outline-none w-[140px]" 
                                  disabled={reprogramarTarea.isPending}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-muted-foreground"
                                  onClick={() => setReprogramandoId(null)}
                                  disabled={reprogramarTarea.isPending}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8 px-3"
                                  onClick={() => reprogramarTarea.mutateAsync({ id_tarea: tarea.id_tarea, fecha_planificada_tarea: nuevaFecha }).then(() => setReprogramandoId(null))}
                                  disabled={reprogramarTarea.isPending || !nuevaFecha}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Select
                              value={String(tarea.id_estado_tarea)}
                              disabled={!planActivo || completada || cambiarEstadoTarea.isPending}
                              onValueChange={(value) => handleCambioEstado(tarea, value)}
                            >
                              <SelectTrigger className="h-8 w-[140px] text-xs rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {estadosData?.estados_tarea.map((estado) => (
                                  <SelectItem key={estado.id_estado_tarea} value={String(estado.id_estado_tarea)}>
                                    {estado.nombre_estado_tarea}
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
          );
        })}
      </div>
          </>
        );
      })()}

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

      <AlertDialog 
        open={tareaAConfirmar != null} 
        onOpenChange={(open) => {
          if (!open && !isCerrandoPlan) setTareaAConfirmar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmás que se finaliza la última tarea pendiente de este cultivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Al aceptar, esta tarea cambiará de estado y el cultivo finalizará, pasando al historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCerrandoPlan}>Seguir revisando</AlertDialogCancel>
            <Button
              disabled={isCerrandoPlan}
              onClick={async () => {
                if (!tareaAConfirmar) return;
                setIsCerrandoPlan(true);
                try {
                  await cambiarEstadoTarea.mutateAsync({ 
                    id_tarea: tareaAConfirmar.tarea.id_tarea, 
                    id_estado_tarea: tareaAConfirmar.targetStateId 
                  });
                  await cambiarEstadoPlan.mutateAsync('Finalizado');
                  setTareaAConfirmar(null);
                } catch (error) {
                  // Manejado por hooks
                } finally {
                  setIsCerrandoPlan(false);
                }
              }}
            >
              {isCerrandoPlan ? 'Finalizando...' : 'Sí, finalizar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={tareaAConfirmarFecha != null} 
        onOpenChange={(open) => {
          if (!open) setTareaAConfirmarFecha(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atención con la fecha de aplicación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿La aplicación se realizó el {tareaAConfirmarFecha?.tarea.fecha_hora_aplicacion_aa?.split('T')[0]}? Si no, editá la tarea antes de continuar para que el registro quede con la fecha real.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar y editar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!tareaAConfirmarFecha) return;
                
                const tareaObj = tareaAConfirmarFecha.tarea;
                const targetState = tareaAConfirmarFecha.targetStateId;
                
                setTareaAConfirmarFecha(null);

                // Volvemos a chequear si se cierra el plan, dado que saltamos el popup intermedio
                if (simularCierrePlan(tareaObj.id_tarea, targetState)) {
                  setTareaAConfirmar({ tarea: tareaObj, targetStateId: targetState });
                } else {
                  cambiarEstadoTarea.mutate({ id_tarea: tareaObj.id_tarea, id_estado_tarea: targetState });
                }
              }}
            >
              Sí, confirmar fecha
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
