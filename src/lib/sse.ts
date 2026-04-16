// /Users/parthkaran/Documents/claude_projects/liquidswap/src/lib/sse.ts
import { useEffect, useState } from 'react';

export interface PriceFeedData {
  price: number;
  tvl: number;
  volume: number;
  timestamp: string;
}

export function usePriceFeed(onUpdate: (data: PriceFeedData) => void): void {
  useEffect(() => {
    let es: EventSource;

    const connect = () => {
      es = new EventSource('/api/events');

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('SSE JSON parse error:', error);
        }
      };

      es.onerror = () => {
        console.error('SSE connection error. Attempting reconnect in 5s...');
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (es) es.close();
    };
  }, [onUpdate]);
}

export function useConnectionStatus(): 'connecting' | 'connected' | 'error' {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    let es: EventSource;

    const connect = () => {
      es = new EventSource('/api/events');

      es.onopen = () => {
        setStatus('connected');
      };

      es.onerror = () => {
        setStatus('error');
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (es) es.close();
    };
  }, []);

  return status;
}
