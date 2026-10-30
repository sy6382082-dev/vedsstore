import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton rounded-lg bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-sm">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <div className="flex items-baseline gap-2 mt-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl mt-2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[480px] rounded-3xl skeleton p-8 flex flex-col justify-center items-start gap-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-12 w-3/4 max-w-xl" />
      <Skeleton className="h-6 w-1/2 max-w-md" />
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-12 w-36 rounded-xl" />
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
}
