import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDown, Settings, ChevronDown, Wallet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePool } from '../hooks/usePool';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SwapCard: React.FC = () => {
  const { getAmountOut, getPriceImpact, tokens } = usePool();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  
  const [fromToken, setFromToken] = useState(tokens.XLM);
  const [toToken, setToToken] = useState(tokens.USDC);
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  // Auto-calculate output amount
  useEffect(() => {
    const val = parseFloat(fromAmount);
    if (!isNaN(val) && val > 0) {
      const out = getAmountOut(val, fromToken.symbol, toToken.symbol);
      setToAmount(out.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, getAmountOut]);

  const priceImpact = useMemo(() => {
    const val = parseFloat(fromAmount);
    return getPriceImpact(val || 0, fromToken.symbol);
  }, [fromAmount, fromToken, getPriceImpact]);

  const handleSwapToggle = () => {
    const prevFrom = fromToken;
    setFromToken(toToken);
    setToToken(prevFrom);
    setFromAmount(toAmount);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(r => setTimeout(r, 1500));
    setIsConnected(true);
    setIsConnecting(false);
  };

  const handleSwapAction = async () => {
    setIsSwapping(true);
    // Simulate transaction delay
    await new Promise(r => setTimeout(r, 2000));
    console.log(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    setFromAmount('');
    setIsSwapping(false);
    alert('Swap Successful!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-morphism p-6 rounded-3xl",
        "w-full max-sm:px-4 sm:w-[400px]",
        "flex flex-col gap-4 text-white"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Swap</h2>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Settings size={20} className="text-gray-400" />
        </button>
      </div>

      {/* From Input */}
      <div className="swap-input-container">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>From</span>
          <span>Balance: {fromToken.balance}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="bg-transparent text-2xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-2xl hover:bg-white/20 transition-colors shrink-0">
            <span className="font-medium">{fromToken.symbol}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Swap Icon */}
      <div className="relative h-2 flex justify-center items-center">
        <button 
          onClick={handleSwapToggle}
          className="absolute z-10 p-2 bg-[#1e293b] border-4 border-[#0f172a] rounded-xl hover:scale-110 active:rotate-180 transition-all text-blue-400"
        >
          <ArrowDown size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* To Input */}
      <div className="swap-input-container">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>To</span>
          <span>Balance: {toToken.balance}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="bg-transparent text-2xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none opacity-80"
          />
          <button className="flex items-center gap-1 bg-blue-600/80 px-3 py-1.5 rounded-2xl hover:bg-blue-600 transition-colors shrink-0">
            <span className="font-medium text-white">{toToken.symbol}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={isConnecting || isSwapping}
        onClick={isConnected ? handleSwapAction : handleConnect}
        className={cn(
          "w-full py-4 mt-2 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98]",
          isConnected 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20"
            : "bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2",
          (isConnecting || isSwapping) && "opacity-80 cursor-wait"
        )}
      >
        <AnimatePresence mode="wait">
          {isConnecting || isSwapping ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="animate-spin" size={20} />
              {isConnecting ? "Connecting..." : "Swapping..."}
            </motion.div>
          ) : !isConnected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Wallet size={20} />
              Connect Wallet
            </motion.div>
          ) : (
            <motion.span
              key="swap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Swap
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Footer / Price Impact */}
      <div className="mt-2 flex flex-col gap-1 px-1">
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>Price Impact</span>
          <span className={cn(
            priceImpact > 5 ? "text-red-400" : priceImpact > 0 ? "text-green-400" : "text-gray-500"
          )}>
            {priceImpact > 0 ? `${priceImpact.toFixed(2)}%` : '0%'}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 italic mt-0.5">
          <span>Slippage Tolerance</span>
          <span>1.0%</span>
        </div>
      </div>
    </motion.div>
  );
};
