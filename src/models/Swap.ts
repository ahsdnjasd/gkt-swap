// /Users/parthkaran/Documents/claude_projects/liquidswap/src/models/Swap.ts
import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISwap extends Document {
  userAddress: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  priceImpact: number;
  txHash: string;
  timestamp: Date;
  slippage: number;
}

const SwapSchema = new Schema<ISwap>({
  userAddress: { type: String, required: true },
  fromToken: { type: String, required: true },
  toToken: { type: String, required: true },
  fromAmount: { type: Number, required: true },
  toAmount: { type: Number, required: true },
  priceImpact: { type: Number, required: true },
  txHash: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  slippage: { type: Number, required: true },
});

export const SwapModel = models.Swap || model<ISwap>('Swap', SwapSchema);
export default SwapModel;
