// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/SlippageSettings.tsx
'use client';

import React, { useState } from 'react';
import { Settings2, AlertTriangle } from 'lucide-react';

interface SlippageSettingsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SlippageSettings({ value, onChange }: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState(value.toString());

  const options = [0.1, 0.5, 1.0];

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 50) {
      onChange(num);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted hover:text-foreground bg-green-50/50 border border-green-100 rounded-lg transition-all"
        title="Slippage Settings"
      >
        <Settings2 size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 glass-strong p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-foreground font-display font-bold mb-3 text-sm">Slippage Tolerance</h4>
            
            <div className="flex gap-2 mb-4">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setCustomValue(opt.toString());
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    value === opt ? 'bg-primary text-white font-bold' : 'bg-green-50/50 text-muted border border-green-100 hover:border-primary/30'
                  }`}
                >
                  {opt}%
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={customValue}
                  onChange={handleCustomChange}
                  className="w-full bg-green-50/30 border border-green-100 rounded-lg py-2 pl-3 pr-8 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-all"
                  placeholder="Custom"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">%</span>
              </div>
            </div>

            {value > 5 && (
              <div className="flex items-start gap-2 text-warning bg-warning/10 p-2 rounded-lg text-[10px] leading-tight">
                <AlertTriangle size={14} className="shrink-0" />
                <span>High slippage increases the risk of frontrunning and unfavorable rates.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
