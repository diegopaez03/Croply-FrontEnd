import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  PreguntaFrecuente,
  preguntaFrecuenteSchema,
  PreguntaFrecuenteFormValues,
} from '@/types/soporte.types';

interface EditarPreguntaFrecuenteModalProps {
  faq: PreguntaFrecuente | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: PreguntaFrecuenteFormValues) => void;
  formSetError?: (setError: any) => void;
}

export function EditarPreguntaFrecuenteModal({
  faq,
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
  formSetError,
}: EditarPreguntaFrecuenteModalProps) {
  const form = useForm<PreguntaFrecuenteFormValues>({
    resolver: zodResolver(preguntaFrecuenteSchema),
    defaultValues: {
      pregunta: '',
      respuesta: '',
    },
  });

  useEffect(() => {
    if (faq && isOpen) {
      form.reset({
        pregunta: faq.pregunta,
        respuesta: faq.respuesta,
      });
    }
  }, [faq, isOpen, form]);

  useEffect(() => {
    if (formSetError) {
      formSetError(form.setError);
    }
  }, [formSetError, form.setError]);

  const handleClose = () => {
    if (isLoading) return;
    form.reset();
    onClose();
  };

  const handleFormSubmit = (values: PreguntaFrecuenteFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-lg bg-card border-border"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Editar Pregunta Frecuente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Modificá los campos necesarios para actualizar esta pregunta frecuente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="pregunta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Pregunta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="¿Cómo registro una nueva parcela?"
                      disabled={isLoading}
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respuesta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Respuesta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe los pasos detallados para que el usuario pueda completar la acción..."
                      rows={5}
                      disabled={isLoading}
                      maxLength={2000}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
