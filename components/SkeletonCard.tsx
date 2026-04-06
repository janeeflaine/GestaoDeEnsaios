import React from 'react';

function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

export function LargeEventCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
      <Shimmer className="h-5 w-1/3" />
      <Shimmer className="h-8 w-2/3" />
      <Shimmer className="h-4 w-1/2" />
      <Shimmer className="h-10 w-full" />
    </div>
  );
}

export function SmallEventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-3">
      <Shimmer className="w-12 h-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-2">
      <Shimmer className="h-3 w-1/2 mx-auto" />
      <Shimmer className="h-8 w-1/3 mx-auto" />
      <Shimmer className="h-3 w-2/3 mx-auto" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
      <Shimmer className="w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-3 w-1/3" />
      </div>
    </div>
  );
}
