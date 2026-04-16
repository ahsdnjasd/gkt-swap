// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/TrustlineSetup.tsx
'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { createTrustlineXDR, submitSignedXDR, NETWORK_PASSPHRASE } from '@/lib/stellar';
import { signTransaction } from '@stellar/freighter-api';

interface TrustlineSetupProps {
  asset: 'LQID' | 'LPOOL';
  userAddress: string;
  onSuccess: () => void;
}

export default function TrustlineSetup({ asset, userAddress, onSuccess }: TrustlineSetupProps) {
  const [step, setStep] = useState<'idle' | 'preparing' | 'signing' | 'broadcasting' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSetup = async () => {
    try {
      setStep('preparing');
      const xdr = await createTrustlineXDR(userAddress, asset);
      
      setStep('signing');
      const signedXdr = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
      
      setStep('broadcasting');
      await submitSignedXDR(signedXdr);
      
      setStep('done');
      setTimeout(onSuccess, 2000);
    } catch (error: any) {
      console.error('Trustline setup error:', error);
      setStep('error');
      setErrorMessage(error.message || 'Transaction failed');
    }
  };

  if (step === 'done') {
    return (
      <div className="bg-success/10 border border-success/20 p-4 rounded-2xl flex items-center gap-3 text-success animate-in fade-in slide-in-from-top-2">
        <CheckCircle2 size={24} />
        <span className="font-semibold">Trustline Created! Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="bg-violet/5 border border-violet/20 p-6 rounded-2xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-violet/20 p-3 rounded-xl text-violet">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="text-white font-display font-bold text-lg">Trustline Required</h3>
          <p className="text-muted text-sm leading-relaxed">
            You need a {asset} trustline on the Stellar network before you can hold or trade this asset.
          </p>
        </div>
      </div>

      {step === 'error' && (
        <div className="bg-danger/10 border border-danger/20 p-3 rounded-xl mb-4 flex items-center gap-2 text-danger text-sm">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        onClick={handleSetup}
        disabled={step !== 'idle' && step !== 'error'}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-violet text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
      >
        {step === 'idle' || step === 'error' ? (
          <>Setup {asset} Trustline</>
        ) : (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span className="capitalize">{step}...</span>
          </>
        )}
      </button>

      {step !== 'idle' && step !== 'error' && (
        <div className="mt-4 flex justify-between gap-1">
          {['preparing', 'signing', 'broadcasting'].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step === s ? 'bg-violet animate-pulse' : 
                (['signing', 'broadcasting'].includes(step as any) && s === 'preparing') || (step === 'broadcasting' && s === 'signing')
                ? 'bg-success' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
