// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/TokenSelector.tsx
'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TokenSelectorProps {
  value: 'XLM' | 'GKT';
  onChange: (token: 'XLM' | 'GKT') => void;
  disabled?: boolean;
}

export default function TokenSelector({ value, onChange, disabled }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const tokens = [
    { code: 'XLM', color: 'bg-primary', iconColor: 'text-primary' },
    { code: 'GKT', color: 'bg-primary-dark', iconColor: 'text-primary-dark' },
  ] as const;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-green-100 rounded-xl hover:border-primary/30 transition-all disabled:opacity-50"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tokens.find(t => t.code === value)?.color}`}>
          <span className="text-[10px] font-bold text-white">{value[0]}</span>
        </div>
        <span className="font-display font-bold text-foreground">{value}</span>
        <ChevronDown size={16} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-32 glass-strong rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {tokens.map((token) => (
            <button
              key={token.code}
              onClick={() => {
                onChange(token.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50/50 transition-colors ${
                value === token.code ? 'bg-green-50/80' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full ${token.color} flex items-center justify-center`}>
                <span className="text-[8px] font-bold text-white">{token.code[0]}</span>
              </div>
              <span className="font-display text-foreground text-sm">{token.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
