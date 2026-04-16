// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/WalletConnect.tsx
'use client';

import React from 'react';
import { LogOut, Copy, Check, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';

export default function WalletConnect() {
  const { address, xlmBalance, lqidBalance, lpoolBalance, isInstalled, connecting, connect, disconnect } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isInstalled) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-violet text-white font-display font-black rounded-xl hover:bg-violet/80 transition-all flex items-center gap-2"
      >
        Install Freighter
      </a>
    );
  }

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-8 py-3 bg-cyan text-background font-display font-black rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-cyan/20 disabled:opacity-50"
      >
        <Wallet size={18} />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-card/80 border border-border p-1.5 pr-4 rounded-2xl group hover:border-cyan/50 transition-all">
      <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border group-hover:border-cyan/20">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-mono font-bold text-white tracking-tighter">
          {truncateAddress(address)}
        </span>
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] items-center gap-1 font-mono font-bold text-white/50 flex whitespace-nowrap">
          {xlmBalance.toLocaleString()} <span className="text-[8px] opacity-70">XLM</span>
        </span>
        <span className="text-[10px] items-center gap-1 font-mono font-bold text-cyan flex whitespace-nowrap">
          {lqidBalance.toLocaleString()} <span className="text-[8px] opacity-70">LQID</span>
        </span>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          className="p-2 text-muted hover:text-cyan hover:bg-cyan/5 rounded-lg transition-all"
          title="Copy Address"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
        <button
          onClick={disconnect}
          className="p-2 text-muted hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
          title="Disconnect"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
