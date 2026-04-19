// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/PoolStats.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PoolStats from '@/components/PoolStats';

describe('PoolStats', () => {
  test('renders with null pool (loading state shows skeletons)', () => {
    const { container } = render(<PoolStats pool={null} price={0} loading={true} />);
    // Check for animate-pulse which is in our LoadingSkeleton
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  test('renders with mock pool data shows TVL', () => {
    const mockPool = {
      poolId: '123',
      xlmReserve: 1000,
      lqidReserve: 500,
      totalLPShares: 1000,
      volume24h: 100,
      fees24h: 0.3,
      tvlXLM: 2000,
      lastUpdated: new Date()
    } as any;
    
    render(<PoolStats pool={mockPool} price={2} loading={false} />);
    expect(screen.getByText(/2,000.00 XLM/i)).toBeInTheDocument();
  });
});
