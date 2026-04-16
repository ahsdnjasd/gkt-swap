// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/utils.test.ts
import {
  formatXLM,
  truncateAddress,
  formatPercent,
  timeAgo,
  stellarExpertTx
} from '@/lib/utils';

describe('utils', () => {
  test('formatXLM formats zero and non-zero amounts', () => {
    expect(formatXLM(1234.567)).toBe("1,234.57 XLM");
    expect(formatXLM(0)).toBe("0.00 XLM");
  });

  test('truncateAddress shortens a public key', () => {
    const address = "GABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";
    const truncated = truncateAddress(address);
    expect(truncated).toContain('...');
    expect(truncated.length).toBeLessThan(address.length);
  });

  test('formatPercent formats values correctly', () => {
    expect(formatPercent(1.234)).toBe("1.23%");
  });

  test('timeAgo returns non-empty string', () => {
    const res = timeAgo(new Date());
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(0);
  });

  test('stellarExpertTx returns valid URL', () => {
    const hash = 'abc123';
    const url = stellarExpertTx(hash);
    expect(url).toContain('stellar.expert');
    expect(url).toContain(hash);
  });
});
