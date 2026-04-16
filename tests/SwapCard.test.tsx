// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/SwapCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SwapCard from '@/components/SwapCard';

jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn().mockResolvedValue(false),
  getPublicKey: jest.fn().mockResolvedValue(''),
  requestAccess: jest.fn()
}));

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({})
});

describe('SwapCard', () => {
  test('renders without crashing', () => {
    render(<SwapCard userAddress="" poolStats={null} />);
    expect(screen.getByText(/Swap Tokens/i)).toBeInTheDocument();
  });

  test('shows Swap button', () => {
    render(<SwapCard userAddress="" poolStats={null} />);
    const buttons = screen.getAllByRole('button');
    const swapButton = buttons.find(b => b.textContent?.includes('Swap'));
    expect(swapButton).toBeDefined();
  });
});
