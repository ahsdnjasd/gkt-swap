// /Users/parthkaran/Documents/claude_projects/liquidswap/src/components/LiquidityCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Info, Loader2, Droplets } from 'lucide-react';
import { Pool, LPPosition, TxStep } from '@/types';
import { getLPShares, getPositionValue } from '@/lib/priceEngine';
import { formatToken, formatPercent } from '@/lib/utils';
import { buildAddLiquidityXDR, buildRemoveLiquidityXDR, submitSignedXDR, NETWORK_PASSPHRASE } from '@/lib/stellar';
import { signTransaction } from '@stellar/freighter-api';
import TransactionStatus from './TransactionStatus';
import LPPositionCard from './LPPositionCard';
import { useWallet } from '@/context/WalletContext';

interface LiquidityCardProps {
  userAddress: string;
  poolStats: Pool | null;
  position: LPPosition | null;
}

export default function LiquidityCard({ userAddress, poolStats, position }: LiquidityCardProps) {
  const { refreshBalance } = useWallet();
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [xlmAmount, setXlmAmount] = useState('');
  const [lqidAmount, setLqidAmount] = useState('');
  const [removePercent, setRemovePercent] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSteps, setTxSteps] = useState<TxStep[]>([]);

  // Auto-calculate lqidAmount when xlmAmount changes to maintain pool ratio
  useEffect(() => {
    if (activeTab === 'add' && xlmAmount && poolStats && poolStats.xlmReserve > 0) {
      const xlm = parseFloat(xlmAmount);
      const ratio = poolStats.lqidReserve / poolStats.xlmReserve;
      setLqidAmount((xlm * ratio).toFixed(7));
    }
  }, [xlmAmount, poolStats, activeTab]);

  const handleAddLiquidity = async () => {
    if (!xlmAmount || !lqidAmount || !userAddress || !poolStats) return;

    try {
      setIsProcessing(true);
      const steps: TxStep[] = [
        { label: 'Preparing Transaction', status: 'active' },
        { label: 'Awaiting Signature', status: 'pending' },
        { label: 'Broadcasting', status: 'pending' },
        { label: 'Confirmed', status: 'pending' },
      ];
      setTxSteps(steps);

      const xlm = parseFloat(xlmAmount);
      const lqid = parseFloat(lqidAmount);
      const price = lqid / xlm;
      
      const xdr = await buildAddLiquidityXDR(
        userAddress,
        xlm.toFixed(7),
        lqid.toFixed(7),
        (price * 0.99).toFixed(7), // min price
        (price * 1.01).toFixed(7)  // max price
      );
      
      steps[0].status = 'done'; steps[1].status = 'active'; setTxSteps([...steps]);
      const signedXdr = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
      
      steps[1].status = 'done'; steps[2].status = 'active'; setTxSteps([...steps]);
      const txHash = await submitSignedXDR(signedXdr);

      // Calculate shares received
      const shares = getLPShares(xlm, lqid, poolStats.totalLPShares, poolStats.xlmReserve, poolStats.lqidReserve);

      // Update DB
      await fetch('/api/liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          action: 'add',
          xlmAmount: xlm,
          lqidAmount: lqid,
          lpShares: shares,
          txHash,
        }),
      });

      steps[2].status = 'done'; steps[3].status = 'done'; setTxSteps([...steps]);
      await refreshBalance();
    } catch (error) {
      const updatedSteps = [...txSteps];
      const activeIdx = updatedSteps.findIndex(s => s.status === 'active');
      if (activeIdx !== -1) updatedSteps[activeIdx].status = 'error';
      setTxSteps(updatedSteps);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!position || !poolStats || !userAddress) return;

    try {
      setIsProcessing(true);
      const steps: TxStep[] = [
        { label: 'Preparing Transaction', status: 'active' },
        { label: 'Awaiting Signature', status: 'pending' },
        { label: 'Broadcasting', status: 'pending' },
        { label: 'Confirmed', status: 'pending' },
      ];
      setTxSteps(steps);

      const sharesToRemove = (position.lpShares * removePercent) / 100;
      const { xlm, lqid } = getPositionValue(sharesToRemove, poolStats.totalLPShares, poolStats.xlmReserve, poolStats.lqidReserve);
      
      const xdr = await buildRemoveLiquidityXDR(
        userAddress,
        sharesToRemove.toFixed(7),
        (xlm * 0.99).toFixed(7),
        (lqid * 0.99).toFixed(7)
      );
      
      steps[0].status = 'done'; steps[1].status = 'active'; setTxSteps([...steps]);
      const signedXdr = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
      
      steps[1].status = 'done'; steps[2].status = 'active'; setTxSteps([...steps]);
      const txHash = await submitSignedXDR(signedXdr);

      // Update DB
      await fetch('/api/liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          action: 'remove',
          xlmAmount: xlm,
          lqidAmount: lqid,
          lpShares: sharesToRemove,
          txHash,
        }),
      });

      steps[2].status = 'done'; steps[3].status = 'done'; setTxSteps([...steps]);
      await refreshBalance();
    } catch (error) {
      const updatedSteps = [...txSteps];
      const activeIdx = updatedSteps.findIndex(s => s.status === 'active');
      if (activeIdx !== -1) updatedSteps[activeIdx].status = 'error';
      setTxSteps(updatedSteps);
    }
  };

  const removePreview = position && poolStats ? getPositionValue((position.lpShares * removePercent) / 100, poolStats.totalLPShares, poolStats.xlmReserve, poolStats.lqidReserve) : { xlm: 0, lqid: 0 };

  return (
    <div className="space-y-6">
      <div className="glass-strong p-8 rounded-[2.5rem] shadow-lg">
        <div className="flex bg-green-50/50 border border-green-100 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm transition-all ${
              activeTab === 'add' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
            }`}
          >
            Add Liquidity
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm transition-all ${
              activeTab === 'remove' ? 'bg-primary-dark text-white' : 'text-muted hover:text-foreground'
            }`}
          >
            Remove Liquidity
          </button>
        </div>

        {activeTab === 'add' ? (
          <div className="space-y-4">
            <div className="bg-green-50/40 border border-green-100 p-5 rounded-3xl">
              <label className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2 block">XLM Amount</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={xlmAmount}
                  onChange={(e) => setXlmAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-2xl font-mono text-foreground w-full focus:outline-none"
                />
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-primary" />
                  <span className="text-sm font-display font-bold text-primary">XLM</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <Plus className="text-muted" size={20} />
            </div>

            <div className="bg-green-50/40 border border-green-100 p-5 rounded-3xl">
              <label className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2 block">LQID Amount (Calculated)</label>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-mono text-foreground/50 w-full">{lqidAmount || '0.00'}</div>
                <div className="flex items-center gap-2 bg-primary-dark/10 border border-primary-dark/20 px-3 py-1.5 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-primary-dark" />
                  <span className="text-sm font-display font-bold text-primary-dark">LQID</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddLiquidity}
              disabled={!xlmAmount || !userAddress || isProcessing}
              className="w-full mt-4 py-4 bg-primary text-white font-display font-black text-lg rounded-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all flex items-center justify-center gap-2"
            >
              <Droplets size={20} />
              Supply Liquidity
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {!position || position.lpShares === 0 ? (
              <div className="text-center py-12 px-6 bg-green-50/30 border border-dashed border-green-200 rounded-3xl">
                <p className="text-muted text-sm font-medium">No active LP position found.</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50/40 border border-green-100 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-foreground font-display font-bold">Remove Amount</span>
                    <span className="text-primary-dark font-mono font-bold text-xl">{removePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={removePercent}
                    onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-primary-dark"
                  />
                  <div className="flex justify-between mt-4">
                    {[25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        onClick={() => setRemovePercent(p)}
                        className={`text-[10px] font-mono px-3 py-1 rounded-full border border-green-100 hover:bg-green-50/50 transition-all ${removePercent === p ? 'bg-primary-dark/10 border-primary-dark/30 text-primary-dark' : 'text-muted'}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-primary-dark/5 border border-primary-dark/15 rounded-3xl">
                  <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-4">You will receive</p>
                  <div className="space-y-3">
                    <div className="flex justify-between font-mono">
                      <span className="text-foreground">{formatToken(removePreview.xlm)} XLM</span>
                      <span className="text-foreground">{formatToken(removePreview.lqid)} LQID</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRemoveLiquidity}
                  disabled={isProcessing}
                  className="w-full py-4 bg-primary-dark text-white font-display font-black text-lg rounded-2xl hover:shadow-[0_0_30px_rgba(22,163,74,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  <Minus size={20} />
                  Withdraw Liquidity
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {position && poolStats && <LPPositionCard position={position} poolStats={poolStats} />}
      
      {isProcessing && <TransactionStatus steps={txSteps} onClose={() => setIsProcessing(false)} />}
    </div>
  );
}
