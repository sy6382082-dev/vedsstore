import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton rounded bg-[#f5f5f5]', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <div className="flex items-baseline gap-2 mt-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-9 w-full rounded mt-2" />
    </div>
  );
}
