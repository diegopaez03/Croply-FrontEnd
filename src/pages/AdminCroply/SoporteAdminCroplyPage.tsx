import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileEditIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
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
import {
  preguntaFrecuenteSchema,
  PreguntaFrecuenteFormValues,
  PreguntaFrecuente,
} from '@/types/soporte.types';
import { usePreguntasFrecuentesGestion, useSoporteMutations } from '@/hooks/useSoporte';
import { PreguntaFrecuenteCard } from './components/PreguntaFrecuenteCard';
import { EditarPreguntaFrecuenteModal } from './components/EditarPreguntaFrecuenteModal';
import { EliminarPreguntaFrecuenteModal } from './components/EliminarPreguntaFrecuenteModal';
import { PaginacionCards } from './components/PaginacionCards';

const PAGE_SIZE = 10;

export default function SoporteAdminCroplyPage() {
  const [page, setPage] = useState(1);
  const [editingFaq, setEditingFaq] = useState<PreguntaFrecuente | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<PreguntaFrecuente | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [modalSetError, setModalSetError] = useState<any>(null);

  const { data, isLoading } = usePreguntasFrecuentesGestion({
    page,
    pageSize: PAGE_SIZE,
  });

  const createForm = useForm<PreguntaFrecuenteFormValues>({
    resolver: zodResolver(preguntaFrecuenteSchema),
    defaultValues: {
      pregunta: '',
      respuesta: '',
    },
  });

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingFaq(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingFaq(null);
  };

  const { createMutation, updateMutation, deleteMutation } = useSoporteMutations({
    onCreateSuccess: () => {
      createForm.reset({ pregunta: '', respuesta: '' });
      setPage(1);
    },
    onUpdateSuccess: () => {
      handleCloseEditModal();
    },
    onDeleteSuccess: () => {
      const preguntasActuales = data?.preguntas_frecuentes ?? [];
      if (preguntasActuales.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      }
      handleCloseDeleteModal();
    },
    onNotFound: () => {
      handleCloseEditModal();
      handleCloseDeleteModal();
    },
    createSetError: createForm.setError,
    updateSetError: modalSetError,
  });

  const handleCreateSubmit = (values: PreguntaFrecuenteFormValues) => {
    createMutation.mutate(values);
  };

  const handleDiscard = () => {
    createForm.reset({ pregunta: '', respuesta: '' });
  };

  const handleOpenEdit = (faq: PreguntaFrecuente) => {
    setEditingFaq(faq);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (values: PreguntaFrecuenteFormValues) => {
    if (!editingFaq) return;
    updateMutation.mutate({
      id: editingFaq.id_pregunta_frecuente,
      data: values,
    });
  };

  const handleOpenDelete = (faq: PreguntaFrecuente) => {
    setDeletingFaq(faq);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFaq) return;
    deleteMutation.mutate(deletingFaq.id_pregunta_frecuente);
  };

  const preguntas = data?.preguntas_frecuentes ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      {/* Cabecera */}
      <div className="flex flex-col gap-1 mt-2">
        <h1 className="text-4xl leading-10 font-bold text-foreground font-sans">
          Centro de Ayuda
        </h1>
        <p className="text-base leading-6 text-muted-foreground font-sans">
          Gestiona las preguntas frecuentes y brinda soporte eficiente a los agricultores.
        </p>
      </div>

      {/* Formulario Redactar Nueva FAQ */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-6 text-primary">
          <div className="size-8 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={FileEditIcon} className="size-5" />
          </div>
          <h2 className="text-lg font-bold text-primary">Redactar Nueva FAQ</h2>
        </div>

        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
            <FormField
              control={createForm.control}
              name="pregunta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Pregunta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="¿Cómo registro una nueva parcela?"
                      disabled={createMutation.isPending}
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="respuesta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Respuesta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe los pasos detallados para que el usuario pueda completar la acción..."
                      rows={5}
                      disabled={createMutation.isPending}
                      maxLength={2000}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="font-medium px-6"
              >
                {createMutation.isPending ? 'Publicando...' : 'Publicar Pregunta'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDiscard}
                disabled={createMutation.isPending}
                className="font-medium px-6"
              >
                Descartar
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Listado de Preguntas Frecuentes */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Cargando preguntas frecuentes...
        </div>
      ) : preguntas.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-sm">
            Aún no hay preguntas frecuentes cargadas. Usá el formulario para crear la primera.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {preguntas.map((faq) => (
              <PreguntaFrecuenteCard
                key={faq.id_pregunta_frecuente}
                faq={faq}
                onEditar={handleOpenEdit}
                onEliminar={handleOpenDelete}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-2">
              <PaginacionCards
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                itemLabel="preguntas frecuentes"
                isLoading={isLoading}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      <EditarPreguntaFrecuenteModal
        faq={editingFaq}
        isOpen={isEditModalOpen}
        isLoading={updateMutation.isPending}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateSubmit}
        formSetError={(setError) => setModalSetError(() => setError)}
      />

      {/* Modal de Eliminación */}
      <EliminarPreguntaFrecuenteModal
        isOpen={isDeleteModalOpen}
        isLoading={deleteMutation.isPending}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
