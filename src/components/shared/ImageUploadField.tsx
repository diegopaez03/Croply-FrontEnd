import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { uploadsService } from '@/services/uploads.service';
import { handleFormError } from '@/utils/errorHandler';
import { cn } from '@/utils/index';

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);

  const preview = previewLocal ?? value ?? null;
  const isDisabled = disabled || isUploading;

  const abrirSelector = () => {
    if (isDisabled) return;
    inputRef.current?.click();
  };

  const limpiarPreviewLocal = (url?: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
    setPreviewLocal(null);
  };

  const procesarArchivo = async (archivo: File) => {
    if (!MIME_PERMITIDOS.includes(archivo.type)) {
      toast.error('La imagen debe ser JPEG, PNG o WebP.');
      return;
    }
    if (archivo.size > MAX_BYTES) {
      toast.error('La imagen no puede superar los 5 MB.');
      return;
    }

    const localUrl = URL.createObjectURL(archivo);
    setPreviewLocal(localUrl);
    setIsUploading(true);

    try {
      const result = await uploadsService.subirImagen(archivo);
      onChange(result.url);
      limpiarPreviewLocal(localUrl);
    } catch (error) {
      handleFormError(error);
      limpiarPreviewLocal(localUrl);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (archivo) {
      void procesarArchivo(archivo);
    }
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    const archivo = event.dataTransfer.files?.[0];
    if (archivo) {
      void procesarArchivo(archivo);
    }
  };

  const quitar = () => {
    if (isDisabled) return;
    limpiarPreviewLocal(previewLocal);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={MIME_PERMITIDOS.join(',')}
        className="hidden"
        disabled={isDisabled}
        onChange={onFileChange}
      />

      {preview ? (
        <div className="relative w-full max-w-[220px] overflow-hidden rounded-xl border border-border bg-muted/40">
          <img
            src={preview}
            alt="Vista previa de la imagen"
            className={cn('h-40 w-full object-cover', isUploading && 'opacity-60')}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={quitar}
              disabled={isDisabled}
              className="absolute right-2 top-2 rounded-md bg-background/90 p-1.5 text-muted-foreground shadow-sm hover:bg-background hover:text-foreground"
              title="Quitar imagen"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={abrirSelector}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          disabled={isDisabled}
          className={cn(
            'flex h-32 w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background px-4 text-sm text-muted-foreground transition-colors',
            'hover:border-primary/50 hover:bg-muted/40 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span>{isUploading ? 'Subiendo...' : 'Subir imagen'}</span>
          <span className="text-xs">JPEG, PNG o WebP · máx. 5 MB</span>
        </button>
      )}
    </div>
  );
}
