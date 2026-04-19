// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/swap/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { SwapModel } from '@/models/Swap';
import { Pool } from '@/models/Pool';
import { cache } from '@/lib/cache';
import { verifySwapTx } from '@/lib/stellar';
import { CreateSwapInput } from '@/types';

export async function GET() {
  await connectDB();

  const cachedSwaps = cache.get('swaps');
  if (cachedSwaps) {
    return NextResponse.json(cachedSwaps);
  }

  const swaps = await SwapModel.find().sort({ timestamp: -1 }).limit(20);
  cache.set('swaps', swaps, 15);
  return NextResponse.json(swaps);
}

export async function POST(req: Request) {
  await connectDB();
  const body: CreateSwapInput = await req.json();
  const { userAddress, fromToken, toToken, fromAmount, toAmount, txHash, slippage } = body;

  // 1. Verify transaction on-chain
  const verification = await verifySwapTx(txHash);
  if (!verification.valid) {
    return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
  }

  // 2. Save swap record
  const swap = await SwapModel.create({
    userAddress,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    priceImpact: 0, // Simplified
    txHash,
    slippage,
  });

  // 3. Update pool volume and fees
  const fee = fromAmount * 0.003;
  await Pool.findOneAndUpdate(
    { poolId: process.env.NEXT_PUBLIC_POOL_ID },
    {
      $inc: {
        volume24h: fromAmount,
        fees24h: fee,
      },
      lastUpdated: new Date(),
    }
  );

  // 4. Bust caches
  cache.bust('swaps');
  cache.bust('pool');

  return NextResponse.json(swap);
}
