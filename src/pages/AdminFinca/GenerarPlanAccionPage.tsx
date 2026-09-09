import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  Calendar01Icon, 
  Plant01Icon, 
  FlowSquareIcon, 
  CheckmarkCircle01Icon, 
  Add01Icon, 
  MapsLocation01Icon,
  Delete01Icon,
  Alert01Icon
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCultivoBase } from '@/hooks/useCultivosBase';
import { useFincasQuery, useFincaQuery } from '@/hooks/useFincas';
import { usePlanPreview, useCrearPlanAccion } from '@/hooks/usePlanesAccion';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { eventosDesdeHitos } from '@/utils/plan-calendario';
import { generarPlanAccionSchema, GenerarPlanAccionFormValues } from '@/utils/validators';
import { CalendarioPlanMensual } from './components/CalendarioPlanMensual';

export default function GenerarPlanAccionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const idCultivo = Number(id);

  const initFinca = searchParams.get('id_finca') ? Number(searchParams.get('id_finca')) : undefined;
  const initParcela = searchParams.get('id_parcela') ? Number(searchParams.get('id_parcela')) : undefined;

  const form = useForm<GenerarPlanAccionFormValues>({
    resolver: zodResolver(generarPlanAccionSchema),
    defaultValues: {
      id_finca: initFinca,
      id_parcela: initParcela,
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      asignaciones: [],
    },
  });

  const idFinca = form.watch('id_finca');
  const idParcela = form.watch('id_parcela');
  const fechaInicioStr = form.watch('fecha_inicio');
  const asignaciones = form.watch('asignaciones');

  const { data: detalle, isLoading: loadingCultivo, error } = useCultivoBase(
    Number.isFinite(idCultivo) ? idCultivo : null,
  );
  
  const { data: fincasRes, isLoading: loadingFincas } = useFincasQuery(1, 100);
  
  const { data: fincaDetalle, isLoading: loadingFincaDetalle } = useFincaQuery(idFinca || null);

  const { data: planPreview } = usePlanPreview(idCultivo, idParcela || null);
  const queryClient = useQueryClient();

  const { mutate: crearPlan, isPending: isCreating } = useCrearPlanAccion(
    (msg) => {
      queryClient.invalidateQueries({ queryKey: ['fincas'] });
      if (idFinca) queryClient.invalidateQueries({ queryKey: ['finca', idFinca] });
      if (idParcela) queryClient.invalidateQueries({ queryKey: ['parcela', idParcela] });
      queryClient.invalidateQueries({ queryKey: ['planPreview'] });
      showSuccessToast({ message: msg });
      navigate(`/admin-finca/parcelas/${idParcela}`);
    },
    (err: any) => {
      if (err?.response?.data?.field === 'superficie_asignada') {
        form.setError('root.superficie_excedida', { 
          type: 'manual', 
          message: 'La superficie total supera el límite real disponible en la parcela.' 
        });
      } else {
        handleFormError(err, form.setError);
      }
    }
  );

  const { fields: asignacionFields, replace, append, remove } = useFieldArray({
    control: form.control,
    name: 'asignaciones',
  });

  // Inyectar superficie_disponible en el formulario para validación local Zod
  useEffect(() => {
    if (planPreview?.superficie_disponible_parcela !== undefined) {
      form.setValue('superficie_disponible', planPreview.superficie_disponible_parcela);
    } else {
      form.setValue('superficie_disponible', undefined);
    }
  }, [planPreview?.superficie_disponible_parcela, form]);

  // Si no había asignaciones y el preview carga las variedades de la plantilla, agregar la primera
  useEffect(() => {
    if (planPreview && planPreview.plantillas.length > 0 && asignacionFields.length === 0) {
      const p = planPreview.plantillas[0];
      if (p.variedades.length > 0) {
        replace([{ id_variedad: p.variedades[0].id_variedad, superficie_asignada: 0 }]);
      }
    }
  }, [planPreview, replace, asignacionFields.length]);

  useEffect(() => {
    if (error) {
      handleFormError(error, undefined, {
        onNotFoundRedirect: () => navigate('/admin-finca/biblioteca'),
      });
    }
  }, [error, navigate]);

  const [tareasActivas, setTareasActivas] = useState<Set<number>>(new Set());
  const [mesVisible, setMesVisible] = useState(() => new Date());

  useEffect(() => {
    if (planPreview && planPreview.plantillas.length > 0) {
      const ids = new Set<number>();
      planPreview.plantillas[0].hitos.forEach((hito: any) => {
        hito.tareas.forEach((tarea: any) => ids.add(tarea.id_tarea_plantilla));
      });
      setTareasActivas(ids);
    }
  }, [planPreview]);

  useEffect(() => {
    if (fechaInicioStr) {
      const parsed = new Date(`${fechaInicioStr}T00:00:00`);
      if (!isNaN(parsed.getTime())) {
        setMesVisible(parsed);
      }
    }
  }, [fechaInicioStr]);

  const eventos = useMemo(() => {
    if (!planPreview || planPreview.plantillas.length === 0 || !fechaInicioStr) return [];
    const hitosFiltrados = planPreview.plantillas[0].hitos.map((hito: any) => ({
      ...hito,
      tareas: hito.tareas.filter((tarea: any) => tareasActivas.has(tarea.id_tarea_plantilla)),
    }));
    const d = new Date(`${fechaInicioStr}T00:00:00`);
    if (isNaN(d.getTime())) return [];
    return eventosDesdeHitos(hitosFiltrados, d);
  }, [planPreview, fechaInicioStr, tareasActivas]);

  const fincas = fincasRes?.fincas ?? [];
  const parcelas = fincaDetalle?.parcelas ?? [];

  const toggleTarea = (id_tarea_plantilla: number) => {
    setTareasActivas((prev) => {
      const next = new Set(prev);
      if (next.has(id_tarea_plantilla)) next.delete(id_tarea_plantilla);
      else next.add(id_tarea_plantilla);
      return next;
    });
  };

  const onSubmit = (data: GenerarPlanAccionFormValues) => {
    crearPlan({
      id_parcela: data.id_parcela,
      data: {
        id_cultivo_base: idCultivo,
        asignaciones: data.asignaciones.map(a => ({
          id_variedad: a.id_variedad,
          superficie_asignada: a.superficie_asignada,
          fecha_inicio: data.fecha_inicio
        }))
      }
    });
  };

  if (loadingCultivo || !detalle || loadingFincas) {
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Cargando...
      </div>
    );
  }

  const plantillaAsociada = planPreview?.plantillas[0];
  const variedadesDisponibles = plantillaAsociada?.variedades ?? detalle.variedades ?? [];

  const addVariety = () => {
    if (variedadesDisponibles.length > 0) {
      append({ id_variedad: variedadesDisponibles[0].id_variedad, superficie_asignada: 0 });
    }
  };

  const totalAreaAsignada = asignaciones.reduce((acc, curr) => acc + (Number(curr.superficie_asignada) || 0), 0);
  const selectedFinca = fincas.find((f: any) => f.id_finca === idFinca);
  const selectedParcela = parcelas.find((p: any) => p.id_parcela === idParcela);

  const superficieDisponibleInicial = planPreview?.superficie_disponible_parcela || 0;
  const superficieRestante = Math.max(0, superficieDisponibleInicial - totalAreaAsignada);
  const exceedsAvailability = totalAreaAsignada > superficieDisponibleInicial;

  return (
    <div className="w-full max-w-screen-xl mx-auto pb-32 space-y-6">
      <div className="pt-6 px-4 md:px-0">
        <Button 
          type="button"
          variant="outline" 
          onClick={() => navigate(`/admin-finca/biblioteca/${idCultivo}${location.search}`)}
          className="rounded-full gap-2 text-sm font-medium border-border shadow-sm mb-6 h-9 px-4 bg-background"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Volver
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
          Generar Plan de Acción: <span className="text-foreground">{detalle.nombre_cultivo_base}</span>
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4 md:px-0">
          
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <HugeiconsIcon icon={Plant01Icon} className="size-5" strokeWidth={2} />
              <h2 className="text-lg font-bold">Configuración de Siembra</h2>
            </div>
            
            <div className="space-y-4">
              {asignacionFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`asignaciones.${index}.id_variedad`}
                    render={({ field: selectField }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground font-medium text-xs">Variedad</FormLabel>
                        <Select 
                          onValueChange={(val) => selectField.onChange(Number(val))} 
                          value={selectField.value ? String(selectField.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border h-11">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {variedadesDisponibles.map((v: any) => (
                              <SelectItem key={v.id_variedad} value={String(v.id_variedad)}>{v.nombre_variedad}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {index === 0 ? (
                    <>
                      <FormField
                        control={form.control}
                        name="id_finca"
                        render={({ field: fField }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-medium text-xs">Finca</FormLabel>
                            <Select 
                              onValueChange={(val) => {
                                fField.onChange(Number(val));
                                form.setValue('id_parcela', 0 as any); 
                              }} 
                              value={fField.value ? String(fField.value) : undefined}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background border-border h-11">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fincas.map((f: any) => (
                                  <SelectItem key={f.id_finca} value={String(f.id_finca)}>{f.nombre_finca}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_parcela"
                        render={({ field: pField }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-medium text-xs">Parcela</FormLabel>
                            <Select 
                              onValueChange={(val) => pField.onChange(Number(val))} 
                              value={pField.value ? String(pField.value) : undefined}
                              disabled={!idFinca || loadingFincaDetalle}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background border-border h-11">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {parcelas.map((p: any) => (
                                  <SelectItem key={p.id_parcela} value={String(p.id_parcela)}>{p.nombre_parcela}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground/60 font-medium text-xs block">Finca</Label>
                        <Select value={idFinca ? String(idFinca) : undefined} disabled>
                          <SelectTrigger className="bg-muted/30 border-border h-11 text-muted-foreground">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </Select>
                        <p className="text-[10px] text-muted-foreground/80 leading-tight mt-1">Coincide con variedad inicial</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground/60 font-medium text-xs block">Parcela</Label>
                        <Select value={idParcela ? String(idParcela) : undefined} disabled>
                          <SelectTrigger className="bg-muted/30 border-border h-11 text-muted-foreground">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </Select>
                      </div>
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name={`asignaciones.${index}.superficie_asignada`}
                    render={({ field: sField }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground font-medium text-xs">Superficie a asignar (Ha)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input 
                                type="number" 
                                min={0} 
                                step="0.01" 
                                className={`bg-background h-11 pr-12 ${form.formState.errors.asignaciones?.[index]?.superficie_asignada ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                {...sField} 
                                value={sField.value === undefined ? '' : sField.value}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Ha</span>
                            </div>
                            {asignacionFields.length > 1 && (
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                onClick={() => remove(index)} 
                                className="h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              >
                                <HugeiconsIcon icon={Delete01Icon} className="size-5" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        {index === 0 && planPreview && !exceedsAvailability && (
                          <div className="text-[11px] text-primary font-medium flex items-center mt-1">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3 mr-1" />
                            Disponible: {superficieRestante.toFixed(2)} Ha
                          </div>
                        )}
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addVariety}
                className="text-primary border-primary hover:bg-primary/5 mt-4 h-10 font-semibold"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
                Agregar otra variedad
              </Button>
            </div>
          </section>

          {plantillaAsociada && (
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <HugeiconsIcon icon={FlowSquareIcon} className="size-5" strokeWidth={2} />
                <h2 className="text-lg font-bold">Hitos del Cultivo</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Este es el cronograma base sugerido para el cultivo. Una vez que lo asignes a tu parcela, vas a poder modificar, borrar o agregar nuevas tareas y personalizar cada hito cuando quieras.
              </p>
              
              <div className="flex overflow-x-auto pb-4 gap-8 custom-scrollbar">
                {plantillaAsociada.hitos.map((hito: any, i: number) => {
                  const tag = i === 0 ? "INICIO" : `+${hito.tareas[0]?.dia_relativo_tp || 0} Días`;
                  const tagBg = i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border/50";
                  
                  return (
                    <div key={hito.id_hito_plantilla} className="min-w-[280px] flex flex-col relative">
                      {i !== plantillaAsociada.hitos.length - 1 && (
                        <div className="absolute top-[1.35rem] left-[4rem] right-[-2rem] h-[2px] bg-border -z-10" />
                      )}
                      
                      <div className="flex flex-col items-center self-start mb-4">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-muted border-[3px] border-card text-primary/70 mb-2">
                          <HugeiconsIcon icon={Plant01Icon} className="size-5" strokeWidth={1.5} /> 
                        </div>
                        <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${tagBg}`}>
                          {tag}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-base mb-1">{hito.nombre_hpb}</h3>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-1">{hito.tareas[0]?.descripcion_tp || 'Actividades de campo'}</p>
                      
                      <div className="space-y-2">
                        {hito.tareas.map((tarea: any) => {
                          const isActive = tareasActivas.has(tarea.id_tarea_plantilla);
                          return (
                            <div 
                              key={tarea.id_tarea_plantilla} 
                              className="flex items-start gap-2 cursor-pointer group"
                              onClick={() => toggleTarea(tarea.id_tarea_plantilla)}
                            >
                              <div className={`mt-[2px] w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
                                {isActive && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" strokeWidth={2.5} />}
                              </div>
                              <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {tarea.nombre_tipo_tarea}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {plantillaAsociada && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm md:col-span-1">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <HugeiconsIcon icon={Calendar01Icon} className="size-5" strokeWidth={2} />
                <h2 className="text-lg font-bold">Fecha de Siembra</h2>
              </div>
              
              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormControl>
                      <Input type="date" className="h-11 bg-background block w-full justify-between [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Seleccione el inicio del plan. Las tareas subsiguientes se recalcularán automáticamente basándose en este hito inicial.
              </p>
            </section>
            
            <section className="bg-[#FAF9F6] border border-border/60 rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col justify-center">
              <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
                <HugeiconsIcon icon={MapsLocation01Icon} className="size-5" strokeWidth={2} /> 
                Ubicación del Cultivo
              </h3>
              <ul className="space-y-2 text-foreground font-semibold text-[13px]">
                <li className="flex items-center"><span className="text-muted-foreground w-16">Finca:</span> {selectedFinca?.nombre_finca || '-'}</li>
                <li className="flex items-center"><span className="text-muted-foreground w-16">Parcela:</span> {selectedParcela?.nombre_parcela || '-'}</li>
                <li className="flex items-center"><span className="text-muted-foreground w-16">Área:</span> {totalAreaAsignada > 0 ? `${totalAreaAsignada.toFixed(2)} Hectáreas` : '-'}</li>
              </ul>
            </section>
          </div>
          )}

          {plantillaAsociada && (
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <CalendarioPlanMensual
                mesVisible={mesVisible}
                onCambiarMes={setMesVisible}
                eventos={eventos}
              />
            </section>
          )}

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 px-8 z-50 lg:left-64">
            <div className="max-w-5xl mx-auto flex items-center justify-between w-full gap-4">
              <div className="flex-1 pr-4">
                {exceedsAvailability && (
                  <div className="flex items-center gap-2 text-destructive text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">
                    <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0" />
                    <span>
                      La suma asignada ({totalAreaAsignada.toFixed(2)} Ha) supera la disponibilidad ({superficieDisponibleInicial.toFixed(2)} Ha)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full px-6 bg-background h-10 border-border/80 text-foreground font-semibold" 
                  onClick={() => navigate(`/admin-finca/biblioteca/${idCultivo}${location.search}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating || !planPreview || asignacionFields.length === 0 || exceedsAvailability} 
                  className="rounded-full px-6 h-10 font-semibold"
                >
                  {isCreating ? 'Guardando...' : 'Asociar cultivo y Plan de acción a parcela'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
