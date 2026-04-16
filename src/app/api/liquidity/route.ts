// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/liquidity/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { LPPosition } from '@/models/LPPosition';
import { Pool } from '@/models/Pool';
import { cache } from '@/lib/cache';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const cacheKey = `position_${address}`;
  const cachedPosition = cache.get(cacheKey);
  if (cachedPosition) return NextResponse.json(cachedPosition);

  const position = await LPPosition.findOne({ userAddress: address });
  if (position) cache.set(cacheKey, position, 60);

  return NextResponse.json(position || { lpShares: 0, xlmDeposited: 0, lqidDeposited: 0 });
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const { userAddress, action, xlmAmount, lqidAmount, lpShares, txHash } = body;

  const update = action === 'add' 
    ? {
        $inc: {
          lpShares: parseFloat(lpShares),
          xlmDeposited: parseFloat(xlmAmount),
          lqidDeposited: parseFloat(lqidAmount),
        },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { entryTimestamp: new Date() }
      }
    : {
        $inc: {
          lpShares: -parseFloat(lpShares),
          xlmDeposited: -parseFloat(xlmAmount),
          lqidDeposited: -parseFloat(lqidAmount),
        },
        $set: { lastUpdated: new Date() }
      };

  const position = await LPPosition.findOneAndUpdate(
    { userAddress },
    update,
    { new: true, upsert: true }
  );

  // Update Pool reserves
  const poolUpdate = action === 'add'
    ? { $inc: { xlmReserve: parseFloat(xlmAmount), lqidReserve: parseFloat(lqidAmount), totalLPShares: parseFloat(lpShares) } }
    : { $inc: { xlmReserve: -parseFloat(xlmAmount), lqidReserve: -parseFloat(lqidAmount), totalLPShares: -parseFloat(lpShares) } };

  await Pool.findOneAndUpdate(
    { poolId: process.env.NEXT_PUBLIC_POOL_ID },
    { ...poolUpdate, $set: { lastUpdated: new Date() } }
  );

  cache.bust('pool');
  cache.bust(`position_${userAddress}`);

  return NextResponse.json(position);
}
