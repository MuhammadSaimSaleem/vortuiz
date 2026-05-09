import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toTitleCase = (str: string | undefined | null) => {
  if (!str?.trim()) return "N/A";
  return str.trim().toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};