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

// Types for extrema detection
export type DataPoint = {
  date: string;
  value: number;
  [key: string]: string | number | null;
}

export type ExtremaPoint = {
  date: string;
  value: number;
  isPeak: boolean;
  changePercent: number;
  index: number;
}

/**
 * Detect local maxima and minima in time series data.
 * Uses a window-based approach to find significant turning points.
 *
 * @param data Array of data points with date and value
 * @param valueKey Key to use for the value (default: 'value')
 * @param windowSize Number of points on each side to compare (default: 3)
 * @param minChangePercent Minimum percentage change to be considered significant (default: 1%)
 * @returns Array of extrema points (peaks and troughs)
 */
export function findExtrema(
  data: DataPoint[],
  valueKey: string = 'value',
  windowSize: number = 3,
  minChangePercent: number = 1
): ExtremaPoint[] {
  if (data.length < windowSize * 2 + 1) {
    return [];
  }

  const extrema: ExtremaPoint[] = [];

  for (let i = windowSize; i < data.length - windowSize; i++) {
    const currentValue = data[i][valueKey] as number;
    if (currentValue === null || currentValue === undefined) continue;

    let isPeak = true;
    let isTrough = true;

    // Compare with surrounding points
    for (let j = 1; j <= windowSize; j++) {
      const leftValue = data[i - j][valueKey] as number;
      const rightValue = data[i + j][valueKey] as number;

      if (leftValue === null || rightValue === null) {
        isPeak = false;
        isTrough = false;
        break;
      }

      if (currentValue <= leftValue || currentValue <= rightValue) {
        isPeak = false;
      }
      if (currentValue >= leftValue || currentValue >= rightValue) {
        isTrough = false;
      }
    }

    if (isPeak || isTrough) {
      // Calculate percentage change from previous point
      const prevValue = data[i - 1][valueKey] as number;
      const changePercent = prevValue ? ((currentValue - prevValue) / prevValue) * 100 : 0;

      // Only include if change is significant enough
      if (Math.abs(changePercent) >= minChangePercent) {
        extrema.push({
          date: data[i].date,
          value: currentValue,
          isPeak,
          changePercent,
          index: i,
        });
      }
    }
  }

  return extrema;
}

/**
 * Fetch market insight for a specific extrema point
 */
export async function fetchMarketInsight(
  date: string,
  asset: string,
  changePercent: number,
  isPeak: boolean
): Promise<{ status: string; insight: string; error?: string }> {
  const params = new URLSearchParams({
    date,
    asset,
    change_percent: changePercent.toString(),
    is_peak: isPeak.toString(),
  });

  return apiFetch(`/api/market-insight/?${params}`);
}
