import { connectDB } from '@/lib/mongodb';
import { Pool } from '@/models/Pool';
import { getPrice } from '@/lib/priceEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let interval: NodeJS.Timeout | undefined;

      const sendUpdate = async () => {
        try {
          await connectDB();
          const pool = await Pool.findOne({ poolId: process.env.NEXT_PUBLIC_POOL_ID });
          
          let data;
          if (pool) {
            const price = getPrice(pool.xlmReserve, pool.gktReserve);
            data = JSON.stringify({
              price,
              tvl: pool.tvlXLM,
              volume: pool.volume24h,
              timestamp: new Date().toISOString(),
            });
          } else {
            // Send heartbeat even if pool doesn't exist
            data = JSON.stringify({
              status: 'initializing',
              timestamp: new Date().toISOString(),
            });
          }

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error('SSE Update Error:', error);
          if (interval) clearInterval(interval);
          try { controller.close(); } catch (e) {}
        }
      };

      // Send initial update
      await sendUpdate();

      // Set up interval
      interval = setInterval(sendUpdate, 5000);

      req.signal.addEventListener('abort', () => {
        if (interval) clearInterval(interval);
        try { controller.close(); } catch (e) {}
      });
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
