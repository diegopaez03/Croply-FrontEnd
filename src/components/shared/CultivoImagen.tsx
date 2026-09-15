import { useState } from 'react';
import { cn } from '@/utils/index';

interface CultivoImagenProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export function CultivoImagen({ src, fallbackSrc, alt, className }: CultivoImagenProps) {
  const [rota, setRota] = useState(false);
  const actual = rota ? fallbackSrc : src;

  return (
    <img
      src={actual}
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => {
        if (!rota && actual !== fallbackSrc) {
          setRota(true);
        }
      }}
    />
  );
}
