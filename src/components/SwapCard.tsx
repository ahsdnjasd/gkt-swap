// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/SwapCard.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowDownUp, Info, Loader2 } from 'lucide-react';
import { Pool, SwapQuote, TxStep } from '@/types';
import { getSwapOutput, getPriceImpact, getMinimumReceived } from '@/lib/priceEngine';
import { debounce, formatToken, formatPercent } from '@/lib/utils';
import { buildSwapXDR, submitSignedXDR, NETWORK_PASSPHRASE } from '@/lib/stellar';
import { signTransaction } from '@stellar/freighter-api';
import { useWallet } from '@/context/WalletContext';
import TokenSelector from './TokenSelector';
import SlippageSettings from './SlippageSettings';
import TransactionStatus from './TransactionStatus';
import TrustlineSetup from './TrustlineSetup';

interface SwapCardProps {
  userAddress: string;
  poolStats: Pool | null;
}

export default function SwapCard({ userAddress, poolStats }: SwapCardProps) {
  const [fromToken, setFromToken] = useState<'XLM' | 'LQID'>('XLM');
  const [toToken, setToToken] = useState<'XLM' | 'LQID'>('LQID');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState<number>(0);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSteps, setTxSteps] = useState<TxStep[]>([]);

  const calculateQuote = useMemo(
    () =>
      debounce((amount: string) => {
        if (!poolStats || !amount || parseFloat(amount) <= 0) {
          setQuote(null);
          setToAmount(0);
          return;
        }

        const input = parseFloat(amount);
        const inputReserve = fromToken === 'XLM' ? poolStats.xlmReserve : poolStats.lqidReserve;
        const outputReserve = fromToken === 'XLM' ? poolStats.lqidReserve : poolStats.xlmReserve;

        const output = getSwapOutput(input, inputReserve, outputReserve);
        const impact = getPriceImpact(input, inputReserve);
        const minReceived = getMinimumReceived(output, slippage);

        setToAmount(output);
        setQuote({
          inputAmount: input,
          outputAmount: output,
          priceImpact: impact,
          minimumReceived: minReceived,
          fee: input * 0.003,
        });
      }, 300),
    [fromToken, poolStats, slippage]
  );

  useEffect(() => {
    calculateQuote(fromAmount);
  }, [fromAmount, calculateQuote]);

  const { refreshBalance, pollBalance, hasLqidTrust } = useWallet();

  const showTrustlineRequired = toToken === 'LQID' && !hasLqidTrust && !!userAddress;

  const handleFlip = () => {
    const prevFrom = fromToken;
    setFromToken(toToken);
    setToToken(prevFrom);
    setFromAmount('');
    setToAmount(0);
    setQuote(null);
  };

  const handleFromTokenChange = (token: 'XLM' | 'LQID') => {
    setFromToken(token);
    setToToken(token === 'XLM' ? 'LQID' : 'XLM');
    setFromAmount('');
    setQuote(null);
  };

  const handleSwap = async () => {
    if (!quote || !userAddress) return;

    try {
      setIsProcessing(true);
      const steps: TxStep[] = [
        { label: 'Preparing Transaction', status: 'active' },
        { label: 'Awaiting Signature', status: 'pending' },
        { label: 'Broadcasting to Network', status: 'pending' },
        { label: 'Confirmed', status: 'pending' },
      ];
      setTxSteps(steps);

      // Step 1: Build
      const xdr = await buildSwapXDR(
        userAddress,
        fromToken,
        quote.outputAmount.toFixed(7),
        (quote.inputAmount * 1.01).toFixed(7) // buffer
      );
      
      steps[0].status = 'done';
      steps[1].status = 'active';
      setTxSteps([...steps]);

      // Step 2: Sign
      const signedXdr = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
      
      steps[1].status = 'done';
      steps[2].status = 'active';
      setTxSteps([...steps]);

      // Step 3: Submit
      const txHash = await submitSignedXDR(signedXdr);

      // Step 4: Record in DB
      await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          fromToken,
          toToken,
          fromAmount: quote.inputAmount,
          toAmount: quote.outputAmount,
          txHash,
          slippage,
        }),
      });

      steps[2].status = 'done';
      steps[3].status = 'done';
      setTxSteps([...steps]);
      
      // Reactive polling for 10 seconds to catch ledger settlement
      pollBalance(5);
      setFromAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      const updatedSteps = [...txSteps];
      const activeIdx = updatedSteps.findIndex(s => s.status === 'active');
      if (activeIdx !== -1) updatedSteps[activeIdx].status = 'error';
      setTxSteps(updatedSteps);
    }
  };

  const impactColor = (impact: number) => {
    if (impact < 1) return 'text-success';
    if (impact < 3) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="glass-strong p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-foreground font-display font-bold text-xl">Swap Tokens</h2>
        <SlippageSettings value={slippage} onChange={setSlippage} />
      </div>

      <div className="space-y-2">
        {/* From Section */}
        <div className="bg-green-50/40 border border-green-100 p-4 rounded-3xl hover:border-primary/30 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-muted text-xs font-medium">You Pay</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl font-mono text-foreground w-full focus:outline-none placeholder:text-muted/30"
            />
            <TokenSelector value={fromToken} onChange={handleFromTokenChange} />
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-4 relative z-10">
          <button
            onClick={handleFlip}
            className="p-3 glass-strong rounded-xl text-primary hover:text-primary-dark hover:border-primary/30 transition-all shadow-lg"
          >
            <ArrowDownUp size={18} />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-green-50/40 border border-green-100 p-4 rounded-3xl hover:border-primary/30 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-muted text-xs font-medium">You Receive (Est.)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-transparent text-2xl font-mono text-foreground/50 w-full overflow-hidden truncate">
              {toAmount > 0 ? formatToken(toAmount) : '0.00'}
            </div>
            <TokenSelector value={toToken} onChange={setToToken} disabled />
          </div>
        </div>
      </div>

      {quote && (
        <div className="mt-6 space-y-3 px-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted flex items-center gap-1">
              Price Impact <Info size={12} />
            </span>
            <span className={`font-mono font-bold ${impactColor(quote.priceImpact)}`}>
              {formatPercent(quote.priceImpact)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted">Minimum Received</span>
            <span className="text-foreground font-mono">{formatToken(quote.minimumReceived)} {toToken}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={!quote || !userAddress || isProcessing || showTrustlineRequired}
        className="w-full mt-8 py-4 bg-primary text-white font-display font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" />
            Swapping...
          </div>
        ) : !userAddress ? (
          'Connect Wallet to Swap'
        ) : showTrustlineRequired ? (
          'Trustline Required'
        ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
          'Enter Amount'
        ) : (!poolStats || poolStats.xlmReserve === 0) ? (
          'Insufficient Liquidity'
        ) : (
          'Confirm Swap'
        )}
      </button>

      {showTrustlineRequired && (
        <div className="mt-6 animate-in fade-in zoom-in duration-300">
          <TrustlineSetup 
            asset="LQID" 
            userAddress={userAddress} 
            onSuccess={() => refreshBalance()} 
          />
        </div>
      )}

      {isProcessing && txSteps.length > 0 && (
        <TransactionStatus steps={txSteps} onClose={() => setIsProcessing(false)} />
      )}
    </div>
  );
}
