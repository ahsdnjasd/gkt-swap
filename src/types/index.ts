// /Users/parthkaran/Documents/claude_projects/liquidswap/src/types/index.ts

export type TokenCode = 'XLM' | 'GKT' | 'LPOOL';

export interface Token {
  code: TokenCode;
  balance?: number;
}

export interface Pool {
  poolId: string;
  xlmReserve: number;
  gktReserve: number;
  totalLPShares: number;
  volume24h: number;
  fees24h: number;
  tvlXLM: number;
  lastUpdated: Date;
}

export interface Swap {
  userAddress: string;
  fromToken: TokenCode;
  toToken: TokenCode;
  fromAmount: number;
  toAmount: number;
  priceImpact: number;
  txHash: string;
  timestamp: Date;
  slippage: number;
}

export interface LPPosition {
  userAddress: string;
  lpShares: number;
  xlmDeposited: number;
  gktDeposited: number;
  entryTimestamp: Date;
  lastUpdated: Date;
}

export interface SwapQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  minimumReceived: number;
  fee: number;
}

export interface PriceFeedData {
  price: number;
  tvl: number;
  volume: number;
  timestamp: string;
}

export interface AccountAssets {
  xlm: number;
  gkt: number;
  lpool: number;
  hasGktTrust: boolean;
  hasLpoolTrust: boolean;
}

export interface TxStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export interface CreateSwapInput {
  userAddress: string;
  fromToken: TokenCode;
  toToken: TokenCode;
  fromAmount: number;
  toAmount: number;
  txHash: string;
  slippage: number;
}
