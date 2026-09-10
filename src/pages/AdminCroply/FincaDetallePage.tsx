import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useFincaQuery, 
  useUpdateFincaYPropietarioMutation,
  useAdministradoresFincaDisponiblesQuery,
  useCreateParcelaMutation,
  useUpdateParcelaMutation,
  useDeleteParcelaMutation
} from '../../hooks/useFincas';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CardMetrica } from '../../components/shared/CardMetrica';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MapsLocation01Icon,
  UserIcon,
  MapsCircle02Icon,
  PencilEdit02Icon,
  ArrowRight01Icon,
  Wifi01Icon,
  DashboardSquare01Icon,
  PlusSignIcon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { handleFormError } from '../../utils/errorHandler';
import { CrearEditarParcelaForm } from './components/CrearEditarParcelaForm';

const formSchema = z.object({
  nombre_finca: z.string().min(1, 'El nombre es obligatorio'),
  superficie_finca: z.coerce.number().min(0.01, 'La superficie debe ser mayor a 0'),
  descripcion_finca: z.string().optional(),
  id_usuario_propietario: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const estadoCuentaBadge = (estado: string) => {
  if (estado === 'Activo') return <Badge variant="success">Activo</Badge>;
  if (estado === 'Inactivo') return <Badge variant="neutral">Inactivo</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
};

const estadoSenalBadge = (estado: string) => {
  if (estado === 'Transmitiendo') return <Badge variant="success">{estado}</Badge>;
  if (estado === 'Sin_senal') return <Badge variant="neutral">Sin señal</Badge>;
  return <Badge variant="neutral">{estado}</Badge>;
};

const estadoControladorBadge = (estado: string) => {
  if (estado === 'Transmitiendo') return <Badge variant="info">{estado}</Badge>;
  if (estado === 'Sin_senal') return <Badge variant="neutral">Sin señal</Badge>;
  return <Badge variant="neutral">{estado}</Badge>;
};

export default function FincaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingParcela, setIsAddingParcela] = useState(false);
  const [editingParcelaId, setEditingParcelaId] = useState<number | null>(null);
  const [parcelaToDelete, setParcelaToDelete] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre_finca: '', superficie_finca: 0, descripcion_finca: '', id_usuario_propietario: 'none' },
  });

  const { data: finca, isLoading } = useFincaQuery(Number(id));
  const { data: administradoresRes, isLoading: loadingAdmins } = useAdministradoresFincaDisponiblesQuery();
  const administradores = administradoresRes?.usuarios || [];

  const { mutate: updateFincaYPropietario, isPending } = useUpdateFincaYPropietarioMutation(
    Number(id),
    () => setIsEditing(false),
    form.setError
  );

  const { mutate: createParcela, isPending: isCreatingParcela } = useCreateParcelaMutation(Number(id), () => {
    setIsAddingParcela(false);
  });
  
  const { mutate: updateParcela, isPending: isUpdatingParcela } = useUpdateParcelaMutation(Number(id), () => {
    setEditingParcelaId(null);
  });

  const { mutate: deleteParcela, isPending: isDeletingParcela } = useDeleteParcelaMutation(Number(id));

  useEffect(() => {
    if (finca) {
      form.reset({
        nombre_finca: finca.nombre_finca,
        superficie_finca: finca.superficie_finca,
        descripcion_finca: finca.descripcion_finca || '',
        id_usuario_propietario: finca.propietario ? String(finca.propietario.id_usuario) : 'none',
      });
    }
  }, [finca, form]);

  const onSubmit = (data: FormValues) => {
    if (!finca) return;

    // Comparar para evitar requests innecesarios
    const fincaCambio = 
      data.nombre_finca !== finca.nombre_finca || 
      Number(data.superficie_finca) !== Number(finca.superficie_finca) || 
      (data.descripcion_finca || '') !== (finca.descripcion_finca || '');

    const newOwnerVal = data.id_usuario_propietario === 'none' ? null : Number(data.id_usuario_propietario);
    const oldOwnerVal = finca.propietario ? finca.propietario.id_usuario : null;
    const propietarioCambio = newOwnerVal !== oldOwnerVal;

    if (!fincaCambio && !propietarioCambio) {
      setIsEditing(false); // No hubo cambios, cerramos edición
      return;
    }

    updateFincaYPropietario({
      fincaData: fincaCambio ? {
        nombre_finca: data.nombre_finca,
        superficie_finca: Number(data.superficie_finca),
        descripcion_finca: data.descripcion_finca,
      } : null,
      propietarioData: propietarioCambio ? {
        id_usuario_propietario: newOwnerVal
      } : null
    });
  };

  const cancelEdit = () => {
    if (finca) {
      form.reset({
        nombre_finca: finca.nombre_finca,
        superficie_finca: finca.superficie_finca,
        descripcion_finca: finca.descripcion_finca || '',
        id_usuario_propietario: finca.propietario ? String(finca.propietario.id_usuario) : 'none',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!finca) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Finca no encontrada</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin-croply/fincas')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  // Métricas derivadas del detalle ya cargado
  const cantidadSensores = finca.parcelas.reduce(
    (acc, p) => acc + p.controladores.reduce((a, c) => a + c.sensores.length, 0),
    0
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      
      {/* Header con Breadcrumbs y Título */}
      <div className="flex flex-col mt-2">
        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
          <Link to="/admin-croply/fincas" className="hover:text-foreground transition-colors font-medium">
            Fincas e Infraestructura
          </Link>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
          <span className="text-primary font-semibold">{finca.nombre_finca}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground font-sans tracking-tight mb-2">
              {finca.nombre_finca}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-base">
              <HugeiconsIcon icon={MapsLocation01Icon} className="size-5" strokeWidth={1.5} />
              <span>{finca.departamento}, {finca.provincia}, Argentina</span>
            </div>
          </div>

          {!isEditing && finca.estado === 'Activo' && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2 shrink-0 border-primary text-primary hover:bg-primary/5 px-6 font-semibold"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" strokeWidth={2} />
              Editar Finca
            </Button>
          )}
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-6 w-full max-w-4xl">
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={MapsLocation01Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="Superficie Total"
          value={
            <span className="flex items-baseline gap-1">
              {finca.superficie_finca.toLocaleString('es-AR')}
              <span className="text-base font-normal text-muted-foreground">ha</span>
            </span>
          }
        />
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={DashboardSquare01Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="Número de Parcelas"
          value={
            <span className="flex items-baseline gap-1">
              {finca.cantidad_parcelas}
              <span className="text-base font-normal text-muted-foreground">
                {finca.cantidad_parcelas === 1 ? 'Parcela' : 'Parcelas'}
              </span>
            </span>
          }
        />
        <CardMetrica
          orientation="vertical"
          icon={<HugeiconsIcon icon={Wifi01Icon} className="text-primary size-6" strokeWidth={2} />}
          iconBgColor="bg-primary/10"
          labelTop="Cantidad de Sensores"
          value={cantidadSensores}
        />
      </div>

      {/* Grid de Información y Propietario (misma altura) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Columna principal */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HugeiconsIcon icon={MapsLocation01Icon} className="size-5 text-primary" strokeWidth={1.5} />
                Información general
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre_finca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de finca *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="superficie_finca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Superficie total (ha) *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="descripcion_finca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea className="resize-none" rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campos no editables mostrados como texto */}
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-border">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Provincia</p>
                        <p className="text-sm font-medium">{finca.provincia}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Departamento</p>
                        <p className="text-sm font-medium">{finca.departamento}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Latitud</p>
                        <p className="text-sm font-medium">{finca.latitud}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Longitud</p>
                        <p className="text-sm font-medium">{finca.longitud}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border">
                      <Button type="button" variant="secondary" onClick={cancelEdit} disabled={isPending}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Superficie total</p>
                    <p className="text-sm font-semibold">{finca.superficie_finca.toLocaleString('es-AR')} ha</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Provincia</p>
                    <p className="text-sm font-semibold">{finca.provincia}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Departamento</p>
                    <p className="text-sm font-semibold">{finca.departamento}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Coordenadas</p>
                    <p className="text-sm font-semibold">{finca.latitud}, {finca.longitud}</p>
                  </div>
                  {finca.descripcion_finca && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Descripción</p>
                      <p className="text-sm text-muted-foreground">{finca.descripcion_finca}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral — Propietario */}
        <div className="flex flex-col">
          <Card className="flex-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" strokeWidth={1.5} />
                Administrador de Finca
              </CardTitle>
              <CardDescription>
                {/* TODO: Habilitar asignación de propietario en HU-FP-02 */}
                Propietario asignado a esta finca.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form id="propietario-form" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id_usuario_propietario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seleccionar Propietario</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={loadingAdmins}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingAdmins ? "Cargando..." : "Seleccione un usuario..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Sin asignar</SelectItem>
                              {administradores.map((admin) => (
                                <SelectItem key={admin.id_usuario} value={String(admin.id_usuario)}>
                                  {admin.nombre} {admin.apellido}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <>
                  {finca.propietario ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-xl">
                        <div className="size-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-primary-foreground text-sm font-bold">
                            {finca.propietario.nombre[0]}{finca.propietario.apellido[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {finca.propietario.nombre} {finca.propietario.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{finca.propietario.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          Estado de cuenta
                        </span>
                        {estadoCuentaBadge(finca.propietario.estado)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl bg-muted/10">
                      <HugeiconsIcon icon={UserIcon} className="size-10 text-muted-foreground/40 mb-3" strokeWidth={1} />
                      <p className="text-sm font-medium text-foreground">Sin propietario asignado</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Podés editar la finca para asignar uno.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Parcelas e Infraestructura IoT a ancho completo */}
      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={MapsCircle02Icon} className="size-5 text-primary" strokeWidth={1.5} />
              Parcelas e Infraestructura IoT
            </CardTitle>
            <CardDescription>
              {finca.cantidad_parcelas} parcela{finca.cantidad_parcelas !== 1 ? 's' : ''} registrada{finca.cantidad_parcelas !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {!isAddingParcela && editingParcelaId === null && (
            <Button size="sm" onClick={() => setIsAddingParcela(true)}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
              Agregar parcela
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <>
            {finca.parcelas && finca.parcelas.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {finca.parcelas.map((p) => (
                  <div key={p.id_parcela}>
                    {editingParcelaId === p.id_parcela ? (
                      <div className="border border-primary/20 rounded-xl overflow-hidden shadow-sm bg-muted/10 p-2">
                        <CrearEditarParcelaForm
                          initialData={finca.parcelas.find(x => x.id_parcela === editingParcelaId)}
                          fincaUbicacion={`${finca.provincia}, ${finca.departamento} (${finca.latitud}, ${finca.longitud})`}
                          onSave={(data, setError) => updateParcela({ id_parcela: editingParcelaId, data }, { onError: (error) => {
                            handleFormError(error, setError);
                          }})}
                          onCancel={() => setEditingParcelaId(null)}
                          isPending={isUpdatingParcela}
                        />
                      </div>
                    ) : (
                      <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                        {/* Cabecera parcela */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-muted/40 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-foreground">{p.nombre_parcela}</span>
                            <Badge variant={p.estado_parcela === 'Activa' ? 'success' : 'neutral'} className="text-xs px-2.5">
                              {p.estado_parcela}
                            </Badge>
                            {p.superficie_parcela && (
                              <span className="text-xs text-muted-foreground ml-2">{p.superficie_parcela} ha</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground mr-2">
                              {p.controladores.length} controlador{p.controladores.length !== 1 ? 'es' : ''}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingParcelaId(p.id_parcela); setIsAddingParcela(false); }}>
                              <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setParcelaToDelete(p.id_parcela)}>
                              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Controladores y sensores */}
                        {p.controladores.map((c) => (
                          <div key={c.id_controlador_sensores} className="px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{c.nombre_controlador}</span>
                                <span className="text-xs text-muted-foreground font-medium">· {c.ip_controlador}</span>
                              </div>
                              {estadoControladorBadge(c.estado_controlador)}
                            </div>
                            {c.sensores.length > 0 ? (
                              <div className="overflow-x-auto border border-border/50 rounded-lg">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-muted/20">
                                    <tr className="text-muted-foreground border-b border-border/50">
                                      <th className="py-2.5 px-4 font-semibold">Tipo de sensor</th>
                                      <th className="py-2.5 px-4 font-semibold">Estado señal</th>
                                      <th className="py-2.5 px-4 font-semibold">Último valor</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.sensores.map((s) => (
                                      <tr key={s.id_sensor} className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors">
                                        <td className="py-2.5 px-4 font-medium text-foreground">{s.nombre_tipo_sensor}</td>
                                        <td className="py-2.5 px-4">{estadoSenalBadge(s.estado_senal)}</td>
                                        <td className="py-2.5 px-4 text-muted-foreground font-medium">
                                          {s.ultimo_valor != null ? s.ultimo_valor : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic border border-dashed border-border/50 rounded-lg p-3 text-center">
                                Sin sensores asignados.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !isAddingParcela && (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl bg-muted/10">
                  <HugeiconsIcon icon={MapsCircle02Icon} className="size-10 text-muted-foreground/40 mb-3" strokeWidth={1} />
                  <p className="text-sm font-medium text-foreground">Sin parcelas registradas</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Comenzá creando la primera parcela de esta finca.
                  </p>
                  <Button size="sm" onClick={() => setIsAddingParcela(true)}>
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                    Agregar parcela
                  </Button>
                </div>
              )
            )}

            {isAddingParcela && (
              <div className="mt-6 border border-primary/20 rounded-xl overflow-hidden shadow-sm bg-muted/10 p-2">
                <CrearEditarParcelaForm
                  fincaUbicacion={`${finca.provincia}, ${finca.departamento} (${finca.latitud}, ${finca.longitud})`}
                  onSave={(data, setError) => createParcela(data, { onError: (error) => {
                    handleFormError(error, setError);
                  }})}
                  onCancel={() => setIsAddingParcela(false)}
                  isPending={isCreatingParcela}
                />
              </div>
            )}
          </>
        </CardContent>
      </Card>
      <AlertDialog open={!!parcelaToDelete} onOpenChange={(open) => !open && setParcelaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja esta parcela?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseás dar de baja esta parcela? Las tareas pendientes serán canceladas, el cultivo activo será inactivado y los registros de agroquímicos se conservarán como histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParcela}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingParcela}
              onClick={(e) => {
                e.preventDefault();
                if (parcelaToDelete) {
                  deleteParcela(parcelaToDelete, {
                    onSuccess: () => {
                      setParcelaToDelete(null);
                    },
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingParcela ? 'Procesando...' : 'Confirmar baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
