// /Users/parthkaran/Documents/claude_projects/liquidswap/src/models/LPPosition.ts
import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ILPPosition extends Document {
  userAddress: string;
  lpShares: number;
  xlmDeposited: number;
  lqidDeposited: number;
  entryTimestamp: Date;
  lastUpdated: Date;
}

const LPPositionSchema = new Schema<ILPPosition>({
  userAddress: { type: String, required: true, unique: true },
  lpShares: { type: Number, default: 0 },
  xlmDeposited: { type: Number, default: 0 },
  lqidDeposited: { type: Number, default: 0 },
  entryTimestamp: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

export const LPPosition = models.LPPosition || model<ILPPosition>('LPPosition', LPPositionSchema);
export default LPPosition;
