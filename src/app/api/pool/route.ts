// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/pool/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { Pool as PoolModel } from '@/models/Pool';
import { cache } from '@/lib/cache';
import { getCurrentPoolId } from '@/lib/stellar';

export async function GET() {
  await connectDB();

  const cachedPool = cache.get('pool');
  if (cachedPool) {
    return NextResponse.json(cachedPool);
  }

  const poolId = getCurrentPoolId();
  let pool = await PoolModel.findOne({ poolId });
  
  if (!pool) {
    // Bootstrap: Create a default pool record if none exists
    pool = await PoolModel.create({
      poolId,
      xlmReserve: 0,
      lqidReserve: 0,
      totalLPShares: 0,
      volume24h: 0,
      fees24h: 0,
      tvlXLM: 0,
      lastUpdated: new Date()
    });
  }

  cache.set('pool', pool, 30);
  return NextResponse.json(pool);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const { xlmReserve, lqidReserve, totalLPShares, volume24h } = body;

  const poolId = getCurrentPoolId();
  const pool = await PoolModel.findOneAndUpdate(
    { poolId },
    {
      xlmReserve,
      lqidReserve,
      totalLPShares,
      volume24h,
      tvlXLM: xlmReserve * 2, // Simplified TVL calculation
      lastUpdated: new Date(),
    },
    { new: true, upsert: true }
  );

  cache.bust('pool');
  return NextResponse.json(pool);
}
