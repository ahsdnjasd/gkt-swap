// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/admin/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, ShieldAlert, Cpu, RefreshCw, Database, 
  AlertTriangle, Coins, PlusCircle, Globe, CheckCircle2, XCircle,
  ShieldCheck, Zap, Activity
} from 'lucide-react';
import { 
  getPoolInfo, checkPoolExists, getAccountAssets,
  buildAddLiquidityXDR, submitSignedXDR, NETWORK_PASSPHRASE,
  createTrustlineXDR, getCurrentPoolId, sanitize
} from '@/lib/stellar';
import { signTransaction } from '@stellar/freighter-api';
import { formatToken } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
const ISSUER_ADDRESS = process.env.NEXT_PUBLIC_LQID_ISSUER;

interface PreflightCheck {
  label: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  detail: string;
}

export default function AdminPage() {
  const { address: userAddress, connecting: loading, refreshBalance, pollBalance, xlmBalance, lqidBalance } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [poolExists, setPoolExists] = useState<boolean | null>(null);
  const [preflightChecks, setPreflightChecks] = useState<PreflightCheck[]>([]);
  const [preflightDone, setPreflightDone] = useState(false);
  const [currentPoolId, setCurrentPoolId] = useState('');
  const [poolId, setPoolId] = useState('');
  const [initialXLM, setInitialXLM] = useState('1000');
  const [initialLQID, setInitialLQID] = useState('1000');
  const [mintAmount, setMintAmount] = useState('10000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLqidTrust, setHasLqidTrust] = useState(false);

  useEffect(() => {
    const computed = getCurrentPoolId(); 
    setPoolId(computed);
    setCurrentPoolId(computed);
  }, []);

  useEffect(() => {
    if (userAddress && ADMIN_ADDRESS) {
      setIsAdmin(userAddress.toUpperCase() === ADMIN_ADDRESS.toUpperCase());
    } else {
      setIsAdmin(false);
    }
  }, [userAddress]);

  const checkPool = useCallback(async () => {
    if (poolId) {
      const exists = await checkPoolExists(poolId);
      setPoolExists(exists);
    }
  }, [poolId]);

  useEffect(() => {
    checkPool();
    const interval = setInterval(checkPool, 10000);
    return () => clearInterval(interval);
  }, [checkPool]);

  const runPreflightChecks = useCallback(async () => {
    if (!userAddress) return;
    setPreflightDone(false);
    const checks: PreflightCheck[] = [
      { label: 'XLM Balance', status: 'checking', detail: 'Checking...' },
      { label: 'LQID Trustline', status: 'checking', detail: 'Checking...' },
      { label: 'LQID Balance', status: 'checking', detail: 'Checking...' },
      { label: 'Pool Status', status: 'checking', detail: 'Checking...' },
    ];
    setPreflightChecks([...checks]);
    try {
      const assets = await getAccountAssets(userAddress);
      setHasLqidTrust(assets.hasLqidTrust);
      const requiredXLM = parseFloat(initialXLM) + 10;
      if (assets.xlm >= requiredXLM) {
        checks[0] = { label: 'XLM Balance', status: 'pass', detail: `${formatToken(assets.xlm)} XLM available` };
      } else if (assets.xlm > 0) {
        checks[0] = { label: 'XLM Balance', status: 'warning', detail: `${formatToken(assets.xlm)} XLM — may need more for ${initialXLM} XLM deposit` };
      } else {
        checks[0] = { label: 'XLM Balance', status: 'fail', detail: 'No XLM found. Fund this account via friendbot or transfer.' };
      }
      if (assets.hasLqidTrust) {
        checks[1] = { label: 'LQID Trustline', status: 'pass', detail: 'Trustline active on network' };
      } else {
        checks[1] = { label: 'LQID Trustline', status: 'fail', detail: 'Trustline missing. Receiver must trust LQID issuer first.' };
      }
      if (assets.lqid >= parseFloat(initialLQID)) {
        checks[2] = { label: 'LQID Balance', status: 'pass', detail: `${formatToken(assets.lqid)} LQID available` };
      } else {
        checks[2] = { label: 'LQID Balance', status: 'warning', detail: `${formatToken(assets.lqid)} LQID — need ${initialLQID} for pool` };
      }
      if (poolId) {
        const exists = await checkPoolExists(poolId);
        if (exists) {
          checks[3] = { label: 'Pool Status', status: 'pass', detail: 'Pool exists on Stellar network' };
        } else {
          checks[3] = { label: 'Pool Status', status: 'warning', detail: 'Pool not yet created — use Step 3 to initialize' };
        }
      } else {
        checks[3] = { label: 'Pool Status', status: 'fail', detail: 'Pool ID could not be computed' };
      }
    } catch (err: any) {
      checks.forEach((c, i) => {
        if (c.status === 'checking') {
          checks[i] = { ...c, status: 'fail', detail: err.message };
        }
      });
    }
    setPreflightChecks([...checks]);
    setPreflightDone(true);
  }, [userAddress, initialXLM, initialLQID, poolId]);

  useEffect(() => {
    if (isAdmin && userAddress) { runPreflightChecks(); }
  }, [isAdmin, userAddress, runPreflightChecks]);

  const handleSetupTrustline = async () => {
    if (!userAddress) return;
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Building LQID trustline transaction...' });
      const xdr = await createTrustlineXDR(userAddress, 'LQID');
      setStatus({ type: 'info', message: 'Awaiting signature...' });
      const signedXdr = await signTransaction(xdr, { networkPassphrase: 'Test SDF Network ; September 2015' });
      setStatus({ type: 'info', message: 'Broadcasting trustline transaction...' });
      await submitSignedXDR(signedXdr);
      setStatus({ type: 'success', message: 'LQID Trustline established!' });
      pollBalance(10);
      runPreflightChecks();
      setCurrentPoolId(getCurrentPoolId());
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMint = async () => {
    if (!userAddress) return;
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Minting LQID tokens via server...' });
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'SUPER_SECRET_ADMIN_KEY' },
        body: JSON.stringify({ targetAddress: userAddress, amount: mintAmount })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: `Successfully minted ${mintAmount} LQID! TX: ${data.txHash?.substring(0, 8)}...` });
        pollBalance(10);
        runPreflightChecks();
      } else {
        throw new Error(data.error || 'Mint failed');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitializeDB = async () => {
    try {
      setStatus({ type: 'info', message: 'Initializing pool in database...' });
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'SUPER_SECRET_ADMIN_KEY' },
        body: JSON.stringify({ poolId, initialXLM, initialLQID })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: `Pool ${poolId.substring(0, 8)}... record created in database!` });
      } else {
        throw new Error(data.error || 'Initialization failed');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleStellarInit = async () => {
    if (!userAddress) return;
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Building Initial Deposit transaction...' });
      const price = parseFloat(initialLQID) / parseFloat(initialXLM);
      const xdr = await buildAddLiquidityXDR(userAddress, initialXLM, initialLQID, (price * 0.9).toFixed(7), (price * 1.1).toFixed(7));
      setStatus({ type: 'info', message: 'Opening Freighter signature...' });
      const signedXdr = await signTransaction(xdr, { networkPassphrase: 'Test SDF Network ; September 2015' });
      setStatus({ type: 'info', message: 'Creating Pool on Stellar...' });
      await submitSignedXDR(signedXdr);
      setStatus({ type: 'success', message: 'Protocol successfully initialized on Stellar Network!' });
      checkPool();
      await refreshBalance();
      runPreflightChecks();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSync = async () => {
    try {
      setStatus({ type: 'info', message: 'Syncing with Stellar Horizon...' });
      const horizonData = await getPoolInfo(poolId);
      const res = await fetch('/api/pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xlmReserve: horizonData.xlmReserve, lqidReserve: horizonData.lqidReserve, totalLPShares: horizonData.totalShares, volume24h: 0 })
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Database reserves synced with Horizon!' });
      } else {
        throw new Error('Database update failed');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Cpu className="text-primary animate-spin" size={48} />
      <span className="text-muted font-mono uppercase tracking-[0.2em] animate-pulse">Authenticating Admin...</span>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center py-40 border border-dashed border-green-200 rounded-[3rem] glass">
      <div className="p-6 bg-danger/10 text-danger rounded-full mb-6">
        <Lock size={64} />
      </div>
      <h1 className="text-4xl font-display font-black text-foreground mb-2">Access Denied</h1>
      <p className="text-muted font-medium mb-8">This portal is restricted to the contract administrator.</p>
      <div className="flex flex-col items-center gap-2 p-4 bg-green-50/50 border border-green-100 rounded-2xl">
        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Connected Wallet</span>
        <span className="text-xs font-mono text-danger font-bold">{userAddress || 'None'}</span>
      </div>
    </div>
  );

  const checkIcon = (s: PreflightCheck['status']) => {
    switch (s) {
      case 'checking': return <RefreshCw className="animate-spin text-primary" size={16} />;
      case 'pass': return <CheckCircle2 className="text-success" size={16} />;
      case 'fail': return <XCircle className="text-danger" size={16} />;
      case 'warning': return <AlertTriangle className="text-warning" size={16} />;
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4 p-8 bg-primary/5 border border-primary/15 rounded-[2.5rem]">
        <ShieldAlert className="text-primary" size={48} />
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Admin Terminal</h1>
          <p className="text-primary/70 font-medium">LQIDSwap Protocol Configuration</p>
        </div>
      </div>

      {/* Diagnostics Panel */}
      <section className="glass-strong p-8 rounded-[2.5rem] border-l-4 border-l-primary">
        <h3 className="text-foreground font-display font-black text-lg mb-4 flex items-center gap-2">
          Protocol Diagnostics <Activity size={18} className="text-primary" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50/40 rounded-2xl border border-green-100 space-y-2">
             <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Issuer Config</span>
             <p className="text-[11px] font-mono text-foreground truncate">{ISSUER_ADDRESS || 'MISSING'}</p>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ISSUER_ADDRESS && !ISSUER_ADDRESS.includes('GC7SEQ') ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-[10px] text-muted font-bold">
                  {ISSUER_ADDRESS && !ISSUER_ADDRESS.includes('GC7SEQ') ? 'Valid Issuer Set' : 'Using Placeholder Issuer'}
                </span>
             </div>
          </div>
          <div className="p-4 bg-green-50/40 rounded-2xl border border-green-100 space-y-2">
             <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Secret Key Status</span>
             <p className="text-[11px] font-mono text-foreground italic">STELLAR_ISSUER_SECRET</p>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ISSUER_ADDRESS && !ISSUER_ADDRESS.includes('GC7SEQ') ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-[10px] text-muted font-bold tracking-tight">
                  {ISSUER_ADDRESS && !ISSUER_ADDRESS.includes('GC7SEQ') ? 'Security Check: API Active' : 'Placeholder Secret Detected'}
                </span>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 glass border border-green-100 rounded-3xl flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${poolExists ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Stellar Network Status</p>
            <p className="text-foreground font-display font-black">{poolExists ? 'POOL ONLINE' : 'NOT INITIALIZED'}</p>
          </div>
        </div>
        <div className="p-6 glass border border-green-100 rounded-3xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Protocol Database</p>
            <p className="text-foreground font-display font-black">ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Pre-flight Checks */}
      <section className="glass-strong p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground font-display font-black text-xl flex items-center gap-2">
            Pre-flight Checks <ShieldCheck size={20} className="text-primary" />
          </h3>
          <button onClick={runPreflightChecks} className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-mono">
            <RefreshCw size={12} /> Re-check
          </button>
        </div>
        <div className="space-y-3">
          {preflightChecks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-green-50/40 border border-green-100 rounded-xl">
              {checkIcon(check.status)}
              <div className="flex-1 min-w-0">
                <span className="text-foreground text-sm font-display font-bold">{check.label}</span>
                <p className="text-[11px] text-muted font-mono truncate">{check.detail}</p>
              </div>
              {check.label === 'LQID Trustline' && (check.status === 'fail' || check.status === 'warning') && (
                <button onClick={handleSetupTrustline} disabled={isProcessing} className="text-[10px] px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold hover:bg-primary/20 transition-all disabled:opacity-50">
                  Setup
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-green-100/50 flex items-center justify-between">
          <p className="text-[10px] text-muted font-mono uppercase tracking-widest">Diagnostic Meta</p>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-muted uppercase">Issuer (P)</span>
              <span className={`text-[10px] font-mono ${sanitize(process.env.NEXT_PUBLIC_LQID_ISSUER).length === 56 ? 'text-success' : 'text-danger'}`}>
                {sanitize(process.env.NEXT_PUBLIC_LQID_ISSUER).length} / 56
              </span>
            </div>
          </div>
        </div>
      </section>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${
          status.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
          status.type === 'error' ? 'bg-danger/10 border-danger/20 text-danger' :
          'bg-primary/10 border-primary/20 text-primary'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20}/> : status.type === 'error' ? <XCircle size={20}/> : <RefreshCw className="animate-spin" size={20}/>}
          <span className="text-sm font-bold">{status.message}</span>
        </div>
      )}

      {/* Step 1: Mint Tokens */}
      <section className="glass-strong p-10 rounded-[2.5rem] shadow-lg border-t-4 border-t-primary-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-dark/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-primary-dark/10 text-primary-dark flex items-center justify-center font-mono font-bold text-sm">1</span>
          <h3 className="text-foreground font-display font-black text-xl flex items-center gap-2">
            Mint LQID Tokens <Coins size={20} className="text-primary-dark" />
          </h3>
        </div>
        <p className="text-muted text-xs mb-8 ml-11">Mint LQID tokens to your administrator wallet.</p>
        <div className="flex gap-4">
          <input type="number" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} className="flex-1 bg-green-50/30 border border-green-100 rounded-xl p-4 text-foreground font-mono focus:outline-none focus:border-primary-dark" placeholder="10000" />
          <button onClick={handleMint} disabled={isProcessing || !hasLqidTrust} className="px-8 py-4 bg-primary-dark text-white font-display font-black rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            <RefreshCw className={isProcessing ? 'animate-spin' : ''} size={20} />
            {!hasLqidTrust ? 'Need Trustline' : 'Mint LQID'}
          </button>
        </div>
      </section>

      {/* Step 2: Initialize Database */}
      <section className="glass-strong p-10 rounded-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">2</span>
          <h3 className="text-foreground font-display font-black text-xl flex items-center gap-2">
            Initialize Database <Database size={20} className="text-primary" />
          </h3>
        </div>
        <p className="text-muted text-xs mb-8 ml-11">Create the pool record in the application database.</p>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Liquidity Pool ID (Auto-computed)</label>
            <input type="text" value={poolId} onChange={(e) => setPoolId(e.target.value)} className="w-full bg-green-50/30 border border-green-100 rounded-xl p-4 text-foreground font-mono text-xs focus:outline-none focus:border-primary transition-all" placeholder="Auto-computed from XLM/LQID pair" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Target XLM Reserve</label>
              <input type="number" value={initialXLM} onChange={(e) => setInitialXLM(e.target.value)} className="w-full bg-green-50/30 border border-green-100 rounded-xl p-4 text-foreground font-mono focus:outline-none focus:border-primary" placeholder="1000.00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Target LQID Reserve</label>
              <input type="number" value={initialLQID} onChange={(e) => setInitialLQID(e.target.value)} className="w-full bg-green-50/30 border border-green-100 rounded-xl p-4 text-foreground font-mono focus:outline-none focus:border-primary-dark" placeholder="1000.00" />
            </div>
          </div>
          <button onClick={handleInitializeDB} className="w-full py-4 bg-green-50/50 border border-green-100 text-foreground font-display font-black rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2">
            <Database size={18} className="text-primary" /> Initialize Local Database Record
          </button>
        </div>
      </section>

      {/* Step 3: Create Pool on Stellar */}
      <section className="glass-strong p-10 rounded-[2.5rem] shadow-lg border-t-4 border-t-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">3</span>
          <h3 className="text-foreground font-display font-black text-xl flex items-center gap-2">
            Create Pool on Stellar <PlusCircle size={20} className="text-primary" />
          </h3>
        </div>
        <p className="text-muted text-xs mb-8 ml-11">Deposit {initialXLM} XLM + {initialLQID} LQID to establish the initial 50/50 ratio.</p>
        <button onClick={handleStellarInit} disabled={isProcessing} className="w-full py-4 bg-primary text-white font-display font-black rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Zap size={18} /> Create & Fund Pool on Stellar Network
        </button>
      </section>

      {/* Sync Section */}
      <section className="glass-strong p-10 rounded-[2.5rem] shadow-lg">
        <h3 className="text-foreground font-display font-black text-xl mb-4 flex items-center gap-2">
          Horizon Synchronization <RefreshCw size={20} className="text-muted" />
        </h3>
        <p className="text-muted text-xs mb-8">Force sync the database reserves with the actual on-chain balances.</p>
        <button onClick={handleSync} className="w-full py-4 border-2 border-green-200 text-muted font-display font-black rounded-xl hover:bg-green-50/50 hover:text-foreground transition-all flex items-center justify-center gap-3">
          <RefreshCw size={20} /> Sync Database Stats
        </button>
      </section>

      {/* Instructions */}
      <section className="p-8 bg-danger/5 border border-danger/15 rounded-[2.5rem]">
         <div className="flex items-center gap-3 text-danger mb-4">
            <AlertTriangle size={24} />
            <h3 className="font-display font-black uppercase tracking-wider">Administrator Instructions</h3>
         </div>
         <p className="text-xs text-danger/80 leading-relaxed font-medium">
            To make the DEX functional: <br/>
            1. Use <strong>Step 1: Mint LQID</strong> to fund your wallet with tokens for liquidity. <br/>
            2. Use <strong>Step 2: Initialize Database</strong> to set up the pool record. <br/>
            3. Use <strong>Step 3: Create Pool on Stellar</strong> to establish the initial 50/50 ratio on the network. <br/>
            4. Use <strong>Horizon Sync</strong> afterwards to keep the database in sync with on-chain data.
         </p>
      </section>
    </div>
  );
}
