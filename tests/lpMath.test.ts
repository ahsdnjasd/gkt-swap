// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/lpMath.test.ts
import { getLPShares, getPositionValue } from '@/lib/priceEngine';

describe('LP Math', () => {
  test('getPositionValue updates correctly', () => {
    const value = getPositionValue(50, 100, 1000, 500);
    expect(value).toEqual({ xlm: 500, lqid: 250 });
  });

  test('getLPShares handles zero case gracefully', () => {
    const res = getLPShares(0, 0, 0, 0, 0);
    expect(res).toBe(0);
  });
});
