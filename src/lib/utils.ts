// /Users/parthkaran/Documents/claude_projects/liquidswap/src/lib/utils.ts

export function formatToken(amount: number, decimals = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatXLM(amount: number): string {
  return `${formatToken(amount)} XLM`;
}

export function formatGKT(amount: number): string {
  return `${formatToken(amount)} GKT`;
}

export function formatPercent(value: number, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function truncateAddress(address: string): string {
  if (!address || typeof address !== 'string') return '';
  if (address.length <= 8) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

export function formatUSD(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export function debounce<T extends Function>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  } as any;
}

export function stellarExpertTx(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function stellarExpertAccount(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}
