// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/PoolStats.tsx
'use client';

import React from 'react';
import { Pool } from '@/types';
import { formatToken, formatXLM } from '@/lib/utils';
import { TrendingUp, BarChart3, Coins } from 'lucide-react';
import { SkeletonStat } from './LoadingSkeleton';

interface PoolStatsProps {
  pool: Pool | null;
  price: number;
  loading: boolean;
}

export default function PoolStats({ pool, price, loading }: PoolStatsProps) {
  if (loading || !pool) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Value Locked',
      value: formatXLM(pool.tvlXLM),
      icon: <Coins className="text-cyan" size={20} />,
      gradient: 'from-cyan/20 to-transparent',
      borderColor: 'border-cyan/30',
    },
    {
      label: '24h Volume',
      value: formatXLM(pool.volume24h),
      icon: <BarChart3 className="text-violet" size={20} />,
      gradient: 'from-violet/20 to-transparent',
      borderColor: 'border-violet/30',
    },
    {
      label: '$LQID Price',
      value: `${formatToken(price, 4)} XLM`,
      icon: <TrendingUp className="text-success" size={20} />,
      gradient: 'from-success/20 to-transparent',
      borderColor: 'border-success/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden bg-card border-2 ${stat.borderColor} p-8 rounded-[2.5rem] shadow-xl transition-all hover:scale-[1.02] duration-300 group`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-muted text-[10px] uppercase font-bold tracking-[0.2em]">
                {stat.label}
              </span>
              <div className="bg-background/80 p-2.5 rounded-2xl border border-border">
                {stat.icon}
              </div>
            </div>
            <p className="text-white font-mono text-3xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-2">
              {stat.value}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.gradient.replace('to-transparent', 'to-white/20')} w-[60%]`} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
