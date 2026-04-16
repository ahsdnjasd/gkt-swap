// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/liquidity/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Pool, LPPosition } from '@/types';
import LiquidityCard from '@/components/LiquidityCard';
import TrustlineSetup from '@/components/TrustlineSetup';
import { Layers, Droplets, Percent, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatToken, formatXLM } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';
import { getAccountAssets } from '@/lib/stellar';

export default function LiquidityPage() {
  const { address } = useWallet();
  const [pool, setPool] = useState<Pool | null>(null);
  const [position, setPosition] = useState<LPPosition | null>(null);
  const [needsLqidTrustline, setNeedsLqidTrustline] = useState(false);
  const [needsLpoolTrustline, setNeedsLpoolTrustline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const poolRes = await fetch('/api/pool');
      setPool(await poolRes.json());

      if (address) {
        const posRes = await fetch(`/api/liquidity?address=${address}`);
        setPosition(await posRes.json());

        // Check trustlines
        const assets = await getAccountAssets(address);
        setNeedsLqidTrustline(assets.lqid === 0);
        setNeedsLpoolTrustline(assets.lpool === 0);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="max-w-[1000px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white">Liquidity Pools</h1>
          <p className="text-muted text-sm font-medium">Provide liquidity and earn trading fees on every swap</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-success/5 border border-success/20 rounded-2xl">
          <div className="bg-success/20 p-2 rounded-xl text-success">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-white font-mono font-bold leading-none">0.3% Fee</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Provider Reward</p>
          </div>
        </div>
      </div>

      {address && needsLqidTrustline && (
        <TrustlineSetup asset="LQID" userAddress={address} onSuccess={() => setNeedsLqidTrustline(false)} />
      )}

      {address && needsLpoolTrustline && (
        <TrustlineSetup asset="LPOOL" userAddress={address} onSuccess={() => setNeedsLpoolTrustline(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-card border border-border p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-cyan/5 blur-[80px] rounded-full" />
             
             <h3 className="text-white font-display font-bold text-xl mb-6 flex items-center gap-2">
               Current Pool State <Droplets size={18} className="text-cyan" />
             </h3>

             <div className="grid grid-cols-2 gap-8">
               <div className="space-y-1">
                 <span className="text-muted text-[10px] uppercase font-bold tracking-[0.2em]">XLM Locked</span>
                 <p className="text-2xl font-mono font-black text-white">{pool ? formatToken(pool.xlmReserve) : '---'}</p>
                 <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-cyan w-full opacity-50" />
                 </div>
               </div>
               <div className="space-y-1">
                 <span className="text-muted text-[10px] uppercase font-bold tracking-[0.2em]">LQID Locked</span>
                 <p className="text-2xl font-mono font-black text-white">{pool ? formatToken(pool.lqidReserve) : '---'}</p>
                 <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-violet w-full opacity-50" />
                 </div>
               </div>
             </div>

             <div className="mt-10 p-5 bg-background/50 border border-border rounded-3xl flex justify-between items-center">
               <div className="flex flex-col">
                 <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Global TVL</span>
                 <span className="text-lg font-mono font-bold text-white">{pool ? formatXLM(pool.tvlXLM) : '---'}</span>
               </div>
               <div className="flex flex-col text-right">
                 <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Total LP Shares</span>
                 <span className="text-lg font-mono font-bold text-white">{pool ? formatToken(pool.totalLPShares, 2) : '---'}</span>
               </div>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-display font-black text-white flex items-center gap-3">
              How it Works <HelpCircle size={24} className="text-muted" />
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Add Assets', desc: 'Deposit equal values of XLM and LQID into the pool.', icon: <Droplets className="text-cyan" /> },
                { title: 'Earn Shares', desc: 'Receive LPOOL shares representing your stake.', icon: <Layers className="text-violet" /> },
                { title: 'Collect Fees', desc: 'Trading fees are automatically added to the pool.', icon: <ShieldCheck className="text-success" /> },
              ].map((step, idx) => (
                <div key={idx} className="p-6 bg-card border border-border rounded-3xl hover:border-muted transition-all">
                  <div className="bg-background w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-border shadow-inner">
                    {step.icon}
                  </div>
                  <h4 className="text-white font-display font-bold text-sm mb-2">{step.title}</h4>
                  <p className="text-[11px] text-muted leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
           <LiquidityCard userAddress={address || ''} poolStats={pool} position={position} />
        </div>
      </div>
    </div>
  );
}
