// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/price/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Pool } from '@/models/Pool';
import { cache } from '@/lib/cache';

export async function GET() {
  await connectDB();

  let pool = cache.get('pool');
  if (!pool) {
    pool = await Pool.findOne({ poolId: process.env.NEXT_PUBLIC_POOL_ID });
    if (pool) cache.set('pool', pool, 30);
  }

  if (!pool) {
    return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
  }

  const price = pool.xlmReserve / pool.lqidReserve;

  return NextResponse.json({
    price,
    xlmReserve: pool.xlmReserve,
    lqidReserve: pool.lqidReserve,
    timestamp: Date.now(),
  });
}
