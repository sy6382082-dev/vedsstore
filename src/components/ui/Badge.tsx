import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'coral' | 'emerald' | 'blue' | 'demo' | 'dark';
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
    default: 'bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]',
    gold: 'bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]',
    coral: 'bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]',
    emerald: 'bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]',
    blue: 'bg-[#f5f5f5] text-[#171717] border-[#e5e5e5]',
    dark: 'bg-[#171717] text-white border-[#171717]',
    demo: 'bg-white text-[#737373] border-[#e5e5e5] font-mono text-[10px] tracking-wider uppercase',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border transition-colors',
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
