// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pool, Swap } from '@/types';
import PoolStats from '@/components/PoolStats';
import SwapCard from '@/components/SwapCard';
import SwapHistory from '@/components/SwapHistory';
import { ArrowRight, ChevronRight, Zap, Droplets } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

export default function LandingPage() {
  const [pool, setPool] = useState<Pool | null>(null);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poolRes, swapsRes] = await Promise.all([
          fetch('/api/pool'),
          fetch('/api/swap')
        ]);
        
        if (poolRes.ok) {
          setPool(await poolRes.json());
        } else {
          setPool(null);
        }

        if (swapsRes.ok) {
          setSwaps(await swapsRes.json());
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-display font-black text-xs uppercase tracking-widest animate-pulse">
            <Zap size={14} />
            Live on Stellar Testnet
          </div>

          {!loading && pool?.xlmReserve === 0 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-warning animate-ping" />
                <p className="text-[10px] font-bold text-warning uppercase tracking-widest">Protocol Uninitialized</p>
              </div>
              <Link href="/admin" className="text-[10px] font-bold text-foreground bg-warning/20 px-3 py-1.5 rounded-lg group-hover:bg-warning/30 transition-all flex items-center gap-1">
                Setup Pool <ChevronRight size={12} />
              </Link>
            </div>
          )}

          <h1 className="text-6xl lg:text-8xl font-display font-black text-foreground leading-[0.9] tracking-tighter">
            The Fastest <br />
            <span className="text-primary">
              DEX on Stellar
            </span>
          </h1>
          <p className="text-xl text-muted max-w-lg leading-relaxed font-medium">
            Swap XLM ↔ GKT with zero slippage anxiety. 
            Deep liquidity, institutional-grade security, and instant settlement.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/swap"
              className="px-8 py-4 bg-primary text-white font-display font-black rounded-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] transition-all flex items-center gap-2 group"
            >
              Start Trading
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/liquidity"
              className="px-8 py-4 glass border border-green-100 text-foreground font-display font-black rounded-2xl hover:bg-green-50/50 transition-all flex items-center gap-2"
            >
              Add Liquidity
              <Droplets size={20} className="text-primary-dark" />
            </Link>
          </div>
          
          {/* Animated Blob Visualization */}
          <div className="hidden lg:block relative h-48 w-full mt-12 glass rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <svg viewBox="0 0 400 200" className="w-full h-full opacity-40">
                <defs>
                  <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                  </filter>
                </defs>
                <g filter="url(#goo)">
                  <circle cx="150" cy="100" r={pool ? Math.max(40, Math.min(80, (pool.xlmReserve / pool.tvlXLM) * 100)) : 60} fill="#22c55e" className="animate-blob" />
                  <circle cx="250" cy="100" r={pool ? Math.max(40, Math.min(80, (pool.gktReserve / pool.tvlXLM) * 100)) : 60} fill="#16a34a" className="animate-blob [animation-delay:2s]" />
                </g>
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-around px-8">
              <div className="text-center">
                <span className="block text-primary font-mono font-bold text-lg">{pool?.xlmReserve ? (pool.xlmReserve / 1000).toFixed(1) : '0.0'}k</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">XLM Locked</span>
              </div>
              <div className="text-center">
                <span className="block text-primary-dark font-mono font-bold text-lg">{pool?.gktReserve ? (pool.gktReserve / 1000).toFixed(1) : '0.0'}k</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">GKT Locked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
           <SwapCard userAddress={address || ''} poolStats={pool} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-4xl font-display font-black text-foreground">Market Data</h2>
          <Link href="/pool" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View Full Analytics <ChevronRight size={16} />
          </Link>
        </div>
        <PoolStats pool={pool} price={pool ? pool.xlmReserve / pool.gktReserve : 0} loading={loading} />
      </section>

      {/* History Section */}
      <section className="space-y-8">
        <h2 className="text-4xl font-display font-black text-foreground">Live Transactions</h2>
        <SwapHistory swaps={swaps.slice(0, 5)} />
      </section>
    </div>
  );
}
