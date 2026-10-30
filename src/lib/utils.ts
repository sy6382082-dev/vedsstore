import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UTMParams } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
}

export function saveUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return;
  if (Object.values(params).some(Boolean)) {
    sessionStorage.setItem('brother_utm', JSON.stringify(params));
  }
}

export function getSavedUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem('brother_utm') || '{}');
  } catch {
    return {};
  }
}

