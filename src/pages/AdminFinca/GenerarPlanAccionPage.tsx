import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowLeft01Icon, Plant01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useCultivoBase } from '@/hooks/useCultivosBase';
import { usePlantillaBase } from '@/hooks/usePlantillasBase';
import { useParcelasPorFinca } from '@/hooks/useParcelas';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';
import { idPlantillaParaVariedad } from '@/utils/resolver-plantilla';
import { eventosDesdeHitos } from '@/utils/plan-calendario';
import { HitosPlanGrid } from './components/HitosPlanGrid';
import { CalendarioPlanMensual } from './components/CalendarioPlanMensual';

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

interface FilaSiembra {
  id: string;
  id_variedad: number | '';
  id_finca: number | '';
  id_parcela: number | '';
  superficie_ha: string;
}

export default function GenerarPlanAccionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const idCultivo = Number(id);
  const variedadInicial = Number(searchParams.get('variedad'));

  const { data: detalle, isLoading, error } = useCultivoBase(
    Number.isFinite(idCultivo) ? idCultivo : null,
  );

  const fincas = usuario?.fincas ?? [];
  const [filas, setFilas] = useState<FilaSiembra[]>([]);
  const [fechaSiembra, setFechaSiembra] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [mesVisible, setMesVisible] = useState(() => new Date());
  const [tareasActivas, setTareasActivas] = useState<Set<number>>(new Set());
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const filaPrincipal = filas[0];
  const idVariedadActiva = typeof filaPrincipal?.id_variedad === 'number' ? filaPrincipal.id_variedad : null;
  const idFincaActiva = typeof filaPrincipal?.id_finca === 'number' ? filaPrincipal.id_finca : null;
  const idParcelaActiva = typeof filaPrincipal?.id_parcela === 'number' ? filaPrincipal.id_parcela : null;

  const { data: parcelas = [] } = useParcelasPorFinca(idFincaActiva);
  const idPlantilla = detalle ? idPlantillaParaVariedad(detalle, idVariedadActiva) : null;
  const { data: plantilla } = usePlantillaBase(idPlantilla);

  useEffect(() => {
    if (error) {
      handleFormError(error, undefined, {
        onNotFoundRedirect: () => navigate('/admin-finca/biblioteca'),
      });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!detalle || filas.length > 0) return;
    const variedad =
      detalle.variedades.find((v) => v.id_variedad === variedadInicial)?.id_variedad
      ?? detalle.variedades[0]?.id_variedad
      ?? '';
    setFilas([
      {
        id: 'fila-1',
        id_variedad: variedad,
        id_finca: fincas[0]?.id_finca ?? '',
        id_parcela: '',
        superficie_ha: '2.5',
      },
    ]);
  }, [detalle, fincas, filas.length, variedadInicial]);

  useEffect(() => {
    if (!plantilla) return;
    const ids = new Set<number>();
    plantilla.hitos.forEach((hito) => {
      hito.tareas.forEach((tarea) => ids.add(tarea.id_tarea_plantilla));
    });
    setTareasActivas(ids);
  }, [plantilla]);

  useEffect(() => {
    if (!filaPrincipal || filaPrincipal.id_parcela !== '' || parcelas.length === 0) return;
    actualizarFila(filaPrincipal.id, { id_parcela: parcelas[0].id_parcela });
  }, [filaPrincipal, parcelas]);

  useEffect(() => {
    if (fechaSiembra) {
      setMesVisible(new Date(`${fechaSiembra}T00:00:00`));
    }
  }, [fechaSiembra]);

  const eventos = useMemo(() => {
    if (!plantilla || !fechaSiembra) return [];
    const hitosFiltrados = plantilla.hitos.map((hito) => ({
      ...hito,
      tareas: hito.tareas.filter((tarea) => tareasActivas.has(tarea.id_tarea_plantilla)),
    }));
    return eventosDesdeHitos(hitosFiltrados, new Date(`${fechaSiembra}T00:00:00`));
  }, [plantilla, fechaSiembra, tareasActivas]);

  const parcelaSeleccionada = parcelas.find((p) => p.id_parcela === idParcelaActiva);
  const fincaSeleccionada = fincas.find((f) => f.id_finca === idFincaActiva);
  const variedadSeleccionada = detalle?.variedades.find((v) => v.id_variedad === idVariedadActiva);

  const actualizarFila = (idFila: string, cambios: Partial<FilaSiembra>) => {
    setFilas((prev) => prev.map((fila) => (fila.id === idFila ? { ...fila, ...cambios } : fila)));
  };

  const agregarFila = () => {
    setFilas((prev) => [
      ...prev,
      {
        id: `fila-${prev.length + 1}-${Date.now()}`,
        id_variedad: detalle?.variedades[0]?.id_variedad ?? '',
        id_finca: fincas[0]?.id_finca ?? '',
        id_parcela: '',
        superficie_ha: '',
      },
    ]);
  };

  const toggleTarea = (id_tarea_plantilla: number) => {
    setTareasActivas((prev) => {
      const next = new Set(prev);
      if (next.has(id_tarea_plantilla)) next.delete(id_tarea_plantilla);
      else next.add(id_tarea_plantilla);
      return next;
    });
  };

  const asociar = () => {
    setErrorForm(null);
    if (!detalle) return;
    if (!filaPrincipal || filaPrincipal.id_finca === '' || filaPrincipal.id_parcela === '') {
      setErrorForm('Completá finca y parcela para asociar el plan.');
      return;
    }
    if (detalle.variedades.length > 0 && filaPrincipal.id_variedad === '') {
      setErrorForm('Seleccioná una variedad.');
      return;
    }
    const superficie = Number(filaPrincipal.superficie_ha);
    if (!Number.isFinite(superficie) || superficie <= 0) {
      setErrorForm('La superficie a asignar debe ser mayor a 0.');
      return;
    }
    if (parcelaSeleccionada && superficie > parcelaSeleccionada.superficie_disponible_ha) {
      setErrorForm('La superficie supera la disponible en la parcela.');
      return;
    }
    if (!idPlantilla) {
      setErrorForm('Este cultivo no tiene un plan de acción predefinido disponible.');
      return;
    }
    // TODO: Reemplazar por POST de PlanAccion (HU-BC-06) cuando existan las épicas 3 y 5.
    showSuccessToast({ message: 'Cultivo y plan de acción asociados a la parcela.' });
    navigate('/admin-finca/biblioteca');
  };

  if (isLoading || !detalle) {
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Cargando...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto pb-8">
      <Link
        to={`/admin-finca/biblioteca/${detalle.id_cultivo_base}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Volver
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        Generar Plan de Acción: {detalle.nombre_cultivo_base}
      </h1>

      <section className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Configuración de Siembra</h2>
        <div className="flex flex-col gap-6">
          {filas.map((fila) => (
            <div key={fila.id} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Variedad</Label>
                <select
                  className={SELECT_CLASS}
                  value={fila.id_variedad}
                  onChange={(e) =>
                    actualizarFila(fila.id, {
                      id_variedad: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                >
                  <option value="">Seleccioná una variedad</option>
                  {detalle.variedades.map((variedad) => (
                    <option key={variedad.id_variedad} value={variedad.id_variedad}>
                      {variedad.nombre_variedad}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Finca</Label>
                <select
                  className={SELECT_CLASS}
                  value={fila.id_finca}
                  onChange={(e) =>
                    actualizarFila(fila.id, {
                      id_finca: e.target.value ? Number(e.target.value) : '',
                      id_parcela: '',
                    })
                  }
                >
                  <option value="">Seleccioná una finca</option>
                  {fincas.map((finca) => (
                    <option key={finca.id_finca} value={finca.id_finca}>
                      {finca.nombre_finca}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Parcela</Label>
                <select
                  className={SELECT_CLASS}
                  value={fila.id_parcela}
                  onChange={(e) =>
                    actualizarFila(fila.id, {
                      id_parcela: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                >
                  <option value="">Seleccioná una parcela</option>
                  {parcelas.map((parcela) => (
                    <option key={parcela.id_parcela} value={parcela.id_parcela}>
                      {parcela.nombre_parcela}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Superficie a asignar (Ha)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={fila.superficie_ha}
                  onChange={(e) => actualizarFila(fila.id, { superficie_ha: e.target.value })}
                />
                {parcelaSeleccionada && fila.id === filaPrincipal?.id && (
                  <p className="text-xs font-medium text-[#1A7B48]">
                    Disponible: {parcelaSeleccionada.superficie_disponible_ha.toFixed(2)} Ha
                  </p>
                )}
              </div>
            </div>
          ))}
          <div>
            <Button type="button" variant="outline" onClick={agregarFila}>
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              Agregar otra variedad
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Hitos del Cultivo</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Este es el cronograma base sugerido. Podés personalizar las tareas antes de asociarlo a la parcela.
        </p>
        {idPlantilla == null ? (
          <p className="text-sm text-muted-foreground">
            Este cultivo no tiene un plan de acción predefinido disponible.
          </p>
        ) : plantilla ? (
          <HitosPlanGrid
            hitos={plantilla.hitos}
            tareasActivas={tareasActivas}
            onToggleTarea={toggleTarea}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Cargando hitos...</p>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Fecha de Siembra</h2>
          <Input
            type="date"
            value={fechaSiembra}
            onChange={(e) => setFechaSiembra(e.target.value)}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground mt-3">
            Las tareas posteriores se recalculan a partir de esta fecha de inicio.
          </p>
        </div>
        <div className="bg-[#FAF8F5] border border-border/60 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Ubicación del Cultivo</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Finca</dt>
              <dd className="font-medium">{fincaSeleccionada?.nombre_finca ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Parcela</dt>
              <dd className="font-medium">{parcelaSeleccionada?.nombre_parcela ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Área</dt>
              <dd className="font-medium">
                {filaPrincipal?.superficie_ha ? `${filaPrincipal.superficie_ha} Hectáreas` : '—'}
              </dd>
            </div>
            {variedadSeleccionada && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Variedad</dt>
                <dd className="font-medium">{variedadSeleccionada.nombre_variedad}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vista Mensual del Plan</h2>
        <CalendarioPlanMensual
          mesVisible={mesVisible}
          onCambiarMes={setMesVisible}
          eventos={eventos}
        />
      </section>

      {errorForm && <p className="text-sm text-destructive mb-4">{errorForm}</p>}

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button type="button" onClick={asociar}>
          <HugeiconsIcon icon={Plant01Icon} className="size-4" />
          Asociar cultivo y Plan de acción a parcela
        </Button>
      </div>
    </div>
  );
}
