
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`skeleton rounded-2xl ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-40 rounded-3xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
      <Skeleton className="lg:col-span-2 h-[500px] rounded-[32px]" />
      <div className="space-y-6">
        <Skeleton className="h-60 rounded-[32px]" />
        <Skeleton className="h-60 rounded-[32px]" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);
