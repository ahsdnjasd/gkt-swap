// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/LPPositionCard.tsx
'use client';

import React from 'react';
import { Pool, LPPosition } from '@/types';
import { getPositionValue } from '@/lib/priceEngine';
import { formatToken, formatPercent } from '@/lib/utils';
import { Wallet2, PieChart, Layers } from 'lucide-react';

interface LPPositionCardProps {
  position: LPPosition;
  poolStats: Pool;
}

export default function LPPositionCard({ position, poolStats }: LPPositionCardProps) {
  if (!position || position.lpShares === 0) return null;

  const poolPercentage = (position.lpShares / poolStats.totalLPShares) * 100;
  const { xlm, lqid } = getPositionValue(
    position.lpShares,
    poolStats.totalLPShares,
    poolStats.xlmReserve,
    poolStats.lqidReserve
  );

  return (
    <div className="glass-strong border border-primary/20 rounded-[2.5rem] p-8 glow-green">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <Layers size={24} />
        </div>
        <h3 className="text-foreground font-display font-black text-xl uppercase tracking-tighter">Your Position</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shares Owned */}
        <div className="bg-green-50/40 border border-green-100 p-5 rounded-3xl group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={14} className="text-muted" />
            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">LP Shares</span>
          </div>
          <p className="text-foreground font-mono text-xl font-bold">{formatToken(position.lpShares, 4)}</p>
          <p className="text-primary text-xs font-mono mt-1">{formatPercent(poolPercentage)} of pool</p>
        </div>

        {/* XLM Value */}
        <div className="bg-green-50/40 border border-green-100 p-5 rounded-3xl group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">XLM Value</span>
          </div>
          <p className="text-foreground font-mono text-xl font-bold">{formatToken(xlm)}</p>
          <p className="text-muted/60 text-[10px] font-mono mt-1">Staged in liquidity</p>
        </div>

        {/* LQID Value */}
        <div className="bg-green-50/40 border border-green-100 p-5 rounded-3xl group hover:border-primary-dark/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-dark" />
            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">LQID Value</span>
          </div>
          <p className="text-foreground font-mono text-xl font-bold">{formatToken(lqid)}</p>
          <p className="text-muted/60 text-[10px] font-mono mt-1">Staged in liquidity</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-green-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted uppercase text-[9px] font-bold tracking-widest">
          <Wallet2 size={12} />
          Pool ID: {poolStats.poolId.substring(0, 8)}...
        </div>
        <span className="text-muted/50 text-[10px] font-mono">Last active: {new Date(position.lastUpdated).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
