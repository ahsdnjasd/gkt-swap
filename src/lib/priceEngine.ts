// /Users/parthkaran/Documents/claude_projects/liquidswap/src/lib/priceEngine.ts

/**
 * Calculates the output amount of a swap using the constant product formula (x * y = k).
 * outputAmount = (inputWithFee * outputReserve) / (inputReserve + inputWithFee)
 */
export function getSwapOutput(
  inputAmount: number,
  inputReserve: number,
  outputReserve: number,
  feePct = 0.003
): number {
  if (inputReserve <= 0 || outputReserve <= 0) return 0;
  const inputWithFee = inputAmount * (1 - feePct);
  const outputAmount = (inputWithFee * outputReserve) / (inputReserve + inputWithFee);
  return outputAmount;
}

/**
 * Calculates price impact as percentage.
 * Formula: (inputAmount / inputReserve) * 100
 */
export function getPriceImpact(inputAmount: number, inputReserve: number): number {
  if (inputReserve <= 0) return 0;
  return (inputAmount / inputReserve) * 100;
}

/**
 * Calculates the current price of GKT in terms of XLM.
 * Formula: xlmReserve / gktReserve
 */
export function getPrice(xlmReserve: number, gktReserve: number): number {
  if (gktReserve <= 0) return 0;
  return xlmReserve / gktReserve;
}

/**
 * Calculates the amount of LP shares to mint for a given deposit.
 */
export function getLPShares(
  xlmAmount: number,
  gktAmount: number,
  totalShares: number,
  xlmReserve: number,
  gktReserve: number
): number {
  if (totalShares === 0) {
    return Math.sqrt(xlmAmount * gktAmount);
  } else {
    const xlmShare = (xlmAmount / xlmReserve) * totalShares;
    const gktShare = (gktAmount / gktReserve) * totalShares;
    return Math.min(xlmShare, gktShare);
  }
}

/**
 * Calculates the underlying token value of a given amount of LP shares.
 */
export function getPositionValue(
  lpShares: number,
  totalShares: number,
  xlmReserve: number,
  gktReserve: number
): { xlm: number; gkt: number } {
  if (totalShares === 0) return { xlm: 0, gkt: 0 };
  const shareRatio = lpShares / totalShares;
  return {
    xlm: xlmReserve * shareRatio,
    gkt: gktReserve * shareRatio,
  };
}

/**
 * Calculates the minimum amount received given a slippage tolerance.
 * Formula: outputAmount * (1 - slippage / 100)
 */
export function getMinimumReceived(outputAmount: number, slippage: number): number {
  return outputAmount * (1 - slippage / 100);
}
