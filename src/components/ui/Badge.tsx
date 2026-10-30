import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'coral' | 'emerald' | 'blue' | 'demo';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    gold: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    coral: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    demo: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-mono text-[10px] tracking-wide',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
