// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/priceEngine.test.ts
import {
  getSwapOutput,
  getPriceImpact,
  getPrice,
  getLPShares,
  getPositionValue,
  getMinimumReceived
} from '@/lib/priceEngine';

describe('priceEngine', () => {
  test('getSwapOutput calculates correct output amount', () => {
    // inputWithFee = 100 * (1 - 0.003) = 99.7
    // output = (99.7 * 1000) / (1000 + 99.7) = 99700 / 1099.7 ≈ 90.66
    const output = getSwapOutput(100, 1000, 1000);
    expect(output).toBeCloseTo(90.66, 1);
  });

  test('getSwapOutput with fee reduces output vs no fee', () => {
    const withFee = getSwapOutput(100, 1000, 1000, 0.003);
    const withoutFee = getSwapOutput(100, 1000, 1000, 0);
    expect(withFee).toBeLessThan(withoutFee);
  });

  test('getPriceImpact calculates correctly', () => {
    expect(getPriceImpact(100, 1000)).toBe(10);
  });

  test('getPrice calculates correctly', () => {
    expect(getPrice(500, 250)).toBe(2);
  });

  test('getLPShares returns sqrt when totalShares is 0', () => {
    expect(getLPShares(100, 100, 0, 0, 0)).toBe(100);
  });

  test('getLPShares returns min ratio when totalShares > 0', () => {
    // (10 / 100) * 1000 = 100
    // (20 / 200) * 1000 = 100
    expect(getLPShares(10, 20, 1000, 100, 200)).toBe(100);
  });

  test('getPositionValue returns correct amounts', () => {
    const value = getPositionValue(50, 100, 1000, 500);
    expect(value).toEqual({ xlm: 500, lqid: 250 });
  });

  test('getMinimumReceived calculates correctly', () => {
    expect(getMinimumReceived(100, 0.5)).toBe(99.5);
  });
});
