import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PencilEdit01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { toast } from '@/components/ui/sonner';
import { cultivoBaseSchema, CultivoBaseFormValues, EPOCAS_CULTIVO, FORMAS_SIEMBRA } from '@/utils/validators';
import {
  formatCicloProductivo,
  formatEpocaCultivo,
  formatFormaSiembra,
  formatMesSiembra,
  MESES_SIEMBRA,
  parseCicloProductivo,
  parseMesSiembra,
} from '@/utils/formatters';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import {
  useActualizarCultivoBase,
  useCrearCultivoBase,
  useCultivoBase,
  useEliminarVariedad,
} from '@/hooks/useCultivosBase';
import { CrearCultivoBaseRequest, CultivoBaseDetalle, VariedadDetalle } from '@/types/cultivos.types';
import { FormularioVariedadInline } from './FormularioVariedadInline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const FORM_DEFAULTS: CultivoBaseFormValues = {
  nombre_cultivo_base: '',
  descripcion_cb: '',
  epoca_cultivo: undefined as unknown as CultivoBaseFormValues['epoca_cultivo'],
  forma_siembra: undefined as unknown as CultivoBaseFormValues['forma_siembra'],
  mes_desde: '',
  mes_hasta: '',
  ciclo_desde: undefined as unknown as number,
  ciclo_hasta: undefined as unknown as number,
};

function mapDetalleAFormulario(detalle: CultivoBaseDetalle): CultivoBaseFormValues {
  const meses = parseMesSiembra(detalle.mes_siembra);
  const ciclo = parseCicloProductivo(detalle.ciclo_productivo_cb);
  return {
    nombre_cultivo_base: detalle.nombre_cultivo_base,
    descripcion_cb: detalle.descripcion_cb,
    epoca_cultivo: detalle.epoca_cultivo,
    forma_siembra: detalle.forma_siembra,
    mes_desde: meses.mes_desde,
    mes_hasta: meses.mes_hasta,
    ciclo_desde: ciclo.ciclo_desde,
    ciclo_hasta: ciclo.ciclo_hasta,
  };
}

function mapFormularioARequest(values: CultivoBaseFormValues): CrearCultivoBaseRequest {
  return {
    nombre_cultivo_base: values.nombre_cultivo_base,
    descripcion_cb: values.descripcion_cb,
    epoca_cultivo: values.epoca_cultivo,
    forma_siembra: values.forma_siembra,
    mes_siembra: formatMesSiembra(values.mes_desde, values.mes_hasta),
    ciclo_productivo_cb: formatCicloProductivo(Number(values.ciclo_desde), Number(values.ciclo_hasta)),
  };
}

interface CultivoBaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idCultivoBase: number | null;
}

export function CultivoBaseModal({ open, onOpenChange, idCultivoBase }: CultivoBaseModalProps) {
  const [idCreado, setIdCreado] = useState<number | null>(null);
  const [editandoFicha, setEditandoFicha] = useState(false);
  const [agregandoVariedad, setAgregandoVariedad] = useState(false);
  const [variedadEnEdicion, setVariedadEnEdicion] = useState<VariedadDetalle | null>(null);
  const [variedadAEliminar, setVariedadAEliminar] = useState<VariedadDetalle | null>(null);

  const idActivo = idCreado ?? idCultivoBase;
  const esCreacion = idActivo == null;
  const camposEditables = esCreacion || editandoFicha;

  const { data: detalle, isLoading: isLoadingDetalle } = useCultivoBase(idActivo);
  const crearMutation = useCrearCultivoBase();
  const actualizarMutation = useActualizarCultivoBase();
  const eliminarVariedadMutation = useEliminarVariedad();

  const form = useForm<CultivoBaseFormValues>({
    resolver: zodResolver(cultivoBaseSchema),
    defaultValues: FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    setIdCreado(null);
    setEditandoFicha(false);
    setAgregandoVariedad(false);
    setVariedadEnEdicion(null);
    setVariedadAEliminar(null);
    if (idCultivoBase == null) {
      form.reset(FORM_DEFAULTS);
    }
    // form.reset es estable; no incluir `form` para no resetear el idCreado tras el alta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idCultivoBase]);

  useEffect(() => {
    if (detalle && !editandoFicha) {
      form.reset(mapDetalleAFormulario(detalle));
    }
  }, [detalle, editandoFicha, form]);

  const cerrar = () => {
    form.reset(FORM_DEFAULTS);
    setEditandoFicha(false);
    setAgregandoVariedad(false);
    setVariedadEnEdicion(null);
    onOpenChange(false);
  };

  const onSubmitFicha = (values: CultivoBaseFormValues) => {
    const data = mapFormularioARequest(values);

    if (esCreacion) {
      crearMutation.mutate(data, {
        onSuccess: (response) => {
          showSuccessToast(response);
          setIdCreado(response.id_cultivo_base);
          setEditandoFicha(false);
        },
        onError: (error) => handleFormError(error, form.setError),
      });
      return;
    }

    actualizarMutation.mutate(
      { id_cultivo_base: idActivo, data },
      {
        onSuccess: (response) => {
          showSuccessToast(response);
          setEditandoFicha(false);
        },
        onError: (error) => handleFormError(error, form.setError),
      },
    );
  };

  const cancelarEdicionFicha = () => {
    if (esCreacion) {
      cerrar();
      return;
    }
    if (detalle) {
      form.reset(mapDetalleAFormulario(detalle));
    }
    setEditandoFicha(false);
  };

  const pedirEliminarVariedad = (variedad: VariedadDetalle) => {
    if (variedad.en_uso) {
      toast.error('Esta variedad no se puede eliminar porque está en uso.');
      return;
    }
    setVariedadAEliminar(variedad);
  };

  const confirmarEliminarVariedad = () => {
    if (!idActivo || !variedadAEliminar) return;
    eliminarVariedadMutation.mutate(
      { id_cultivo_base: idActivo, id_variedad: variedadAEliminar.id_variedad },
      {
        onSuccess: (response) => {
          showSuccessToast(response);
          setVariedadAEliminar(null);
        },
        onError: (error) => {
          handleFormError(error);
          setVariedadAEliminar(null);
        },
      },
    );
  };

  const isSavingFicha = crearMutation.isPending || actualizarMutation.isPending;
  const titulo = esCreacion
    ? 'Crear cultivo'
    : detalle?.nombre_cultivo_base ?? 'Detalle de cultivo';

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val && variedadAEliminar) return;
          if (!val) cerrar();
        }}
      >
        <DialogContent
          className="sm:max-w-2xl bg-card p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col"
          onPointerDownOutside={(e) => {
            if (variedadAEliminar) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (variedadAEliminar) e.preventDefault();
          }}
        >
          <DialogHeader className="p-6 border-b border-border bg-muted/50">
            <DialogTitle className="text-xl font-bold text-primary">{titulo}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto p-6 flex flex-col gap-6">
            {!esCreacion && isLoadingDetalle ? (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                Cargando...
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-base font-semibold text-foreground">Ficha técnica</h3>
                    {!esCreacion && !editandoFicha && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditandoFicha(true)}>
                        Editar
                      </Button>
                    )}
                  </div>

                  {camposEditables ? (
                    <Form {...form}>
                      <form id="form-ficha-cultivo" onSubmit={form.handleSubmit(onSubmitFicha)} className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="nombre_cultivo_base"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del cultivo *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej. Tomate" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="descripcion_cb"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Descripción agronómica del cultivo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="epoca_cultivo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Temporada *</FormLabel>
                                <FormControl>
                                  <select className={SELECT_CLASS} {...field} value={field.value ?? ''}>
                                    <option value="">Seleccioná una temporada</option>
                                    {EPOCAS_CULTIVO.map((epoca) => (
                                      <option key={epoca} value={epoca}>
                                        {formatEpocaCultivo(epoca)}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="forma_siembra"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Forma de siembra *</FormLabel>
                                <FormControl>
                                  <select className={SELECT_CLASS} {...field} value={field.value ?? ''}>
                                    <option value="">Seleccioná una forma</option>
                                    {FORMAS_SIEMBRA.map((forma) => (
                                      <option key={forma} value={forma}>
                                        {formatFormaSiembra(forma)}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="mes_desde"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mes de siembra desde *</FormLabel>
                                <FormControl>
                                  <select className={SELECT_CLASS} {...field}>
                                    <option value="">Desde</option>
                                    {MESES_SIEMBRA.map((mes) => (
                                      <option key={mes.value} value={mes.value}>
                                        {mes.label}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="mes_hasta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mes de siembra hasta *</FormLabel>
                                <FormControl>
                                  <select className={SELECT_CLASS} {...field}>
                                    <option value="">Hasta</option>
                                    {MESES_SIEMBRA.map((mes) => (
                                      <option key={mes.value} value={mes.value}>
                                        {mes.label}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ciclo_desde"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Días a cosecha (mín.) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    placeholder="70"
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ciclo_hasta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Días a cosecha (máx.) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    placeholder="90"
                                    {...field}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground mb-1">Nombre del cultivo</dt>
                        <dd className="font-medium">{detalle?.nombre_cultivo_base}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Temporada</dt>
                        <dd className="font-medium">
                          {detalle ? formatEpocaCultivo(detalle.epoca_cultivo) : '—'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground mb-1">Descripción</dt>
                        <dd className="font-medium">{detalle?.descripcion_cb}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Forma de siembra</dt>
                        <dd className="font-medium">
                          {detalle ? formatFormaSiembra(detalle.forma_siembra) : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Meses óptimos de siembra</dt>
                        <dd className="font-medium">{detalle?.mes_siembra}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Días a cosecha referencial</dt>
                        <dd className="font-medium">{detalle?.ciclo_productivo_cb}</dd>
                      </div>
                    </dl>
                  )}

                  {camposEditables && (
                    <div className="flex justify-end gap-3 mt-4">
                      <Button type="button" variant="outline" onClick={cancelarEdicionFicha} disabled={isSavingFicha}>
                        Cancelar
                      </Button>
                      <Button type="submit" form="form-ficha-cultivo" disabled={isSavingFicha}>
                        {isSavingFicha ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  )}
                </section>

                {!esCreacion && detalle && idActivo != null && (
                  <section className="border-t border-border pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-base font-semibold text-foreground">Variedades</h3>
                      {!agregandoVariedad && !variedadEnEdicion && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setVariedadEnEdicion(null);
                            setAgregandoVariedad(true);
                          }}
                        >
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                          Agregar variedad
                        </Button>
                      )}
                    </div>

                    {detalle.variedades.length === 0 && !agregandoVariedad && (
                      <p className="text-sm text-muted-foreground">
                        Este cultivo aún no tiene variedades.
                      </p>
                    )}

                    <div className="flex flex-col">
                      {detalle.variedades.map((variedad, index) => (
                        <div key={variedad.id_variedad}>
                          {variedadEnEdicion?.id_variedad === variedad.id_variedad ? (
                            <div className="py-3">
                              <FormularioVariedadInline
                                idCultivoBase={idActivo}
                                variedad={variedad}
                                onCancel={() => setVariedadEnEdicion(null)}
                                onSuccess={() => setVariedadEnEdicion(null)}
                              />
                            </div>
                          ) : (
                            <div
                              className={`flex items-center justify-between gap-3 py-3 ${
                                index !== detalle.variedades.length - 1 || agregandoVariedad
                                  ? 'border-b border-border/50'
                                  : ''
                              }`}
                            >
                              <div>
                                <p className="font-medium text-sm text-foreground">{variedad.nombre_variedad}</p>
                                <p className="text-xs text-muted-foreground">{variedad.dias_a_cosecha} días a cosecha</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md"
                                  title="Editar"
                                  onClick={() => {
                                    setAgregandoVariedad(false);
                                    setVariedadEnEdicion(variedad);
                                  }}
                                >
                                  <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"
                                  title="Eliminar"
                                  onClick={() => pedirEliminarVariedad(variedad)}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {agregandoVariedad && idActivo != null && (
                      <div className="mt-4">
                        <FormularioVariedadInline
                          idCultivoBase={idActivo}
                          onCancel={() => setAgregandoVariedad(false)}
                          onSuccess={() => setAgregandoVariedad(false)}
                        />
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(variedadAEliminar)} onOpenChange={(val) => { if (!val) setVariedadAEliminar(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro que deseás eliminar esta variedad?</DialogTitle>
            <DialogDescription>
              Esta acción dará de baja la variedad y ya no estará disponible en el cultivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVariedadAEliminar(null)}
              disabled={eliminarVariedadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminarVariedad}
              disabled={eliminarVariedadMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
