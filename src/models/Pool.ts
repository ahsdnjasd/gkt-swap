// /Users/parthkaran/Documents/claude_projects/liquidswap/src/models/Pool.ts
import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPool extends Document {
  poolId: string;
  xlmReserve: number;
  lqidReserve: number;
  totalLPShares: number;
  volume24h: number;
  fees24h: number;
  tvlXLM: number;
  lastUpdated: Date;
}

const PoolSchema = new Schema<IPool>({
  poolId: { type: String, required: true, unique: true },
  xlmReserve: { type: Number, required: true },
  lqidReserve: { type: Number, required: true },
  totalLPShares: { type: Number, required: true },
  volume24h: { type: Number, default: 0 },
  fees24h: { type: Number, default: 0 },
  tvlXLM: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export const Pool = models.Pool || model<IPool>('Pool', PoolSchema);
export default Pool;
