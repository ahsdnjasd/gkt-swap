// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/LoadingSkeleton.tsx
'use client';

import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border p-6 rounded-[2.5rem] animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-32 bg-border rounded-lg" />
        <div className="h-8 w-8 bg-border rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="h-24 w-full bg-border rounded-3xl" />
        <div className="h-24 w-full bg-border rounded-3xl" />
      </div>
      <div className="h-14 w-full bg-border rounded-2xl mt-8" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-8 py-6"><div className="h-4 w-24 bg-border rounded" /></td>
      <td className="px-8 py-6"><div className="h-4 w-40 bg-border rounded" /></td>
      <td className="px-8 py-6"><div className="h-4 w-16 bg-border rounded" /></td>
      <td className="px-8 py-6"><div className="h-4 w-20 bg-border rounded" /></td>
      <td className="px-8 py-6 text-right"><div className="h-8 w-8 bg-border rounded-lg ml-auto" /></td>
    </tr>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-card border-2 border-border p-8 rounded-[2.5rem] animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-3 w-32 bg-border rounded" />
        <div className="h-10 w-10 bg-border rounded-2xl" />
      </div>
      <div className="h-8 w-40 bg-border rounded-lg mb-4" />
      <div className="h-1 w-full bg-border rounded-full" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
