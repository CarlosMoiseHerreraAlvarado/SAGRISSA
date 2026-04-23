import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200/80';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between">
        <Skeleton variant="text" width={100} height={12} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="100%" height={14} />
      </div>
      <Skeleton variant="rectangular" width="100%" height={36} />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
      <Skeleton variant="rectangular" width={80} height={80} />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <Skeleton variant="text" width="75%" height={14} />
        <Skeleton variant="text" width="50%" height={12} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
  );
}
