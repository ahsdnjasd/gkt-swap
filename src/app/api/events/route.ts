// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/events/route.ts
import { connectDB } from '@/lib/mongodb';
import { Pool } from '@/models/Pool';
import { getPrice } from '@/lib/priceEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      await connectDB();
      let interval: NodeJS.Timeout;

      const sendUpdate = async () => {
        try {
          const pool = await Pool.findOne({ poolId: process.env.NEXT_PUBLIC_POOL_ID });
          if (pool) {
            const price = getPrice(pool.xlmReserve, pool.lqidReserve);
            const data = JSON.stringify({
              price,
              tvl: pool.tvlXLM,
              volume: pool.volume24h,
              timestamp: new Date().toISOString(),
            });
            try {
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } catch (e) {
              // If enqueue fails, the controller is likely closed
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('SSE Update Error:', error);
          // Don't log the error if it's just a closed stream
          if (error instanceof TypeError && error.message.includes('closed')) {
            clearInterval(interval);
          }
        }
      };

      // Send initial update
      await sendUpdate();

      // Set up interval
      interval = setInterval(sendUpdate, 3000);

      // Clean up when the client disconnects or the stream is cancelled
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
    cancel() {
      // Handled by abort signal above, but good for completeness
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
