import { useState, useEffect } from 'react';

/**
 * Hook para retrasar la actualización de un valor (como el texto de búsqueda)
 * y evitar múltiples renders o llamadas a la API mientras el usuario escribe.
 * 
 * @param value El valor a debounsear
 * @param delay El retraso en milisegundos (por defecto 500ms)
 * @returns El valor debounseado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configuramos un timer para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiamos el timer si el valor cambia o el componente se desmonta
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
