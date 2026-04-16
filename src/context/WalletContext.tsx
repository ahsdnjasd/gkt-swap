// /Users/parthkaran/Documents/claude_projects/liquidswap/src/context/WalletContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { getAccountAssets } from '@/lib/stellar';

interface WalletContextType {
  address: string | null;
  xlmBalance: number;
  lqidBalance: number;
  lpoolBalance: number;
  isInstalled: boolean;
  connecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  refreshBalance: (addr?: string) => Promise<any>;
  pollBalance: (maxAttempts?: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState(0);
  const [lqidBalance, setLqidBalance] = useState(0);
  const [lpoolBalance, setLpoolBalance] = useState(0);
  const [isInstalled, setIsInstalled] = useState(true);
  const [connecting, setConnecting] = useState(true);

  const refreshBalance = async (addr?: string) => {
    const targetAddr = addr || address;
    if (targetAddr) {
      try {
        const assets = await getAccountAssets(targetAddr);
        setXlmBalance(assets.xlm);
        setLqidBalance(assets.lqid);
        setLpoolBalance(assets.lpool);
        return assets;
      } catch (e) {
        console.error('Balance fetch failed:', e);
      }
    }
  };

  const pollBalance = (maxAttempts = 5) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const assets = await refreshBalance();
      // If we see a change in any balance, we can stop early, 
      // but for simplicity we'll just poll a few times
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 2000);
  };

  const connect = async () => {
    try {
      if (await isConnected()) {
        const { address: addr } = await requestAccess();
        setAddress(addr);
        await refreshBalance(addr);
        return addr;
      } else {
        setIsInstalled(false);
        return null;
      }
    } catch (e) {
      console.error('Connection failed:', e);
      return null;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setXlmBalance(0);
    setLqidBalance(0);
    setLpoolBalance(0);
  };

  // Initial check
  useEffect(() => {
    const init = async () => {
      try {
        if (await isConnected()) {
          const { address: addr } = await requestAccess();
          if (addr) {
            setAddress(addr);
            await refreshBalance(addr);
          }
        }
      } catch (e) {
        console.log('Not pre-connected');
      } finally {
        setConnecting(false);
      }
    };
    init();
  }, []);

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        xlmBalance, 
        lqidBalance,
        lpoolBalance,
        isInstalled, 
        connecting,
        connect, 
        disconnect, 
        refreshBalance,
        pollBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
