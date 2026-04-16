// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/slippage.test.ts
describe('Slippage Math', () => {
  const calcMinReceived = (amount: number, slipPct: number) => amount * (1 - slipPct / 100);

  test('calculates minimum received correctly', () => {
    expect(calcMinReceived(100, 0.5)).toBe(99.5);
    expect(calcMinReceived(200, 1)).toBe(198);
  });
});
