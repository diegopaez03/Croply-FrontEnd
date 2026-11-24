import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { usePreguntasFrecuentesConsulta, useConfiguracionSoporte } from '@/hooks/useSoporte';

export default function SoporteAdminFincaPage() {
  const { data, isLoading, isError, isFetching, refetch } = usePreguntasFrecuentesConsulta();
  const { data: config } = useConfiguracionSoporte();
  const preguntas = data?.preguntas_frecuentes ?? [];

  return (
    <div className="w-full max-w-screen-xl mx-auto space-y-6 pb-20">
      {/* Cabecera de Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Ayuda y Soporte</h1>
        <p className="text-muted-foreground mt-2">
          Encontrá respuestas rápidas a las consultas más comunes sobre el uso de la plataforma.
        </p>
      </div>

      {/* Secciones Apiladas */}
      <div className="flex flex-col gap-8">
        {/* Sección: Preguntas Frecuentes */}
        <section className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Preguntas Frecuentes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hacé clic en una pregunta para expandir su respuesta.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
              Cargando preguntas frecuentes...
            </div>
          ) : isError ? (
            <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm font-medium text-destructive">
                No se pudieron cargar las preguntas frecuentes. Por favor, reintentá en unos instantes.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-2"
              >
                {isFetching ? 'Reintentando...' : 'Reintentar'}
              </Button>
            </div>
          ) : preguntas.length === 0 ? (
            <div className="border border-border rounded-xl p-12 text-center text-muted-foreground">
              <p className="text-sm">Por el momento no hay preguntas frecuentes disponibles.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {preguntas.map((faq) => (
                <AccordionItem
                  key={faq.id_pregunta_frecuente}
                  value={String(faq.id_pregunta_frecuente)}
                  className="border-b border-border last:border-b-0"
                >
                  <AccordionTrigger className="text-left font-normal text-foreground text-base hover:text-primary data-[state=open]:text-primary data-[state=open]:font-semibold transition-colors py-4 break-words hover:no-underline">
                    <span className="pr-4 break-words">{faq.pregunta}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line break-words pb-4">
                    {faq.respuesta}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>

        {/* Sección: Manual de Usuario (HU-AS-03) */}
        {config?.manual_usuario_url && (
          <section className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Manual de Usuario</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Consultá la documentación detallada y las guías paso a paso para aprovechar al máximo las herramientas del sistema.
                </p>
              </div>
              <Button asChild className="shrink-0 font-medium px-5">
                <a
                  href={config.manual_usuario_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <span>Ver manual</span>
                  <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </section>
        )}

        {/* Sección: Contacto (HU-AS-04) */}
        {config?.email_soporte && (
          <section className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Contacto</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  ¿Tenés alguna consulta puntual o necesitás asistencia técnica? Escribinos a nuestro canal oficial de soporte:
                </p>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-accent/60 border border-border/60 shrink-0 max-w-full">
                <HugeiconsIcon icon={Mail01Icon} className="size-5 text-primary shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${config.email_soporte}`}
                  className="text-primary font-semibold text-sm hover:underline break-all"
                  title="Enviar correo a soporte"
                >
                  {config.email_soporte}
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
