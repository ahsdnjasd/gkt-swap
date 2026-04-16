// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/SwapHistory.tsx
'use client';

import React from 'react';
import { Swap } from '@/types';
import { truncateAddress, formatToken, formatPercent, timeAgo, stellarExpertTx } from '@/lib/utils';
import { ExternalLink, ArrowRight, Clock } from 'lucide-react';

interface SwapHistoryProps {
  swaps: Swap[];
}

export default function SwapHistory({ swaps }: SwapHistoryProps) {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-border flex justify-between items-center">
        <h3 className="text-white font-display font-black text-xl uppercase tracking-tight">Recent Activity</h3>
        <div className="flex items-center gap-2 text-muted text-[10px] font-mono">
          <Clock size={12} />
          <span>Real-time updates enabled</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/30">
              <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">User</th>
              <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Transaction</th>
              <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Impact</th>
              <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Time</th>
              <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {swaps.map((swap) => (
              <tr key={swap.txHash} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <span className="text-white font-mono text-xs">{truncateAddress(swap.userAddress)}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan font-mono font-bold text-xs">{formatToken(swap.fromAmount)} {swap.fromToken}</span>
                      <ArrowRight size={12} className="text-muted" />
                      <span className="text-violet font-mono font-bold text-xs">{formatToken(swap.toAmount)} {swap.toToken}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`font-mono text-xs ${swap.priceImpact > 2 ? 'text-danger' : 'text-success'}`}>
                    {formatPercent(swap.priceImpact)}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-muted text-xs font-medium">{timeAgo(new Date(swap.timestamp))}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <a
                    href={stellarExpertTx(swap.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 p-2 bg-background border border-border rounded-lg text-muted hover:text-cyan hover:border-cyan transition-all group-hover:shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Details</span>
                    <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {swaps.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted text-sm font-medium">No swaps detected yet. Start trading to see history!</p>
          </div>
        )}
      </div>
    </div>
  );
}
