// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/swap/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Pool, Swap } from '@/types';
import SwapCard from '@/components/SwapCard';
import SwapHistory from '@/components/SwapHistory';
import TrustlineSetup from '@/components/TrustlineSetup';
import { getAccountAssets } from '@/lib/stellar';
import { Info, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';

export default function SwapPage() {
  const { address } = useWallet();
  const [pool, setPool] = useState<Pool | null>(null);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [needsTrustline, setNeedsTrustline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [poolRes, swapsRes] = await Promise.all([
        fetch('/api/pool'),
        fetch('/api/swap')
      ]);
      setPool(await poolRes.json());
      setSwaps(await swapsRes.json());
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address) {
      getAccountAssets(address).then(assets => {
        // If user has no LQID balance entry, they likely need a trustline
        if (assets.lqid === 0) {
          setNeedsTrustline(true);
        } else {
          setNeedsTrustline(false);
        }
      });
    } else {
      setNeedsTrustline(false);
    }
  }, [address]);

  // Price Chart Visualization (SVG Polyline)
  const pricePoints = swaps.length >= 2 ? swaps.slice(0, 10).map(s => s.fromAmount / s.toAmount).reverse() : [1, 1, 1];
  const maxPrice = Math.max(...pricePoints);
  const minPrice = Math.min(...pricePoints);
  const range = maxPrice - minPrice || 1;
  const polylinePoints = pricePoints.map((p, i) => `${(i / (pricePoints.length - 1)) * 100},${100 - ((p - minPrice) / range) * 100}`).join(' ');

  const currentPrice = pool ? pool.xlmReserve / pool.lqidReserve : 0;
  const priceChange = swaps.length > 2 ? ((currentPrice - (swaps[1].fromAmount / swaps[1].toAmount)) / currentPrice) * 100 : 0;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-white">Swap Tokens</h1>
          <p className="text-muted text-sm font-medium">Efficiently exchange assets on the Stellar network</p>
        </div>
        
        {pool && (
          <div className="bg-card border border-border px-6 py-3 rounded-2xl flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">LQID Price</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-white">{currentPrice.toFixed(4)} XLM</span>
                <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {priceChange >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                  {formatPercent(Math.abs(priceChange))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {address && needsTrustline && (
        <TrustlineSetup asset="LQID" userAddress={address} onSuccess={() => setNeedsTrustline(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-card border border-border p-8 rounded-[2.5rem] mb-8 relative overflow-hidden h-[400px]">
            <div className="absolute top-8 left-8">
              <h3 className="text-white font-display font-bold flex items-center gap-2">
                Price Chart <Info size={14} className="text-muted" />
              </h3>
            </div>
            
            {/* SVG Chart */}
            <div className="absolute inset-0 pt-24 pb-12 px-8">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${polylinePoints} L 100,100 L 0,100 Z`}
                  fill="url(#chartGradient)"
                  className="animate-in fade-in duration-1000"
                />
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-chart-draw"
                />
              </svg>
            </div>
            
            <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
              <span>Past 10 Swaps</span>
              <span>Live Testnet Data</span>
            </div>
          </div>

          <SwapHistory swaps={swaps} />
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <SwapCard userAddress={address || ''} poolStats={pool} />
          
          <div className="mt-8 bg-violet/5 border border-violet/20 p-6 rounded-3xl">
            <h4 className="text-violet font-display font-bold mb-2 flex items-center gap-2">
              LiquidSwap AMM <Zap size={14} />
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Our automated market maker ensures you always get the best price by balancing reserves 
              between assets. Fees go directly to liquidity providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
