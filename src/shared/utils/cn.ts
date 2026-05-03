import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind-aware className merger. Use everywhere instead of string
 * concatenation so conditional classes don't accidentally fight each other
 * (e.g. `p-2` vs `p-4` from a parent override).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
