import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path: string, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API Error: ${response.status} ${message}`);
  }

  return response.json();
}
