// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/api/setup/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Pool } from '@/models/Pool';

export async function POST(req: Request) {
  const adminKey = req.headers.get('x-admin-key');

  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { poolId, initialXLM, initialLQID } = body;

  const pool = await Pool.findOneAndUpdate(
    { poolId },
    {
      poolId,
      xlmReserve: parseFloat(initialXLM),
      lqidReserve: parseFloat(initialLQID),
      totalLPShares: Math.sqrt(parseFloat(initialXLM) * parseFloat(initialLQID)),
      tvlXLM: parseFloat(initialXLM) * 2,
      lastUpdated: new Date(),
    },
    { new: true, upsert: true }
  );

  return NextResponse.json({ success: true, poolId: pool.poolId });
}
