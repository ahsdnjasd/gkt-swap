// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/RealtimeTicker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePriceFeed, useConnectionStatus } from '@/lib/sse';
import { PriceFeedData } from '@/types';
import { formatToken, formatXLM } from '@/lib/utils';
import { Circle, Zap } from 'lucide-react';

export default function RealtimeTicker() {
  const [data, setData] = useState<PriceFeedData | null>(null);
  const [priceColor, setPriceColor] = useState('text-cyan');
  const status = useConnectionStatus();

  usePriceFeed((newData) => {
    if (data && newData.price !== data.price) {
      setPriceColor(newData.price > data.price ? 'text-success' : 'text-danger');
      setTimeout(() => setPriceColor('text-cyan'), 2000);
    }
    setData(newData);
  });

  return (
    <div className="w-full bg-[#04040a]/80 backdrop-blur-md border-b border-border py-2 overflow-hidden sticky top-0 z-[60]">
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2 pr-6 border-r border-border/50">
            <Zap size={14} className="text-cyan fill-cyan" />
            <span className="text-[10px] font-display font-black text-white uppercase tracking-tighter">Live Markets</span>
          </div>
          
          <div className="flex items-center gap-8 animate-marquee">
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">LQID/XLM:</span>
              <span className={`font-mono text-xs font-bold transition-colors duration-500 ${priceColor}`}>
                {data ? formatToken(data.price, 4) : status === 'connecting' ? 'Connecting...' : '---'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">24h Vol:</span>
              <span className="text-white font-mono text-xs font-bold">
                {data ? formatXLM(data.volume) : status === 'connecting' ? '---' : '---'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-bold">TVL:</span>
              <span className="text-white font-mono text-xs font-bold">
                {data ? formatXLM(data.tvl) : status === 'connecting' ? '---' : '---'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-6 bg-[#04040a] shadow-[-20px_0_20px_#04040a]">
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
