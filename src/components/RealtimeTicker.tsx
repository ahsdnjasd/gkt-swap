// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/RealtimeTicker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePriceFeed, useConnectionStatus } from '@/lib/sse';
import { PriceFeedData } from '@/types';
import { formatToken, formatXLM } from '@/lib/utils';
import { Circle, Zap } from 'lucide-react';

export default function RealtimeTicker() {
  const [data, setData] = useState<PriceFeedData | null>(null);
  const [priceColor, setPriceColor] = useState('text-primary');
  const status = useConnectionStatus();

  usePriceFeed((newData) => {
    if (data && newData.price !== data.price) {
      setPriceColor(newData.price > data.price ? 'text-success' : 'text-danger');
      setTimeout(() => setPriceColor('text-primary'), 2000);
    }
    setData(newData);
  });

  return (
    <div className="w-full glass-subtle border-b border-green-100/50 py-2 overflow-hidden sticky top-0 z-[60]">
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2 pr-6 border-r border-green-200/50">
            <Zap size={14} className="text-primary fill-primary" />
            <span className="text-[10px] font-display font-black text-foreground uppercase tracking-tighter">Live Markets</span>
          </div>
          
          <div className="flex items-center gap-8 animate-marquee">
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">GKT/XLM:</span>
              <span className={`font-mono text-xs font-bold transition-colors duration-500 ${priceColor}`}>
                {data?.price ? formatToken(data.price, 4) : status === 'connecting' || (data && !data.price) ? 'Connecting...' : '---'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">24h Vol:</span>
              <span className="text-foreground font-mono text-xs font-bold">
                {data ? formatXLM(data.volume) : status === 'connecting' ? '---' : '---'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">TVL:</span>
              <span className="text-foreground font-mono text-xs font-bold">
                {data ? formatXLM(data.tvl) : status === 'connecting' ? '---' : '---'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-6 bg-white shadow-[-20px_0_20px_white]">
          <span className="text-[9px] text-muted font-mono uppercase tracking-widest">{status}</span>
          <Circle 
            size={8} 
            className={`${
              status === 'connected' ? 'text-success fill-success' : 
              status === 'connecting' ? 'text-warning fill-warning animate-pulse' : 
              'text-danger fill-danger'
            }`} 
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
