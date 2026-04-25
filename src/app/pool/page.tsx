// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/pool/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Pool, Swap } from '@/types';
import PoolStats from '@/components/PoolStats';
import SwapHistory from '@/components/SwapHistory';
import { formatToken, formatXLM, formatPercent, truncateAddress, stellarExpertAccount } from '@/lib/utils';
import { Copy, ExternalLink, Activity, Info, BarChart2 } from 'lucide-react';

export default function PoolPage() {
  const [pool, setPool] = useState<Pool | null>(null);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [poolRes, swapsRes] = await Promise.all([
        fetch('/api/pool'),
        fetch('/api/swap')
      ]);
      setPool(await poolRes.json());
      setSwaps(await swapsRes.json());
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const copyPoolId = () => {
    if (pool) navigator.clipboard.writeText(pool.poolId);
  };

  const xlmRatio = pool ? (pool.xlmReserve / (pool.xlmReserve + pool.gktReserve)) * 100 : 50;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
            <Activity size={12} className="animate-pulse" />
            Live Analytics
          </div>
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter uppercase">XLM/GKT Pool</h1>
        </div>
        
        {pool && (
          <div className="flex items-center gap-2 p-3 glass rounded-xl">
             <span className="text-[10px] text-muted font-mono">{truncateAddress(pool.poolId)}</span>
             <button onClick={copyPoolId} className="p-1.5 hover:text-primary transition-colors text-muted"><Copy size={14}/></button>
             <a href={`https://stellar.expert/explorer/testnet/liquidity-pool/${pool.poolId}`} target="_blank" rel="noreferrer" className="p-1.5 hover:text-primary transition-colors text-muted">
               <ExternalLink size={14}/>
             </a>
          </div>
        )}
      </div>

      <PoolStats pool={pool} price={pool ? pool.xlmReserve / pool.gktReserve : 0} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reserve Ratio Card */}
        <div className="glass-strong p-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-dark/5 blur-[100px] rounded-full pointer-events-none" />
          
          <h3 className="text-foreground font-display font-black text-2xl mb-8 flex items-center gap-3">
            Inventory Mix <BarChart2 size={24} className="text-primary-dark" />
          </h3>

          <div className="space-y-10 relative z-10">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">XLM Inventory</span>
                <span className="text-3xl font-mono font-black text-foreground">{pool ? formatToken(pool.xlmReserve) : '---'}</span>
              </div>
              <span className="text-primary font-mono font-bold text-xl">{formatPercent(xlmRatio)}</span>
            </div>

            <div className="relative h-6 w-full bg-green-100 rounded-2xl overflow-hidden p-1 border border-green-200/50">
              <div 
                className="h-full bg-primary shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-xl transition-all duration-1000 ease-out"
                style={{ width: `${xlmRatio}%` }}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">GKT Inventory</span>
                <span className="text-3xl font-mono font-black text-foreground">{pool ? formatToken(pool.gktReserve) : '---'}</span>
              </div>
              <span className="text-primary-dark font-mono font-bold text-xl">{formatPercent(100 - xlmRatio)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats Card */}
        <div className="glass-strong p-10 rounded-[2.5rem]">
           <h3 className="text-foreground font-display font-black text-2xl mb-8 flex items-center gap-3">
             Detailed Metrics <Info size={24} className="text-primary" />
           </h3>

           <div className="divide-y divide-green-100">
              {[
                { label: 'Total LP Shares', value: pool ? formatToken(pool.totalLPShares, 2) : '---' },
                { label: '24h Fees Collected', value: pool ? formatXLM(pool.fees24h) : '---' },
                { label: 'Annualized Yield (Est.)', value: '18.4%', color: 'text-success' },
                { label: 'Liquidity Depth (±2%)', value: pool ? formatXLM(pool.tvlXLM * 0.15) : '---' },
                { label: 'Last Update', value: pool ? new Date(pool.lastUpdated).toLocaleTimeString() : '---' },
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between py-5 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium text-muted">{row.label}</span>
                  <span className={`text-sm font-mono font-bold ${row.color || 'text-foreground'}`}>{row.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="pt-12">
        <h3 className="text-3xl font-display font-black text-foreground mb-8">Pool Transaction History</h3>
        <SwapHistory swaps={swaps} />
      </div>
    </div>
  );
}
