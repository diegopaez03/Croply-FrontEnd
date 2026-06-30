import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — class name utility for Shadcn/ui components.
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (intelligent deduplication of conflicting Tailwind classes).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary', 'px-6')
 *   // → 'py-2 bg-primary px-6'  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
