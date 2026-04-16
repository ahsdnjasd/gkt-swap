import { useState, useCallback, useMemo } from 'react';

export interface Token {
  symbol: string;
  name: string;
  balance: number;
}

export const TOKENS: Record<string, Token> = {
  XLM: { symbol: 'XLM', name: 'Stellar Lumens', balance: 125.40 },
  USDC: { symbol: 'USDC', name: 'USD Coin', balance: 1000.00 },
  ARS: { symbol: 'ARS', name: 'Argentine Peso', balance: 50000.00 },
};

export function usePool() {
  // Mock reserves in the pool
  const [reserves, setReserves] = useState({
    XLM: 10000,
    USDC: 10000,
    ARS: 500000,
  });

  const getAmountOut = useCallback((amountIn: number, fromSymbol: string, toSymbol: string) => {
    if (amountIn <= 0) return 0;
    
    // x * y = k
    // out = (res_out * in) / (res_in + in)
    const reserveIn = (reserves as any)[fromSymbol];
    const reserveOut = (reserves as any)[toSymbol];

    if (!reserveIn || !reserveOut) return 0;

    const amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
    
    // Apply a small mock fee 0.3%
    return amountOut * 0.997;
  }, [reserves]);

  const getPriceImpact = useCallback((amountIn: number, fromSymbol: string) => {
    if (amountIn <= 0) return 0;
    const reserveIn = (reserves as any)[fromSymbol];
    if (!reserveIn) return 0;
    
    // Simplified price impact: amountIn / reserveIn
    return (amountIn / reserveIn) * 100;
  }, [reserves]);

  return {
    reserves,
    getAmountOut,
    getPriceImpact,
    tokens: TOKENS
  };
}
