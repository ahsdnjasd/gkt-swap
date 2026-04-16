// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/TransactionStatus.tsx
'use client';

import React from 'react';
import { CheckCircle2, XCircle, Loader2, X, ExternalLink, Activity } from 'lucide-react';
import { TxStep } from '@/types';
import { stellarExpertTx } from '@/lib/utils';

interface TransactionStatusProps {
  steps: TxStep[];
  onClose: () => void;
}

export default function TransactionStatus({ steps, onClose }: TransactionStatusProps) {
  const isComplete = steps.length > 0 && steps.every((s) => s.status === 'done');
  const hasError = steps.length > 0 && steps.some((s) => s.status === 'error');
  const activeStepIdx = steps.findIndex((s) => s.status === 'active');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 blur-[60px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet/10 blur-[60px] rounded-full" />

        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-display font-black text-white">Transaction Status</h3>
          {(isComplete || hasError) && (
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-4 relative">
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[11px] top-7 w-[2px] h-8 bg-border" />
              )}

              <div className="relative z-10">
                {step.status === 'done' ? (
                  <CheckCircle2 className="text-success" size={24} />
                ) : step.status === 'error' ? (
                  <XCircle className="text-danger" size={24} />
                ) : step.status === 'active' ? (
                  <div className="relative">
                    <Loader2 className="text-cyan animate-spin" size={24} />
                    <div className="absolute inset-0 bg-cyan/20 blur-md rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center bg-card">
                    <span className="text-[10px] text-muted font-mono">{idx + 1}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className={`font-display font-bold ${
                  step.status === 'active' ? 'text-white' : 
                  step.status === 'done' ? 'text-success/80' : 
                  step.status === 'error' ? 'text-danger' : 'text-muted'
                }`}>
                  {step.label}
                </p>
                {step.status === 'active' && (
                  <p className="text-[10px] text-cyan/70 font-mono animate-pulse uppercase tracking-wider">
                    Processing...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          {hasError ? (
            <button
              onClick={onClose}
              className="w-full py-4 bg-danger/10 text-danger border border-danger/20 font-display font-bold rounded-2xl hover:bg-danger/20 transition-all"
            >
              Close and Try Again
            </button>
          ) : isComplete ? (
            <button
              onClick={onClose}
              className="w-full py-4 bg-success text-background font-display font-black rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
            >
              Back to App
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-2xl border border-border">
              <Activity className="text-cyan animate-pulse" size={18} />
              <span className="text-xs text-muted font-mono">Securing your swap on Stellar...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
