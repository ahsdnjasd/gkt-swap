// /Users/parthkaran/Documents/claude_projects/liquidswap/tests/sse.test.ts
import { renderHook } from '@testing-library/react';
import { usePriceFeed } from '@/lib/sse';

describe('usePriceFeed', () => {
  let mockEventSource: any;

  beforeEach(() => {
    mockEventSource = {
      close: jest.fn(),
      onmessage: null,
      onerror: null,
    };
    (global as any).EventSource = jest.fn(() => mockEventSource);
  });

  test('creates EventSource on mount and closes on unmount', () => {
    const onUpdate = jest.fn();
    const { unmount } = renderHook(() => usePriceFeed(onUpdate));

    expect(global.EventSource).toHaveBeenCalledWith('/api/events');
    
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
  });
});
